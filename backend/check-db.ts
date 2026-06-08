import supabase from './src/config/db.config.js';

async function check() {
  const { data, error } = await supabase.from('families').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}

check();
