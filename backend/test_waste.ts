import { config } from 'dotenv';
config();
import supabase from './src/config/db.config.js';

async function query() {
  // 1. Find user Mai Chi
  console.log('--- Find User ---');
  const { data: users, error: errUser } = await supabase
    .from('users')
    .select('id, email, full_name, family_id, role');
  
  if (errUser) {
    console.error('Error fetching users:', errUser);
    return;
  }
  
  const maiChi = users.find(u => u.full_name?.toLowerCase().includes('mai chi') || u.email?.toLowerCase().includes('maichi'));
  console.log('User Mai Chi:', maiChi);

  if (!maiChi || !maiChi.family_id) {
    console.log('Could not find family ID for Mai Chi');
    return;
  }

  const familyId = maiChi.family_id;

  // 2. Fetch family info
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();
  console.log('Family Info:', family);

  // 3. Fetch fridge items for this family
  console.log('--- Fridge Items for Family ---');
  const { data: items } = await supabase
    .from('fridge_items')
    .select('*')
    .eq('family_id', familyId)
    .eq('category', 'Trứng');
  console.log(JSON.stringify(items, null, 2));

  // 4. Fetch inventory logs for this family
  console.log('--- Inventory Logs for Family (Trứng) ---');
  const { data: logs } = await supabase
    .from('inventory_logs')
    .select('*')
    .eq('family_id', familyId)
    .eq('category', 'Trứng');
  console.log(JSON.stringify(logs, null, 2));
}

query();
