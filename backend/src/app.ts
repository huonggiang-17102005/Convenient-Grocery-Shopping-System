import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import uploadRoute from './routes/upload.route.js';
import { testDBConnection } from './config/db.config.js';

dotenv.config();

// Chạy test kết nối
testDBConnection();

const app = express();
app.use('/api/upload', uploadRoute);
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Backend đang hoạt động!');
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});