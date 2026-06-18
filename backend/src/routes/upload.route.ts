import express, { type Request, type Response } from 'express';
import multer from 'multer';
import supabase from '../config/db.config.js'; 

const router = express.Router();

// Sử dụng memoryStorage để giữ file trong RAM trước khi gửi lên Supabase
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Không tìm thấy file ảnh đính kèm!' });
      return;
    }

    // Tạo tên file ngẫu nhiên để tránh trùng lặp
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `FridMate_Images/${fileName}`;

    // Upload trực tiếp buffer lên Supabase Storage (bucket tên là 'images')
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Lấy URL public của ảnh vừa upload
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    res.status(200).json({
      message: 'Upload ảnh thành công!',
      imageUrl: publicUrlData.publicUrl,
      imagePublicId: filePath // Trả về filePath để frontend vẫn lưu được publicId như cũ
    });
  } catch (error: any) {
    console.error('Lỗi upload ảnh:', error.message);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi upload ảnh.', error: error.message });
  }
});

export default router;