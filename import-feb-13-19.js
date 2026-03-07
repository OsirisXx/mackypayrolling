// Import Feb 13-19 data directly to Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importFeb13_19() {
  console.log('='.repeat(80));
  console.log('IMPORTING FEB 13-19 DATA');
  console.log('='.repeat(80));

  // Read the extracted data
  const data = fs.readFileSync('feb_13_19_data.txt', 'utf-8');
  const lines = data.split('\n').slice(1); // Skip header
  
  const workers = [];
  for (const line of lines) {
    const parts = line.trim().split('|');
    if (parts.length === 7) {
      workers.push({
        name: parts[0],
        days: parseInt(parts[1]),
        ot_hours: parseInt(parts[2]),
        daily_rate: parseInt(parts[3]),
        bonus: parseInt(parts[4]),
        sss: parseInt(parts[5]),
        total: parseFloat(parts[6])
      });
    }
  }

  console.log(`\nFound ${workers.length} workers to import`);
  console.log(`Grand Total: ₱${workers.reduce((sum, w) => sum + w.total, 0).toLocaleString()}`);

  // Get admin user ID - must be a valid user ID for foreign key
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  if (userError || !users || users.length === 0) {
    console.error('ERROR: Cannot find admin user. Make sure you ran grant-permissions.sql');
    console.error('Error:', userError);
    return;
  }
  
  const adminId = users[0].id;
  console.log(`Using admin ID: ${adminId}`);

  console.log('\nStep 1: Clearing existing Feb 13-19 data...');
  
  // Delete existing attendance
  await supabase
    .from('attendance')
    .delete()
    .gte('clock_in', '2026-02-13')
    .lt('clock_in', '2026-02-20');

  // Delete existing adjustments
  await supabase
    .from('payroll_adjustments')
    .delete()
    .eq('period_start', '2026-02-13')
    .eq('period_end', '2026-02-19');

  console.log('✓ Cleared existing data');

  console.log('\nStep 2: Inserting attendance for all workers...');
  
  let successCount = 0;
  let failCount = 0;

  for (const worker of workers) {
    // Find worker by name - try exact match first, then fuzzy
    let workerData = null;
    
    // Try exact match
    const { data: exactMatch } = await supabase
      .from('workers')
      .select('id, full_name')
      .ilike('full_name', worker.name)
      .limit(1)
      .maybeSingle();
    
    if (exactMatch) {
      workerData = exactMatch;
    } else {
      // Try fuzzy match with first and last name
      const nameParts = worker.name.replace(',', '').trim().split(/\s+/).filter(p => p.length > 1);
      if (nameParts.length >= 2) {
        const { data: fuzzyMatch } = await supabase
          .from('workers')
          .select('id, full_name')
          .ilike('full_name', `%${nameParts[0]}%${nameParts[1]}%`)
          .limit(1)
          .maybeSingle();
        
        workerData = fuzzyMatch;
      }
    }

    if (!workerData) {
      console.log(`✗ Worker not found: ${worker.name}`);
      failCount++;
      continue;
    }

    // Insert attendance records
    const attendanceRecords = [];
    const otPerDay = worker.days > 0 ? worker.ot_hours / worker.days : 0;
    
    for (let day = 0; day < worker.days; day++) {
      const date = new Date('2026-02-13');
      date.setDate(date.getDate() + day);
      
      attendanceRecords.push({
        worker_id: workerData.id,
        clock_in: date.toISOString(),
        clock_out: new Date(date.getTime() + 17 * 60 * 60 * 1000).toISOString(),
        hours_worked: 8,
        overtime_hours: Math.round(otPerDay * 10) / 10,
        status: 'completed_quota',
        scanned_by: adminId
      });
    }

    const { error: attError } = await supabase
      .from('attendance')
      .insert(attendanceRecords);

    if (attError) {
      console.log(`✗ Failed to insert attendance for ${worker.name}: ${attError.message}`);
      failCount++;
      continue;
    }

    // Insert bonus/SSS if applicable
    if (worker.bonus > 0 || worker.sss > 0) {
      const { error: adjError } = await supabase
        .from('payroll_adjustments')
        .insert({
          worker_id: workerData.id,
          period_start: '2026-02-13',
          period_end: '2026-02-19',
          bonus: worker.bonus,
          sss_deduction: worker.sss
        });

      if (adjError) {
        console.log(`✗ Failed to insert adjustment for ${worker.name}: ${adjError.message}`);
      }
    }

    successCount++;
    if (successCount % 10 === 0) {
      console.log(`  Processed ${successCount}/${workers.length} workers...`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✓ Import complete!`);
  console.log(`  Success: ${successCount} workers`);
  console.log(`  Failed: ${failCount} workers`);
  console.log('='.repeat(80));

  // Verify
  const { data: attCount } = await supabase
    .from('attendance')
    .select('id', { count: 'exact', head: true })
    .gte('clock_in', '2026-02-13')
    .lt('clock_in', '2026-02-20');

  const { data: adjCount } = await supabase
    .from('payroll_adjustments')
    .select('id', { count: 'exact', head: true })
    .eq('period_start', '2026-02-13');

  console.log(`\nVerification:`);
  console.log(`  Attendance records: ${attCount?.length || 0}`);
  console.log(`  Adjustment records: ${adjCount?.length || 0}`);
  console.log('\nRefresh the payroll page to see the data!');
}

importFeb13_19().catch(console.error);
