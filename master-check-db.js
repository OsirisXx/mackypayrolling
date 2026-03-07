// Step 2: Check actual database structure
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  console.log('='.repeat(80));
  console.log('STEP 2: CHECK DATABASE STRUCTURE');
  console.log('='.repeat(80));

  // 1. Check workers table
  const { data: workers, error: wErr } = await supabase.from('workers').select('*');
  if (wErr) {
    console.error('ERROR workers:', wErr.message);
    return;
  }
  console.log(`\nWorkers table: ${workers.length} rows`);
  if (workers.length > 0) {
    console.log('Columns:', Object.keys(workers[0]).join(', '));
    console.log('\nAll workers:');
    workers.forEach((w, i) => {
      console.log(`  ${i+1}. "${w.full_name}" | rate=${w.daily_rate} | hourly=${w.hourly_rate} | id=${w.id.substring(0,8)}`);
    });
  }

  // 2. Check users table
  const { data: users, error: uErr } = await supabase.from('users').select('id, email, role');
  if (uErr) {
    console.error('ERROR users:', uErr.message);
  } else {
    console.log(`\nUsers table: ${users.length} rows`);
    users.forEach(u => console.log(`  ${u.email} (${u.role}) id=${u.id.substring(0,8)}`));
  }

  // 3. Check attendance table structure
  const { data: att, error: aErr } = await supabase.from('attendance').select('*').limit(1);
  if (aErr) {
    console.error('ERROR attendance:', aErr.message);
  } else {
    console.log(`\nAttendance table columns:`, att.length > 0 ? Object.keys(att[0]).join(', ') : 'EMPTY');
  }

  // 4. Check payroll_adjustments table structure
  const { data: adj, error: adjErr } = await supabase.from('payroll_adjustments').select('*').limit(1);
  if (adjErr) {
    console.error('ERROR payroll_adjustments:', adjErr.message);
  } else {
    console.log(`\nPayroll_adjustments table columns:`, adj.length > 0 ? Object.keys(adj[0]).join(', ') : 'EMPTY');
  }

  // 5. Load Excel data and find missing workers
  const payrollData = JSON.parse(fs.readFileSync('payroll_data.json', 'utf-8'));
  
  const allExcelNames = new Set();
  for (const period of Object.values(payrollData)) {
    for (const w of period.workers) {
      allExcelNames.add(w.name);
    }
  }

  console.log(`\nExcel has ${allExcelNames.size} unique worker names`);
  console.log(`Database has ${workers.length} workers`);

  // Match Excel names to DB names
  const dbNames = workers.map(w => w.full_name);
  const missing = [];
  const matched = {};
  
  for (const excelName of allExcelNames) {
    const nameParts = excelName.replace(/,/g, ' ').trim().toLowerCase().split(/\s+/).filter(p => p.length > 1);
    
    const dbWorker = workers.find(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part)) || 
             (nameParts.length >= 2 && nameParts.slice(0, 2).every(part => dbName.includes(part)));
    });

    if (dbWorker) {
      matched[excelName] = { dbName: dbWorker.full_name, dbId: dbWorker.id, dailyRate: dbWorker.daily_rate, hourlyRate: dbWorker.hourly_rate };
    } else {
      missing.push(excelName);
    }
  }

  console.log(`\nMatched: ${Object.keys(matched).length}`);
  console.log(`Missing: ${missing.length}`);
  
  if (missing.length > 0) {
    console.log('\nMISSING WORKERS (need to be added):');
    // Get their data from Excel
    for (const name of missing) {
      // Find in either period to get rate
      let rate = 400;
      for (const period of Object.values(payrollData)) {
        const w = period.workers.find(w => w.name === name);
        if (w) { rate = w.daily_rate; break; }
      }
      console.log(`  "${name}" | rate=${rate}`);
    }
  }

  // 6. Check rate mismatches between Excel and DB
  console.log('\nRATE MISMATCHES:');
  let rateMismatches = 0;
  for (const [excelName, match] of Object.entries(matched)) {
    // Find Excel rate for this worker
    for (const period of Object.values(payrollData)) {
      const w = period.workers.find(w => w.name === excelName);
      if (w && w.daily_rate !== match.dailyRate) {
        console.log(`  "${excelName}": Excel rate=${w.daily_rate}, DB rate=${match.dailyRate}`);
        rateMismatches++;
        break;
      }
    }
  }
  if (rateMismatches === 0) console.log('  None');

  // Save match results
  const results = { matched, missing, workers: workers.map(w => ({ id: w.id, name: w.full_name, daily_rate: w.daily_rate, hourly_rate: w.hourly_rate })) };
  fs.writeFileSync('db_check_results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to db_check_results.json');
}

checkDB().catch(console.error);
