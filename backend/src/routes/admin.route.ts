import express from 'express';
import { getDashboardStats, getUsersList, deleteUser, updateUserStatus, getWasteReport, getSystemSettings, updateSystemSettings } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/waste-report', getWasteReport);
router.get('/users', getUsersList);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

export default router;
