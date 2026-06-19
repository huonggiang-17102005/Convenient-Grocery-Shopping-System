import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(2);
  if (error) console.error('Error:', error);
  else console.log('Notifications:', JSON.stringify(data, null, 2));
}

check();
