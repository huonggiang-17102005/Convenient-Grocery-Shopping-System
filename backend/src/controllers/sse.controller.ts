import type { Request, Response } from 'express';
import * as sseService from '../services/sse.service.js';

export const streamEvents = async (req: Request, res: Response) => {
  const familyId = (req as any).user?.family_id as string;
  const userId = (req as any).user?.id as string;

  if (!familyId || !userId) {
    res.status(401).json({ message: 'Không thể kết nối SSE do thiếu thông tin user/family' });
    return;
  }

  // Setup SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Đảm bảo headers được gửi đi ngay lập tức

  // Gửi sự kiện mở kết nối (để flush và ngăn lỗi timeout)
  res.write(`event: CONNECTED\n`);
  res.write(`data: ${JSON.stringify({ message: 'Kết nối SSE thành công' })}\n\n`);

  // Thêm client vào danh sách quản lý
  sseService.addSSEClient(familyId, userId, res);

  // Gửi ping mỗi 15 giây để giữ connection (tránh lỗi net::ERR_INCOMPLETE_CHUNKED_ENCODING)
  const keepAliveInterval = setInterval(() => {
    res.write(`event: PING\n`);
    res.write(`data: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
  }, 15000);

  // Xử lý khi kết nối bị ngắt
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    sseService.removeSSEClient(familyId, userId, res);
  });
};
