import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lzvdpboiwungwerswlij.supabase.co', 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw');

async function debug() {
  const { data: workers } = await supabase.from('workers').select('id, full_name').ilike('full_name', '%Espina%');
  const espina = workers[0];
  console.log('Espina:', espina);

  // Get ALL attendance for Espina in Feb
  const { data: att } = await supabase.from('attendance').select('*')
    .eq('worker_id', espina.id)
    .gte('clock_in', '2026-02-01')
    .lt('clock_in', '2026-02-28')
    .order('clock_in');

  console.log(`\nAll Espina attendance in Feb: ${att.length} records`);
  att.forEach(a => console.log(`  ${a.clock_in} | OT=${a.overtime_hours}`));

  // Now simulate the frontend query for Feb 6-12 (end+1 day)
  const { data: periodAtt } = await supabase.from('attendance').select('*')
    .eq('worker_id', espina.id)
    .gte('clock_in', '2026-02-06T00:00:00')
    .lt('clock_in', '2026-02-13T00:00:00')
    .in('status', ['clocked_out', 'completed_quota']);

  console.log(`\nFeb 6-12 query (up to Feb 13): ${periodAtt.length} records`);
  periodAtt.forEach(a => console.log(`  ${a.clock_in}`));
}

debug().catch(console.error);
