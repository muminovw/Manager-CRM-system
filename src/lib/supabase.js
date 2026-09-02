import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uoqftupqglyandhqaqwm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RO3Q-eRECXQkcSzYVumk7Q_Ft7v6pMF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);