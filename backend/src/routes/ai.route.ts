import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.post('/recipe', aiController.generateRecipe);

export default router;
