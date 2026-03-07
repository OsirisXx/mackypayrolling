// Import ALL workers (including 0-day) for all 3 periods
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const allData = JSON.parse(fs.readFileSync('payroll_data_all.json', 'utf-8'));

  // ========== STEP 1: Add missing workers ==========
  console.log('='.repeat(80));
  console.log('STEP 1: ADD MISSING WORKERS');
  console.log('='.repeat(80));

  let { data: existingWorkers } = await supabase.from('workers').select('id, full_name, daily_rate, hourly_rate');

  function findWorker(excelName, workerList) {
    const exact = workerList.find(dw => dw.full_name.toLowerCase() === excelName.toLowerCase());
    if (exact) return exact;
    const normalized = excelName.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const normMatch = workerList.find(dw => dw.full_name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() === normalized);
    if (normMatch) return normMatch;
    const nameParts = normalized.split(/\s+/).filter(p => p.length > 1);
    const candidates = workerList.filter(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part));
    });
    if (candidates.length === 1) return candidates[0];
    if (candidates.length > 1) {
      candidates.sort((a, b) => a.full_name.length - b.full_name.length);
      return candidates[0];
    }
    return null;
  }

  // Collect all unique workers
  const allExcelWorkers = new Map();
  for (const period of Object.values(allData)) {
    for (const w of period.workers) {
      if (!allExcelWorkers.has(w.name)) {
        allExcelWorkers.set(w.name, w.daily_rate);
      }
    }
  }

  let added = 0;
  for (const [name, rate] of allExcelWorkers) {
    if (!findWorker(name, existingWorkers)) {
      const empId = 'EMP' + String(300 + added).padStart(3, '0');
      const { data: newWorker, error } = await supabase.from('workers').insert({
        employee_id: empId,
        full_name: name,
        daily_rate: rate,
        hourly_rate: rate / 8,
        is_active: true,
        standard_hours: 8,
        qr_code: crypto.randomUUID()
      }).select().single();

      if (error) {
        console.log(`  FAILED: "${name}" - ${error.message}`);
      } else {
        console.log(`  Added: "${name}" (rate=${rate})`);
        existingWorkers.push(newWorker);
        added++;
      }
    }
  }
  console.log(`Total workers in DB: ${existingWorkers.length} (added ${added} new)`);

  // Get admin user
  const { data: users } = await supabase.from('users').select('id').limit(1);
  const adminId = users[0].id;

  // ========== STEP 2: Import each period ==========
  console.log('\n' + '='.repeat(80));
  console.log('STEP 2: IMPORT ALL PERIODS');
  console.log('='.repeat(80));

  for (const [key, period] of Object.entries(allData)) {
    console.log(`\n--- ${key} (${period.start} to ${period.end}) ---`);
    console.log(`  Workers: ${period.workers.length} | Expected Grand Total: ${period.grand_total.toLocaleString()}`);

    // Clear existing data
    const nextDay = new Date(period.end);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    await supabase.from('attendance').delete().gte('clock_in', period.start).lt('clock_in', nextDayStr);
    await supabase.from('payroll_adjustments').delete().eq('period_start', period.start).eq('period_end', period.end);

    let success = 0, failed = 0;

    for (const worker of period.workers) {
      const dbWorker = findWorker(worker.name, existingWorkers);
      if (!dbWorker) {
        console.log(`  NOT FOUND: "${worker.name}"`);
        failed++;
        continue;
      }

      // Rate difference adjustment
      const rateDiff = (worker.daily_rate - dbWorker.daily_rate) * worker.days;
      const adjustedBonus = worker.bonus + rateDiff;

      if (worker.days > 0) {
        // Calculate exact OT hours using DB hourly rate
        const exactTotalOTHours = dbWorker.hourly_rate > 0 ? worker.ot_pay / dbWorker.hourly_rate : 0;

        const attendanceRecords = [];
        const days = Math.min(worker.days, 7);

        for (let d = 0; d < days; d++) {
          const date = new Date(period.start);
          date.setDate(date.getDate() + d);
          const dateStr = date.toISOString().split('T')[0];

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

        // Extra days beyond 7
        if (worker.days > 7) {
          const extraDays = worker.days - 7;
          const lastDateStr = period.end;
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
      }

      // ALWAYS insert payroll_adjustments for ALL workers (even 0-day)
      // This ensures 0-day workers show up in the frontend
      await supabase.from('payroll_adjustments').insert({
        worker_id: dbWorker.id,
        period_start: period.start,
        period_end: period.end,
        bonus: adjustedBonus,
        sss_deduction: worker.sss
      });

      success++;
    }

    console.log(`  Result: ${success}/${period.workers.length} success, ${failed} failed`);
  }

  // ========== STEP 3: Verify ==========
  console.log('\n' + '='.repeat(80));
  console.log('STEP 3: VERIFY ALL PERIODS');
  console.log('='.repeat(80));

  for (const [key, period] of Object.entries(allData)) {
    console.log(`\n--- ${key} ---`);

    const nextDay = new Date(period.end);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const { data: att } = await supabase.from('attendance').select('*')
      .gte('clock_in', period.start).lt('clock_in', nextDayStr)
      .in('status', ['clocked_out', 'completed_quota']);
    const { data: adj } = await supabase.from('payroll_adjustments').select('*')
      .eq('period_start', period.start).eq('period_end', period.end);

    let dbSubtotal = 0, dbSSS = 0, mismatches = [], workerCount = 0;

    for (const w of period.workers) {
      const dbWorker = findWorker(w.name, existingWorkers);
      if (!dbWorker) continue;
      workerCount++;

      const wAtt = (att || []).filter(a => a.worker_id === dbWorker.id);
      const days = wAtt.length;
      const totalOT = wAtt.reduce((s, a) => s + (a.overtime_hours || 0), 0);
      const basePay = days * dbWorker.daily_rate;
      const otPay = totalOT * dbWorker.hourly_rate;
      const wAdj = (adj || []).find(a => a.worker_id === dbWorker.id);
      const bonus = wAdj?.bonus || 0;
      const sss = wAdj?.sss_deduction || 0;
      const subtotal = basePay + otPay + bonus;
      const total = subtotal - sss;
      dbSubtotal += subtotal;
      dbSSS += sss;

      if (Math.abs(total - w.total) > 0.5) {
        mismatches.push({ name: w.name, excel: w.total, db: Math.round(total * 100) / 100, eDays: w.days, dDays: days });
      }
    }

    const dbGrand = dbSubtotal - dbSSS;
    const match = Math.abs(dbGrand - period.grand_total) < 1;
    console.log(`  Workers: ${workerCount}/${period.workers.length} | Adj records: ${(adj||[]).length}`);
    console.log(`  Excel: Subtotal=${period.subtotal.toLocaleString()} | SSS=${period.total_sss} | Grand=${period.grand_total.toLocaleString()}`);
    console.log(`  DB:    Subtotal=${Math.round(dbSubtotal * 100) / 100} | SSS=${dbSSS} | Grand=${Math.round(dbGrand * 100) / 100}`);
    console.log(`  MATCH: ${match ? 'YES ✓' : 'NO ✗'} (diff: ${Math.round((dbGrand - period.grand_total) * 100) / 100})`);
    if (mismatches.length > 0) {
      console.log(`  Mismatches (${mismatches.length}):`);
      mismatches.forEach(m => console.log(`    "${m.name}": Excel=${m.excel} DB=${m.db} | Days E=${m.eDays} D=${m.dDays}`));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('DONE');
  console.log('='.repeat(80));
}

main().catch(console.error);
