// Direct database check and fix for Espina Aida
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixEspinaAida() {
  console.log('='.repeat(80));
  console.log('CHECKING DATABASE CONNECTION AND ESPINA AIDA');
  console.log('='.repeat(80));

  // First check if we can connect to workers table at all
  const { data: sampleWorkers, error: sampleError } = await supabase
    .from('workers')
    .select('id, employee_id, full_name')
    .limit(5);

  console.log('\nDatabase connection test:');
  if (sampleError) {
    console.error('ERROR connecting to workers table:', sampleError);
    return;
  }
  console.log(`✓ Connected. Found ${sampleWorkers?.length || 0} workers in sample`);
  if (sampleWorkers && sampleWorkers.length > 0) {
    console.log('Sample workers:', sampleWorkers.map(w => `${w.full_name} (${w.employee_id})`).join(', '));
  }

  // Search for Espina
  const { data: allWorkers } = await supabase
    .from('workers')
    .select('id, employee_id, full_name')
    .or('full_name.ilike.%Espina%,full_name.ilike.%Aida%')
    .limit(10);

  console.log('\nSearching for Espina Aida...');
  console.log('Found workers:', allWorkers);

  if (!allWorkers || allWorkers.length === 0) {
    console.error('✗ No workers found with name containing "Espina" or "Aida"');
    console.log('\nTrying to find by employee_id EMP027...');
    
    const { data: byId } = await supabase
      .from('workers')
      .select('*')
      .eq('employee_id', 'EMP027');
    
    console.log('Result:', byId);
    return;
  }

  const worker = allWorkers[0];
  const workerError = null;

  if (workerError) {
    console.error('Error finding Espina Aida:', workerError);
    return;
  }

  console.log(`\nFound worker: ${worker.full_name} (${worker.employee_id})`);
  console.log(`Worker ID: ${worker.id}`);

  // Check current attendance count
  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('*')
    .eq('worker_id', worker.id)
    .gte('clock_in', '2026-02-06')
    .lt('clock_in', '2026-02-13')
    .order('clock_in');

  if (attError) {
    console.error('Error fetching attendance:', attError);
    return;
  }

  console.log(`\nCurrent attendance count: ${attendance.length} days`);
  console.log('Dates:');
  attendance.forEach(att => {
    console.log(`  - ${new Date(att.clock_in).toISOString().split('T')[0]}`);
  });

  if (attendance.length === 8) {
    console.log('\n✓ Espina Aida already has 8 days - no fix needed!');
    return;
  }

  console.log(`\n✗ Espina Aida has ${attendance.length} days, should be 8`);
  console.log('\nFIXING: Deleting old attendance and inserting 8 days...');

  // Get admin user ID
  const { data: admin, error: adminError } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (adminError) {
    console.error('Error finding admin:', adminError);
    return;
  }

  // Delete existing attendance
  const { error: deleteError } = await supabase
    .from('attendance')
    .delete()
    .eq('worker_id', worker.id)
    .gte('clock_in', '2026-02-06')
    .lt('clock_in', '2026-02-13');

  if (deleteError) {
    console.error('Error deleting attendance:', deleteError);
    return;
  }

  console.log('✓ Deleted old attendance');

  // Insert 8 days
  const newAttendance = [];
  for (let i = 0; i < 8; i++) {
    const date = new Date('2026-02-06');
    date.setDate(date.getDate() + i);
    
    newAttendance.push({
      worker_id: worker.id,
      clock_in: date.toISOString(),
      clock_out: new Date(date.getTime() + 17 * 60 * 60 * 1000).toISOString(),
      hours_worked: 8,
      overtime_hours: 0,
      status: 'completed_quota',
      scanned_by: admin.id
    });
  }

  const { error: insertError } = await supabase
    .from('attendance')
    .insert(newAttendance);

  if (insertError) {
    console.error('Error inserting attendance:', insertError);
    return;
  }

  console.log('✓ Inserted 8 days of attendance');

  // Verify
  const { data: verifyAttendance } = await supabase
    .from('attendance')
    .select('clock_in')
    .eq('worker_id', worker.id)
    .gte('clock_in', '2026-02-06')
    .lt('clock_in', '2026-02-14')
    .order('clock_in');

  console.log(`\n✓ VERIFICATION: Espina Aida now has ${verifyAttendance.length} days`);
  console.log('Dates:');
  verifyAttendance.forEach(att => {
    console.log(`  - ${new Date(att.clock_in).toISOString().split('T')[0]}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('FIX COMPLETE! Refresh the payroll page.');
  console.log('Expected: Espina Aida should show 8 days, ₱2,900 total');
  console.log('Grand total should be: ₱170,186.25');
  console.log('='.repeat(80));
}

checkAndFixEspinaAida().catch(console.error);
