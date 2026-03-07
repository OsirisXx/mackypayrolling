// Quick data verification script
// Run this with: node verify-data.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dmRwYm9pd3VuZ3dlcnN3bGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2MDc5NjQsImV4cCI6MjA1NTE4Mzk2NH0.kxEOoXJtGKJmxRFBDnMlVkNQcBiTf9xMhZDJQPqJyWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
  console.log('🔍 Verifying Database Data...\n');

  // Check users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role, full_name');
  
  console.log('👥 Users:', users?.length || 0);
  if (users && users.length > 0) {
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
  } else {
    console.log('   ❌ No users found!');
  }
  console.log('');

  // Check workers
  const { data: workers, error: workersError } = await supabase
    .from('workers')
    .select('employee_id, full_name, daily_rate, is_active')
    .eq('is_active', true)
    .order('employee_id');
  
  console.log('👷 Active Workers:', workers?.length || 0);
  if (workers && workers.length > 0) {
    console.log(`   First 5: ${workers.slice(0, 5).map(w => w.employee_id).join(', ')}`);
    console.log(`   Last 5: ${workers.slice(-5).map(w => w.employee_id).join(', ')}`);
  } else {
    console.log('   ❌ No workers found!');
  }
  console.log('');

  // Check attendance
  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('id, worker_id, clock_in, hours_worked, status');
  
  console.log('📋 Attendance Records:', attendance?.length || 0);
  if (attendance && attendance.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.clock_in.startsWith(today));
    console.log(`   Today's records: ${todayRecords.length}`);
    console.log(`   Total hours: ${attendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0).toFixed(1)}`);
  } else {
    console.log('   ❌ No attendance records found!');
  }
  console.log('');

  // Check payroll
  const { data: payroll, error: payrollError } = await supabase
    .from('payroll')
    .select('id, worker_id, days_worked, gross_pay, status');
  
  console.log('💰 Payroll Records:', payroll?.length || 0);
  if (payroll && payroll.length > 0) {
    const totalGross = payroll.reduce((sum, p) => sum + p.gross_pay, 0);
    console.log(`   Total gross pay: ₱${totalGross.toFixed(2)}`);
  } else {
    console.log('   ℹ️  No payroll generated yet (this is normal)');
  }
  console.log('');

  // Summary
  console.log('📊 Summary:');
  console.log(`   ✅ Users: ${users?.length || 0}`);
  console.log(`   ✅ Workers: ${workers?.length || 0}`);
  console.log(`   ✅ Attendance: ${attendance?.length || 0}`);
  console.log(`   ✅ Payroll: ${payroll?.length || 0}`);
  console.log('');

  if (!users || users.length === 0) {
    console.log('⚠️  ACTION REQUIRED: Create users first!');
    console.log('   Run: create-users-manually.sql');
  }
  if (!workers || workers.length === 0) {
    console.log('⚠️  ACTION REQUIRED: Insert workers!');
    console.log('   Run: test-data-commission-schedule.sql');
  }
  if (!attendance || attendance.length === 0) {
    console.log('⚠️  ACTION REQUIRED: Attendance data missing!');
    console.log('   Check if test-data-commission-schedule.sql ran successfully');
  }
}

verifyData().catch(console.error);
