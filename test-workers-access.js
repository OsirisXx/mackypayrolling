// Test if we can access workers table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAccess() {
  console.log('Testing workers table access...\n');
  
  // Try to get any workers
  const { data, error } = await supabase
    .from('workers')
    .select('id, full_name, employee_id')
    .limit(5);
  
  if (error) {
    console.error('ERROR accessing workers table:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('Workers table is EMPTY or no permission');
    return;
  }
  
  console.log(`✓ Found ${data.length} workers:`);
  data.forEach(w => {
    console.log(`  - ${w.full_name} (${w.employee_id})`);
  });
  
  // Try to find Bacol
  console.log('\nTrying to find "Bacol, Vivian"...');
  const { data: bacol, error: bacolError } = await supabase
    .from('workers')
    .select('*')
    .ilike('full_name', '%Bacol%')
    .limit(1);
  
  if (bacolError) {
    console.error('ERROR:', bacolError);
  } else if (bacol && bacol.length > 0) {
    console.log('✓ Found:', bacol[0].full_name);
  } else {
    console.log('✗ Not found');
  }
}

testAccess().catch(console.error);
