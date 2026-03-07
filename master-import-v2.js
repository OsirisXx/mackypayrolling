// MASTER IMPORT V2: Fix OT precision, add missing workers with qr_code, verify
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const payrollData = JSON.parse(fs.readFileSync('payroll_data.json', 'utf-8'));

  // ============================================================
  // STEP 3: Add missing workers (with qr_code)
  // ============================================================
  console.log('='.repeat(80));
  console.log('STEP 3: ADDING MISSING WORKERS');
  console.log('='.repeat(80));

  const { data: existingWorkers } = await supabase.from('workers').select('full_name');
  const existingNames = new Set(existingWorkers.map(w => w.full_name.toLowerCase()));

  // Collect all unique workers from Excel
  const allExcelWorkers = new Map();
  for (const period of Object.values(payrollData)) {
    for (const w of period.workers) {
      if (!allExcelWorkers.has(w.name)) {
        allExcelWorkers.set(w.name, w.daily_rate);
      }
    }
  }

  let added = 0;
  for (const [name, rate] of allExcelWorkers) {
    // Check if already in DB
    const nameParts = name.replace(/,/g, ' ').trim().toLowerCase().split(/\s+/).filter(p => p.length > 1);
    const found = existingWorkers.find(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part)) ||
             (nameParts.length >= 2 && nameParts.slice(0, 2).every(part => dbName.includes(part)));
    });

    if (found) continue;

    const empId = 'EMP' + String(100 + added).padStart(3, '0');
    const qrCode = crypto.randomUUID();

    const { error } = await supabase.from('workers').insert({
      employee_id: empId,
      full_name: name,
      daily_rate: rate,
      hourly_rate: rate / 8,
      is_active: true,
      standard_hours: 8,
      qr_code: qrCode
    });

    if (error) {
      console.log(`  FAILED: "${name}" - ${error.message}`);
    } else {
      console.log(`  Added: "${name}" (${empId}, rate=${rate})`);
      added++;
    }
  }

  // Re-fetch all workers
  const { data: allWorkers } = await supabase.from('workers').select('id, full_name, daily_rate, hourly_rate');
  console.log(`\nTotal workers in DB: ${allWorkers.length}`);

  function findWorker(excelName) {
    // Try exact match first
    const exact = allWorkers.find(dw => dw.full_name.toLowerCase() === excelName.toLowerCase());
    if (exact) return exact;

    // Try normalized match (remove extra spaces/commas)
    const normalized = excelName.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const normMatch = allWorkers.find(dw => {
      const dbNorm = dw.full_name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      return dbNorm === normalized;
    });
    if (normMatch) return normMatch;

    // Fuzzy match - all parts must match, pick best (shortest name = most specific)
    const nameParts = normalized.split(/\s+/).filter(p => p.length > 1);
    const candidates = allWorkers.filter(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part));
    });
    
    if (candidates.length === 1) return candidates[0];
    if (candidates.length > 1) {
      // Pick the one with the shortest name (most specific match)
      candidates.sort((a, b) => a.full_name.length - b.full_name.length);
      return candidates[0];
    }

    // Try first 2 parts only
    if (nameParts.length >= 2) {
      const twoPartMatch = allWorkers.find(dw => {
        const dbName = dw.full_name.toLowerCase();
        return nameParts.slice(0, 2).every(part => dbName.includes(part)) && 
               !allWorkers.some(other => other.id !== dw.id && 
                 nameParts.slice(0, 2).every(part => other.full_name.toLowerCase().includes(part)));
      });
      if (twoPartMatch) return twoPartMatch;
    }

    return null;
  }

  // ============================================================
  // STEP 4: CLEAR AND RE-IMPORT ALL DATA
  // The key fix: use EXACT OT hours from Excel ot_pay / hourly_rate
  // so frontend calculation matches exactly
  // Frontend: overtimePay = overtime_hours * hourly_rate
  // So: overtime_hours = ot_pay / hourly_rate
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 4: CLEAR AND RE-IMPORT ALL DATA');
  console.log('='.repeat(80));

  const { data: users } = await supabase.from('users').select('id').limit(1);
  const adminId = users[0].id;

  for (const [key, period] of Object.entries(payrollData)) {
    console.log(`\n--- Importing ${key} (${period.start} to ${period.end}) ---`);

    // Clear existing data
    const nextDay = new Date(period.end);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    await supabase.from('attendance').delete().gte('clock_in', period.start).lt('clock_in', nextDayStr);
    await supabase.from('payroll_adjustments').delete().eq('period_start', period.start).eq('period_end', period.end);

    let success = 0, failed = 0;

    for (const worker of period.workers) {
      const dbWorker = findWorker(worker.name);
      if (!dbWorker) {
        console.log(`  NOT FOUND: "${worker.name}"`);
        failed++;
        continue;
      }

      // CRITICAL: Calculate exact OT hours that will reproduce Excel's OT pay
      // Frontend does: overtimePay = totalOTHours * hourlyRate
      // So totalOTHours = ot_pay / hourlyRate
      const exactTotalOTHours = dbWorker.hourly_rate > 0 ? worker.ot_pay / dbWorker.hourly_rate : 0;

      // Distribute across days
      const attendanceRecords = [];
      const days = Math.min(worker.days, 7); // Max 7 days in a week period

      for (let d = 0; d < days; d++) {
        const date = new Date(period.start);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];

        // Put all OT on first record, 0 on rest - simpler and exact
        attendanceRecords.push({
          worker_id: dbWorker.id,
          clock_in: dateStr + 'T08:00:00',
          clock_out: dateStr + 'T17:00:00',
          hours_worked: 8,
          overtime_hours: d === 0 ? exactTotalOTHours : 0,
          status: 'completed_quota',
          scanned_by: adminId
        });
      }

      // Handle workers with more than 7 days (store extra records on last day with different time)
      // Frontend counts records, not unique dates, so this works
      if (worker.days > 7) {
        const extraDays = worker.days - 7;
        const lastDate = new Date(period.end);
        const lastDateStr = lastDate.toISOString().split('T')[0];
        
        for (let d = 0; d < extraDays; d++) {
          attendanceRecords.push({
            worker_id: dbWorker.id,
            clock_in: lastDateStr + `T${20 + d}:00:00`,
            clock_out: lastDateStr + `T${21 + d}:00:00`,
            hours_worked: 8,
            overtime_hours: 0,
            status: 'completed_quota',
            scanned_by: adminId
          });
        }
      }

      const { error: attErr } = await supabase.from('attendance').insert(attendanceRecords);
      if (attErr) {
        console.log(`  FAILED: "${worker.name}" - ${attErr.message}`);
        failed++;
        continue;
      }

      // Insert bonus/SSS
      if (worker.bonus > 0 || worker.sss > 0) {
        await supabase.from('payroll_adjustments').insert({
          worker_id: dbWorker.id,
          period_start: period.start,
          period_end: period.end,
          bonus: worker.bonus,
          sss_deduction: worker.sss
        });
      }

      success++;
    }

    console.log(`  Result: ${success}/${period.workers.length} success, ${failed} failed`);
  }

  // ============================================================
  // STEP 5: VERIFY DATABASE MATCHES EXCEL
  // ============================================================
  console.log('\n' + '='.repeat(80));
  console.log('STEP 5: VERIFY DATABASE VS EXCEL');
  console.log('='.repeat(80));

  for (const [key, period] of Object.entries(payrollData)) {
    console.log(`\n--- ${key} ---`);

    const nextDay = new Date(period.end);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const { data: att } = await supabase.from('attendance').select('*')
      .gte('clock_in', period.start).lt('clock_in', nextDayStr)
      .in('status', ['clocked_out', 'completed_quota']);

    const { data: adj } = await supabase.from('payroll_adjustments').select('*')
      .eq('period_start', period.start).eq('period_end', period.end);

    let dbSubtotal = 0, dbSSS = 0;
    let mismatches = [];

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

      if (Math.abs(total - excelWorker.total) > 0.5) {
        mismatches.push({
          name: excelWorker.name,
          excel: excelWorker.total,
          db: Math.round(total * 100) / 100,
          diff: Math.round((total - excelWorker.total) * 100) / 100,
          eDays: excelWorker.days, dDays: days,
          eOT: excelWorker.ot_pay, dOT: Math.round(otPay * 100) / 100
        });
      }
    }

    const dbGrandTotal = dbSubtotal - dbSSS;
    const match = Math.abs(dbGrandTotal - period.grand_total) < 1;

    console.log(`  Excel: Subtotal=${period.subtotal.toLocaleString()} | SSS=${period.total_sss} | Grand=${period.grand_total.toLocaleString()}`);
    console.log(`  DB:    Subtotal=${Math.round(dbSubtotal * 100) / 100} | SSS=${dbSSS} | Grand=${Math.round(dbGrandTotal * 100) / 100}`);
    console.log(`  MATCH: ${match ? 'YES ✓' : 'NO ✗'} (diff: ${Math.round((dbGrandTotal - period.grand_total) * 100) / 100})`);

    if (mismatches.length > 0) {
      console.log(`  Mismatched workers (${mismatches.length}):`);
      for (const m of mismatches.slice(0, 5)) {
        console.log(`    "${m.name}": Excel=${m.excel} DB=${m.db} diff=${m.diff} | Days E=${m.eDays} D=${m.dDays} | OTPay E=${m.eOT} D=${m.dOT}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(80));
}

main().catch(console.error);
