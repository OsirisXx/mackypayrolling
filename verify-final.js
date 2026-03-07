// Final verification - uses same logic as PayrollPage.tsx (+2 day window)
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const payrollData = JSON.parse(fs.readFileSync('payroll_data.json', 'utf-8'));
  const { data: allWorkers } = await supabase.from('workers').select('id, full_name, daily_rate, hourly_rate');

  function findWorker(excelName) {
    const exact = allWorkers.find(dw => dw.full_name.toLowerCase() === excelName.toLowerCase());
    if (exact) return exact;
    const normalized = excelName.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    const normMatch = allWorkers.find(dw => {
      return dw.full_name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase() === normalized;
    });
    if (normMatch) return normMatch;
    const nameParts = normalized.split(/\s+/).filter(p => p.length > 1);
    const candidates = allWorkers.filter(dw => {
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

  console.log('='.repeat(80));
  console.log('FINAL VERIFICATION (using +2 day window like frontend)');
  console.log('='.repeat(80));

  for (const [key, period] of Object.entries(payrollData)) {
    console.log(`\n--- ${key} (${period.start} to ${period.end}) ---`);

    // Use date strings like the fixed PayrollPage.tsx (no timezone issues)
    const queryEnd = new Date(period.end);
    queryEnd.setDate(queryEnd.getDate() + 1);
    const queryEndStr = queryEnd.toISOString().split('T')[0];
    console.log(`  Query: >= ${period.start} AND < ${queryEndStr}`);

    const { data: att } = await supabase.from('attendance').select('*')
      .gte('clock_in', period.start)
      .lt('clock_in', queryEndStr)
      .in('status', ['clocked_out', 'completed_quota']);

    const { data: adj } = await supabase.from('payroll_adjustments').select('*')
      .eq('period_start', period.start).eq('period_end', period.end);

    let dbSubtotal = 0, dbSSS = 0;
    let mismatches = [];
    let matchCount = 0;

    for (const excelWorker of period.workers) {
      const dbWorker = findWorker(excelWorker.name);
      if (!dbWorker) {
        mismatches.push({ name: excelWorker.name, reason: 'NOT FOUND IN DB' });
        continue;
      }

      const workerAtt = (att || []).filter(a => a.worker_id === dbWorker.id);
      const days = workerAtt.length;
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
          excel: excelWorker.total, db: Math.round(total * 100) / 100,
          eDays: excelWorker.days, dDays: days,
          eOT: excelWorker.ot_pay, dOT: Math.round(otPay * 100) / 100
        });
      } else {
        matchCount++;
      }
    }

    const dbGrandTotal = dbSubtotal - dbSSS;
    const totalMatch = Math.abs(dbGrandTotal - period.grand_total) < 1;

    console.log(`  Excel: Subtotal=${period.subtotal.toLocaleString()} | SSS=${period.total_sss} | Grand=${period.grand_total.toLocaleString()}`);
    console.log(`  DB:    Subtotal=${Math.round(dbSubtotal * 100) / 100} | SSS=${dbSSS} | Grand=${Math.round(dbGrandTotal * 100) / 100}`);
    console.log(`  TOTAL MATCH: ${totalMatch ? 'YES ✓' : 'NO ✗'} (diff: ${Math.round((dbGrandTotal - period.grand_total) * 100) / 100})`);
    console.log(`  Workers matched: ${matchCount}/${period.workers.length}`);

    if (mismatches.length > 0) {
      console.log(`  Mismatches (${mismatches.length}):`);
      for (const m of mismatches) {
        if (m.reason) {
          console.log(`    "${m.name}": ${m.reason}`);
        } else {
          console.log(`    "${m.name}": Excel=${m.excel} DB=${m.db} | Days E=${m.eDays} D=${m.dDays} | OTPay E=${m.eOT} D=${m.dOT}`);
        }
      }
    }
  }
}

verify().catch(console.error);
