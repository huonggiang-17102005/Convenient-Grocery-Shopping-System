import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.post('/recipe', aiController.generateRecipe);
router.post('/estimate-nutrition', aiController.estimateNutrition);

export default router;
