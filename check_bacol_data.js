import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dmRwYm9pd3VuZ3dlcnN3bGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NDI3NTAsImV4cCI6MjA1MTExODc1MH0.sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBacolData() {
  console.log('=== Checking Bacol, Vivian Data ===\n');
  
  // 1. Get worker ID
  const { data: workers, error: workerError } = await supabase
    .from('workers')
    .select('*')
    .ilike('full_name', '%Bacol%Vivian%');
  
  if (workerError) {
    console.error('Error fetching worker:', workerError);
    return;
  }
  
  if (!workers || workers.length === 0) {
    console.log('Worker not found');
    return;
  }
  
  const worker = workers[0];
  console.log('Worker found:', worker.full_name, 'ID:', worker.id);
  console.log('Daily Rate:', worker.daily_rate, 'Hourly Rate:', worker.hourly_rate);
  console.log('');
  
  // 2. Get attendance for Mar 20-26, 2026
  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('*')
    .eq('worker_id', worker.id)
    .gte('clock_in', '2026-03-20')
    .lte('clock_in', '2026-03-27')
    .in('status', ['clocked_out', 'completed_quota'])
    .order('clock_in', { ascending: true });
  
  if (attError) {
    console.error('Error fetching attendance:', attError);
    return;
  }
  
  console.log(`Found ${attendance?.length || 0} attendance records for Mar 20-26, 2026:`);
  if (attendance && attendance.length > 0) {
    attendance.forEach(att => {
      const clockIn = new Date(att.clock_in);
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][clockIn.getDay()];
      console.log(`  - ${clockIn.toISOString().split('T')[0]} (${dayOfWeek}): ${att.hours_worked}h worked, ${att.overtime_hours}h OT`);
    });
    
    const totalHours = attendance.reduce((sum, att) => sum + (att.hours_worked || 0), 0);
    const totalOT = attendance.reduce((sum, att) => sum + (att.overtime_hours || 0), 0);
    const days = Math.floor(totalHours / 8);
    console.log(`\nTotal: ${totalHours}h (${days} days), ${totalOT}h OT`);
  }
  console.log('');
  
  // 3. Check payroll_adjustments for this period
  const { data: adjustments, error: adjError } = await supabase
    .from('payroll_adjustments')
    .select('*')
    .eq('worker_id', worker.id)
    .eq('period_start', '2026-03-20')
    .eq('period_end', '2026-03-26');
  
  if (adjError) {
    console.error('Error fetching adjustments:', adjError);
    return;
  }
  
  console.log('Payroll adjustments for Mar 20-26:');
  if (adjustments && adjustments.length > 0) {
    adjustments.forEach(adj => {
      console.log('  Found adjustment:');
      console.log('    Days override:', adj.days_override);
      console.log('    OT override:', adj.ot_override);
      console.log('    Rate override:', adj.daily_rate_override);
      console.log('    Bonus:', adj.bonus);
      console.log('    SSS:', adj.sss_deduction);
      console.log('    Deduction:', adj.deduction);
    });
  } else {
    console.log('  No adjustments found for this period');
  }
  console.log('');
  
  // 4. Test Thursday calculation
  console.log('=== Testing Thursday-based week calculation ===');
  const testDate = new Date('2026-03-20'); // Thursday, Mar 20
  const dayOfWeek = testDate.getDay();
  console.log('Mar 20, 2026 is day', dayOfWeek, '(0=Sun, 4=Thu)');
  
  let daysToThursday;
  if (dayOfWeek === 0) {
    daysToThursday = 3;
  } else if (dayOfWeek < 4) {
    daysToThursday = dayOfWeek + 3;
  } else {
    daysToThursday = dayOfWeek - 4;
  }
  
  const thursday = new Date(testDate);
  thursday.setDate(testDate.getDate() - daysToThursday);
  const wednesday = new Date(thursday);
  wednesday.setDate(thursday.getDate() + 6);
  
  console.log('Calculated Thursday:', thursday.toISOString().split('T')[0]);
  console.log('Calculated Wednesday:', wednesday.toISOString().split('T')[0]);
  console.log('Period label would be:', `${thursday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${wednesday.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`);
}

checkBacolData().then(() => {
  console.log('\nDone!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
