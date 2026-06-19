import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);

export default router;
