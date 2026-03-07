// MASTER IMPORT: Add missing workers, clear data, import everything, verify
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const payrollData = JSON.parse(fs.readFileSync('payroll_data.json', 'utf-8'));
  const dbCheck = JSON.parse(fs.readFileSync('db_check_results.json', 'utf-8'));

  // ============================================================
  // STEP 3: Add missing workers
  // ============================================================
  console.log('='.repeat(80));
  console.log('STEP 3: ADDING MISSING WORKERS');
  console.log('='.repeat(80));

  const missingWorkers = dbCheck.missing;
  console.log(`Missing workers to add: ${missingWorkers.length}`);

  for (const name of missingWorkers) {
    // Find rate from Excel data
    let rate = 400;
    for (const period of Object.values(payrollData)) {
      const w = period.workers.find(w => w.name === name);
      if (w) { rate = w.daily_rate; break; }
    }

    const empId = 'EMP' + String(70 + missingWorkers.indexOf(name)).padStart(3, '0');
    const { error } = await supabase.from('workers').insert({
      employee_id: empId,
      full_name: name,
      daily_rate: rate,
      hourly_rate: rate / 8,
      is_active: true,
      standard_hours: 8
    });

    if (error) {
      console.log(`  FAILED: "${name}" - ${error.message}`);
    } else {
      console.log(`  Added: "${name}" (${empId}, rate=${rate})`);
    }
  }

  // Re-fetch all workers
  const { data: allWorkers } = await supabase.from('workers').select('id, full_name, daily_rate, hourly_rate');
  console.log(`\nTotal workers in DB now: ${allWorkers.length}`);

  // Build name matcher
  function findWorker(excelName) {
    const nameParts = excelName.replace(/,/g, ' ').trim().toLowerCase().split(/\s+/).filter(p => p.length > 1);
    return allWorkers.find(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part)) ||
             (nameParts.length >= 2 && nameParts.slice(0, 2).every(part => dbName.includes(part)));
    });
  }

  // ============================================================
  // STEP 4: CLEAR AND RE-IMPORT ALL DATA
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 4: CLEAR AND RE-IMPORT ALL DATA');
  console.log('='.repeat(80));

  // Get admin user
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const adminId = users[0].id;
  console.log(`Admin ID: ${adminId}`);

  for (const [key, period] of Object.entries(payrollData)) {
    console.log(`\n--- Importing ${key} (${period.start} to ${period.end}) ---`);
    console.log(`Workers: ${period.workers.length}, Expected Grand Total: ${period.grand_total.toLocaleString()}`);

    // Clear existing data
    const nextDay = new Date(period.end);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    await supabase.from('attendance').delete().gte('clock_in', period.start).lt('clock_in', nextDayStr);
    await supabase.from('payroll_adjustments').delete().eq('period_start', period.start).eq('period_end', period.end);

    let success = 0, failed = 0, notFound = 0;

    for (const worker of period.workers) {
      const dbWorker = findWorker(worker.name);
      if (!dbWorker) {
        console.log(`  NOT FOUND: "${worker.name}"`);
        notFound++;
        continue;
      }

      // Create attendance records within period dates only
      const attendanceRecords = [];
      const otPerDay = worker.days > 0 ? Math.round((worker.ot_hours / worker.days) * 10) / 10 : 0;

      for (let d = 0; d < worker.days && d < 7; d++) {
        const date = new Date(period.start);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];

        attendanceRecords.push({
          worker_id: dbWorker.id,
          clock_in: dateStr + 'T08:00:00',
          clock_out: dateStr + 'T17:00:00',
          hours_worked: 8,
          overtime_hours: otPerDay,
          status: 'completed_quota',
          scanned_by: adminId
        });
      }

      // If worker has more than 7 days, add extra days within period
      if (worker.days > 7) {
        const extraDays = worker.days - 7;
        for (let d = 0; d < extraDays; d++) {
          const date = new Date(period.start);
          date.setDate(date.getDate() + d); // re-use early dates with different time
          const dateStr = date.toISOString().split('T')[0];

          attendanceRecords.push({
            worker_id: dbWorker.id,
            clock_in: dateStr + 'T20:00:00', // evening shift to avoid duplicate
            clock_out: dateStr + 'T23:00:00',
            hours_worked: 8,
            overtime_hours: otPerDay,
            status: 'completed_quota',
            scanned_by: adminId
          });
        }
      }

      const { error: attErr } = await supabase.from('attendance').insert(attendanceRecords);
      if (attErr) {
        console.log(`  FAILED attendance: "${worker.name}" - ${attErr.message}`);
        failed++;
        continue;
      }

      // Insert bonus/SSS if applicable
      if (worker.bonus > 0 || worker.sss > 0) {
        const { error: adjErr } = await supabase.from('payroll_adjustments').insert({
          worker_id: dbWorker.id,
          period_start: period.start,
          period_end: period.end,
          bonus: worker.bonus,
          sss_deduction: worker.sss
        });
        if (adjErr) {
          console.log(`  FAILED adjustment: "${worker.name}" - ${adjErr.message}`);
        }
      }

      success++;
    }

    console.log(`  Result: ${success} success, ${failed} failed, ${notFound} not found`);
  }

  // ============================================================
  // STEP 5: VERIFY DATABASE MATCHES EXCEL
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 5: VERIFY DATABASE VS EXCEL');
  console.log('='.repeat(80));

  for (const [key, period] of Object.entries(payrollData)) {
    console.log(`\n--- ${key} (${period.start} to ${period.end}) ---`);

    const nextDay = new Date(period.end);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    // Get attendance
    const { data: att } = await supabase.from('attendance').select('*')
      .gte('clock_in', period.start).lt('clock_in', nextDayStr)
      .in('status', ['clocked_out', 'completed_quota']);

    // Get adjustments
    const { data: adj } = await supabase.from('payroll_adjustments').select('*')
      .eq('period_start', period.start).eq('period_end', period.end);

    // Calculate per worker
    let dbSubtotal = 0;
    let dbSSS = 0;
    let workerMismatches = [];

    for (const excelWorker of period.workers) {
      const dbWorker = findWorker(excelWorker.name);
      if (!dbWorker) continue;

      const workerAtt = (att || []).filter(a => a.worker_id === dbWorker.id);
      const uniqueDays = new Set(workerAtt.map(a => a.clock_in.split('T')[0]));
      const days = uniqueDays.size;
      const totalOT = workerAtt.reduce((s, a) => s + (a.overtime_hours || 0), 0);

      const basePay = days * dbWorker.daily_rate;
      const otPay = totalOT * dbWorker.hourly_rate;
      
      const workerAdj = (adj || []).find(a => a.worker_id === dbWorker.id);
      const bonus = workerAdj?.bonus || 0;
      const sss = workerAdj?.sss_deduction || 0;

      const subtotal = basePay + otPay + bonus;
      const total = subtotal - sss;

      dbSubtotal += subtotal;
      dbSSS += sss;

      // Compare with Excel
      if (Math.abs(total - excelWorker.total) > 1) {
        workerMismatches.push({
          name: excelWorker.name,
          excelTotal: excelWorker.total,
          dbTotal: Math.round(total * 100) / 100,
          excelDays: excelWorker.days,
          dbDays: days,
          excelOT: excelWorker.ot_hours,
          dbOT: Math.round(totalOT * 10) / 10
        });
      }
    }

    const dbGrandTotal = dbSubtotal - dbSSS;

    console.log(`  Excel: Subtotal=${period.subtotal.toLocaleString()} | SSS=${period.total_sss} | Grand Total=${period.grand_total.toLocaleString()}`);
    console.log(`  DB:    Subtotal=${Math.round(dbSubtotal * 100) / 100} | SSS=${dbSSS} | Grand Total=${Math.round(dbGrandTotal * 100) / 100}`);
    console.log(`  Match: ${Math.abs(dbGrandTotal - period.grand_total) < 1 ? 'YES' : 'NO - MISMATCH'}`);

    if (workerMismatches.length > 0) {
      console.log(`  Worker mismatches (${workerMismatches.length}):`);
      for (const m of workerMismatches.slice(0, 10)) {
        console.log(`    "${m.name}": Excel=${m.excelTotal} DB=${m.dbTotal} | Days: E=${m.excelDays} DB=${m.dbDays} | OT: E=${m.excelOT} DB=${m.dbOT}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('DONE');
  console.log('='.repeat(80));
}

main().catch(console.error);
