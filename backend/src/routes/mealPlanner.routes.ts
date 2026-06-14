import { Router } from 'express';
import { mealPlannerController } from '../controllers/mealPlanner.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', mealPlannerController.getMealPlan);
router.post('/', mealPlannerController.addMealPlan);
router.delete('/:id', mealPlannerController.removeMealPlan);

export default router;
