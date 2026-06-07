import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const testSupabaseConnection = async () => {
  try {
    // Truy vấn thử bảng users (chỉ lấy 1 dòng để test)
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      throw error;
    }
    console.log('✅ Đã kết nối thành công với Database (Supabase)!');
  } catch (error: any) {
    console.error('❌ Lỗi kết nối Supabase:', error.message);
  }
};

export default supabase;
