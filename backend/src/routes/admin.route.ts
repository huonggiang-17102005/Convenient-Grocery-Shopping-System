import express from 'express';
import { getDashboardStats, getUsersList, deleteUser, updateUserStatus } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsersList);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);

export default router;
