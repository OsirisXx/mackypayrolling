import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://lzvdpboiwungwerswlij.supabase.co', 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw');

async function debug() {
  const { data: allWorkers } = await supabase.from('workers').select('id, full_name, daily_rate, hourly_rate');
  
  // Check which DB workers match these problematic names
  const problemNames = ['Lan ayan Raul', 'Sumayan Roland', 'Espina Aida', 'Lan-ayan Renemee'];
  
  for (const name of problemNames) {
    const nameParts = name.replace(/,/g, ' ').trim().toLowerCase().split(/\s+/).filter(p => p.length > 1);
    console.log(`\n"${name}" -> parts: [${nameParts.join(', ')}]`);
    
    // Show ALL matches
    const matches = allWorkers.filter(dw => {
      const dbName = dw.full_name.toLowerCase();
      return nameParts.every(part => dbName.includes(part)) ||
             (nameParts.length >= 2 && nameParts.slice(0, 2).every(part => dbName.includes(part)));
    });
    
    console.log(`  Matches (${matches.length}):`);
    matches.forEach(m => console.log(`    "${m.full_name}" rate=${m.daily_rate}`));
  }
  
  // Also check: which DB workers have "lan" and "ayan" in their name?
  console.log('\nDB workers containing "lan" and "ayan":');
  allWorkers.filter(w => w.full_name.toLowerCase().includes('lan') && w.full_name.toLowerCase().includes('ayan'))
    .forEach(w => console.log(`  "${w.full_name}"`));
    
  console.log('\nDB workers containing "sumayan":');
  allWorkers.filter(w => w.full_name.toLowerCase().includes('sumayan'))
    .forEach(w => console.log(`  "${w.full_name}"`));
}

debug().catch(console.error);
