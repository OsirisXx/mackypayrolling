import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = 'https://lzvdpboiwungwerswlij.supabase.co';
const supabaseAnonKey = 'sb_publishable_LHyb03Ygp_J-d6fTdyU3qg_RMcS6ybw';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
