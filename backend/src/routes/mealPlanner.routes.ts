import { Router } from 'express';
import { mealPlannerController } from '../controllers/mealPlanner.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', mealPlannerController.getMealPlan);
router.post('/', mealPlannerController.addMealPlan);
router.patch('/servings', mealPlannerController.updateServings);
router.patch('/cooked', mealPlannerController.markCooked);
router.patch('/shopped', mealPlannerController.markShopped);
router.patch('/items/:id/shopped', mealPlannerController.markSingleItemShopped);
router.delete('/:id', mealPlannerController.removeMealPlan);

export default router;

