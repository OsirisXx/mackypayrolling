// Import Feb 13-19 data - Fixed version
// Creates attendance records based on days from Excel

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importFeb13_19() {
  console.log('='.repeat(80));
  console.log('IMPORTING FEB 13-19 DATA (v2)');
  console.log('='.repeat(80));

  // Read extracted data
  const data = fs.readFileSync('feb_13_19_data.txt', 'utf-8');
  const lines = data.split('\n').slice(1).filter(l => l.trim());
  
  const workers = lines.map(line => {
    const [name, days, ot_hours, daily_rate, bonus, sss, total] = line.split('|');
    return { name, days: parseInt(days), ot_hours: parseInt(ot_hours), daily_rate: parseInt(daily_rate), bonus: parseInt(bonus), sss: parseInt(sss), total: parseFloat(total) };
  });

  console.log(`\nWorkers to import: ${workers.length}`);
  console.log(`Expected Grand Total: ₱${workers.reduce((sum, w) => sum + w.total, 0).toLocaleString()}`);

  // Get all workers from database first
  const { data: dbWorkers, error: wError } = await supabase.from('workers').select('id, full_name');
  
  if (wError || !dbWorkers) {
    console.error('ERROR: Cannot access workers table:', wError);
    return;
  }
  
  console.log(`\nDatabase has ${dbWorkers.length} workers`);

  // Get admin user
  const { data: adminUsers } = await supabase.from('users').select('id').limit(1);
  const adminId = adminUsers?.[0]?.id;
  
  if (!adminId) {
    console.error('ERROR: No admin user found');
    return;
  }
  
  console.log(`Admin ID: ${adminId}`);

  // Clear existing Feb 13-19 data
  console.log('\nClearing existing Feb 13-19 data...');
  await supabase.from('attendance').delete().gte('clock_in', '2026-02-13').lt('clock_in', '2026-02-20');
  await supabase.from('payroll_adjustments').delete().eq('period_start', '2026-02-13').eq('period_end', '2026-02-19');

  let success = 0, failed = 0;

  for (const worker of workers) {
    // Find worker in database by matching name parts
    const nameParts = worker.name.replace(/,/g, ' ').trim().toLowerCase().split(/\s+/).filter(p => p.length > 1);
    
    const dbWorker = dbWorkers.find(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part)) || 
             nameParts.slice(0, 2).every(part => dbName.includes(part));
    });

    if (!dbWorker) {
      console.log(`✗ Not found: ${worker.name}`);
      failed++;
      continue;
    }

    // Create attendance records for each day
    const attendanceRecords = [];
    const otPerDay = worker.days > 0 ? Math.round((worker.ot_hours / worker.days) * 10) / 10 : 0;
    
    for (let d = 0; d < worker.days; d++) {
      const date = new Date('2026-02-13');
      date.setDate(date.getDate() + d);
      
      attendanceRecords.push({
        worker_id: dbWorker.id,
        clock_in: date.toISOString().split('T')[0] + 'T08:00:00',
        clock_out: date.toISOString().split('T')[0] + 'T17:00:00',
        hours_worked: 8,
        overtime_hours: otPerDay,
        status: 'completed_quota',
        scanned_by: adminId
      });
    }

    const { error: attErr } = await supabase.from('attendance').insert(attendanceRecords);
    
    if (attErr) {
      console.log(`✗ Failed: ${worker.name} - ${attErr.message}`);
      failed++;
      continue;
    }

    // Insert bonus/SSS if applicable
    if (worker.bonus > 0 || worker.sss > 0) {
      await supabase.from('payroll_adjustments').insert({
        worker_id: dbWorker.id,
        period_start: '2026-02-13',
        period_end: '2026-02-19',
        bonus: worker.bonus,
        sss_deduction: worker.sss
      });
    }

    success++;
    if (success % 10 === 0) console.log(`  Imported ${success}/${workers.length}...`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`DONE: ${success} success, ${failed} failed`);
  console.log('='.repeat(80));

  // Verify
  const { count: attCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).gte('clock_in', '2026-02-13').lt('clock_in', '2026-02-20');
  const { count: adjCount } = await supabase.from('payroll_adjustments').select('*', { count: 'exact', head: true }).eq('period_start', '2026-02-13');
  
  console.log(`\nVerification: ${attCount} attendance records, ${adjCount} adjustments`);
  console.log('Refresh payroll page for Feb 13-19!');
}

importFeb13_19().catch(console.error);
