// Import all payroll data from extracted Excel files
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function importPeriod(dataFile, periodStart, periodEnd, periodName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`IMPORTING ${periodName}`);
  console.log(`Period: ${periodStart} to ${periodEnd}`);
  console.log('='.repeat(80));

  // Read data
  const data = fs.readFileSync(dataFile, 'utf-8');
  const lines = data.split('\n').slice(1).filter(l => l.trim());
  
  const workers = lines.map(line => {
    const [name, days, ot_hours, daily_rate, bonus, sss, total] = line.split('|');
    return { 
      name, 
      days: parseInt(days), 
      ot_hours: parseInt(ot_hours), 
      daily_rate: parseInt(daily_rate), 
      bonus: parseInt(bonus), 
      sss: parseInt(sss), 
      total: parseFloat(total) 
    };
  });

  console.log(`Workers: ${workers.length}`);
  console.log(`Expected Total: ${workers.reduce((s, w) => s + w.total, 0).toLocaleString()}`);

  // Get database workers
  const { data: dbWorkers } = await supabase.from('workers').select('id, full_name');
  if (!dbWorkers) {
    console.error('Cannot access workers table');
    return;
  }

  // Get admin user
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const adminId = users?.[0]?.id;
  if (!adminId) {
    console.error('No admin user found');
    return;
  }

  // Clear existing data for this period
  const nextDay = new Date(periodEnd);
  nextDay.setDate(nextDay.getDate() + 1);
  
  await supabase.from('attendance').delete()
    .gte('clock_in', periodStart)
    .lt('clock_in', nextDay.toISOString().split('T')[0]);
  
  await supabase.from('payroll_adjustments').delete()
    .eq('period_start', periodStart)
    .eq('period_end', periodEnd);

  let success = 0, failed = 0;

  for (const worker of workers) {
    // Find worker in database
    const nameParts = worker.name.replace(/,/g, ' ').trim().toLowerCase().split(/\s+/).filter(p => p.length > 1);
    
    const dbWorker = dbWorkers.find(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part)) || 
             (nameParts.length >= 2 && nameParts.slice(0, 2).every(part => dbName.includes(part)));
    });

    if (!dbWorker) {
      console.log(`  Not found: ${worker.name}`);
      failed++;
      continue;
    }

    // Create attendance records - distribute days within the period
    const attendanceRecords = [];
    const otPerDay = worker.days > 0 ? Math.round((worker.ot_hours / worker.days) * 10) / 10 : 0;
    const startDate = new Date(periodStart);
    
    for (let d = 0; d < worker.days && d < 7; d++) {
      const date = new Date(startDate);
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
      console.log(`  Failed: ${worker.name} - ${attErr.message}`);
      failed++;
      continue;
    }

    // Insert bonus/SSS
    if (worker.bonus > 0 || worker.sss > 0) {
      await supabase.from('payroll_adjustments').insert({
        worker_id: dbWorker.id,
        period_start: periodStart,
        period_end: periodEnd,
        bonus: worker.bonus,
        sss_deduction: worker.sss
      });
    }

    success++;
  }

  console.log(`\nResult: ${success} success, ${failed} failed`);
  return { success, failed };
}

async function main() {
  console.log('='.repeat(80));
  console.log('PAYROLL DATA IMPORT');
  console.log('='.repeat(80));

  // Import Feb 6-12
  await importPeriod('feb_6_12_data.txt', '2026-02-06', '2026-02-12', 'FEB 6-12, 2026');
  
  // Import Feb 13-19
  await importPeriod('feb_13_19_data.txt', '2026-02-13', '2026-02-19', 'FEB 13-19, 2026');

  console.log('\n' + '='.repeat(80));
  console.log('IMPORT COMPLETE - Refresh payroll page to verify');
  console.log('='.repeat(80));
}

main().catch(console.error);
