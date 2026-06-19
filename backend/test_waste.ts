import { config } from 'dotenv';
config();
import { throwAwayFridgeItem } from './src/services/fridge.service.js';
import supabase from './src/config/db.config.js';

async function test() {
  const { data: items } = await supabase.from('fridge_items').select('*').limit(1);
  if (items && items.length > 0) {
    const item = items[0];
    console.log('Testing waste on item:', item.name);
    // Fake user
    const user = { id: 'test_user_id', full_name: 'Test User', email: 'test@example.com' };
    const res = await throwAwayFridgeItem(item.id, user);
    console.log('Result:', res);
  } else {
    console.log('No items in fridge_items table');
  }
}
test();
