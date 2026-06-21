import { Router } from 'express';
import * as sseController from '../controllers/sse.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', sseController.streamEvents);

export default router;
