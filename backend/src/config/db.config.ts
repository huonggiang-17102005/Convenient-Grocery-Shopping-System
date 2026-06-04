import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    
    if (!MONGO_URI) {
      throw new Error('Chưa tìm thấy biến MONGO_URI trong file .env');
    }

    // Tiến hành kết nối
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ Đã kết nối thành công với MongoDB Atlas! Host: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('Lỗi kết nối MongoDB trong quá trình chạy:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('Mất kết nối tới MongoDB. Đang thử kết nối lại...');
    });

  } catch (error: any) {
    console.error(`Lỗi Khởi tạo Database: ${error.message}`);
    // Ngắt luôn process server nếu không kết nối được DB
    process.exit(1); 
  }
};

export default connectDB;
