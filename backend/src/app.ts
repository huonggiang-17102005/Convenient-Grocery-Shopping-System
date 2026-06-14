import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import uploadRoute from './routes/upload.route.js';
import { testDBConnection } from './config/db.config.js';

import authRoute from './routes/auth.route.js';
import userRoute from './routes/user.route.js';
import familyRoute from './routes/family.route.js';
import adminRoute from './routes/admin.route.js';
import fridgeRoute from './routes/fridge.routes.js';
import recipeRoute from './routes/recipe.route.js';
import mealPlannerRoute from './routes/mealPlanner.routes.js';
import shoppingListRoute from './routes/shoppingList.route.js';
import errorMiddleware from './middlewares/error.middleware.js';

dotenv.config();

// Chạy test kết nối
testDBConnection();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/families', familyRoute);
app.use('/api/fridge', fridgeRoute);
app.use('/api/recipes', recipeRoute);
app.use('/api/meal-planner', mealPlannerRoute);
app.use('/api/shopping-list', shoppingListRoute);
app.use('/api/admin', adminRoute);
const PORT = process.env.PORT || 5000;

app.get('/', (req: Request, res: Response) => {
  res.send('Backend đang hoạt động!');
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: http://localhost:${PORT}`);
});