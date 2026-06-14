import { Router } from 'express';
import { mealPlannerController } from '../controllers/mealPlanner.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', mealPlannerController.getMealPlan);
router.post('/', mealPlannerController.addMealPlan);
router.delete('/:id', mealPlannerController.removeMealPlan);

export default router;
