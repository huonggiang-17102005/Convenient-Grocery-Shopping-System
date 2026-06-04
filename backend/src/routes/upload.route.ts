import express, { type Request, type Response } from 'express';

import uploadCloud from '../config/cloudinary.config.js'; 

const router = express.Router();

router.post('/', uploadCloud.single('image'), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Không tìm thấy file ảnh đính kèm!' });
      return;
    }

    res.status(200).json({
      message: 'Upload ảnh thành công!',
      imageUrl: req.file.path,
      imagePublicId: req.file.filename
    });
  } catch (error) {
    console.error('Lỗi upload ảnh:', error);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi upload ảnh.' });
  }
});

export default router;