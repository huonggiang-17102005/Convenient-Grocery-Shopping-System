import express, { type Request, type Response } from 'express';

const app = express();
const PORT = 5000;

// Middleware để đọc dữ liệu JSON từ request body
app.use(express.json());

// API chạy thử nghiệm
app.get('/', (req: Request, res: Response) => {
  res.send('Backend đang hoạt động!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});