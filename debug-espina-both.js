import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lzvdpboiwungwerswlij.supabase.co', 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw');

async function debug() {
  const { data: workers } = await supabase.from('workers').select('id, full_name').ilike('full_name', '%Espina%');
  const espina = workers[0];

  // Feb 6-12 query: start=Feb 6, end=Feb 12, query up to Feb 13 00:00
  console.log('Feb 6-12 query (< 2026-02-13T00:00):');
  const { data: att1 } = await supabase.from('attendance').select('clock_in, overtime_hours')
    .eq('worker_id', espina.id)
    .gte('clock_in', '2026-02-06T00:00:00')
    .lt('clock_in', '2026-02-13T00:00:00')
    .in('status', ['clocked_out', 'completed_quota']);
  console.log(`  Records: ${att1.length}`);
  att1.forEach(a => console.log(`    ${a.clock_in} OT=${a.overtime_hours}`));

  // Feb 13-19 query: start=Feb 13, end=Feb 19, query up to Feb 20 00:00
  console.log('\nFeb 13-19 query (< 2026-02-20T00:00):');
  const { data: att2 } = await supabase.from('attendance').select('clock_in, overtime_hours')
    .eq('worker_id', espina.id)
    .gte('clock_in', '2026-02-13T00:00:00')
    .lt('clock_in', '2026-02-20T00:00:00')
    .in('status', ['clocked_out', 'completed_quota']);
  console.log(`  Records: ${att2.length}`);
  att2.forEach(a => console.log(`    ${a.clock_in} OT=${a.overtime_hours}`));
  
  // Check what the frontend actually queries with startOfDay
  // The frontend uses: startOfDay(dateRange.start) and startOfDay(periodEnd)
  // For Feb 13-19: start = Feb 13, periodEnd = Feb 20 (end+1)
  // startOfDay of Feb 13 = 2026-02-13T00:00:00 in LOCAL timezone -> UTC could be different!
  console.log('\nTimezone note: Supabase stores UTC. If browser is UTC+8:');
  console.log('  startOfDay(Feb 13) in UTC+8 = 2026-02-13T00:00:00+08:00 = 2026-02-12T16:00:00Z');
  console.log('  This means Feb 13 period query would INCLUDE records from Feb 12 16:00 UTC onwards!');
  
  console.log('\nFeb 13-19 with timezone offset query (>= 2026-02-12T16:00:00Z):');
  const { data: att3 } = await supabase.from('attendance').select('clock_in, overtime_hours')
    .eq('worker_id', espina.id)
    .gte('clock_in', '2026-02-12T16:00:00Z')
    .lt('clock_in', '2026-02-19T16:00:00Z')
    .in('status', ['clocked_out', 'completed_quota']);
  console.log(`  Records: ${att3.length}`);
  att3.forEach(a => console.log(`    ${a.clock_in} OT=${a.overtime_hours}`));
}

debug().catch(console.error);
