import express from 'express';
import { getDashboardStats, getUsersList, deleteUser, updateUserStatus, getWasteReport, getSystemSettings, updateSystemSettings, getMasterDataCategories, getMasterDataUnits, updateMasterDataCategory, updateMasterDataUnit, createMasterDataUnit, deleteMasterDataUnit, deleteMasterDataCategory, createMasterDataCategory, getMasterDataRecipes, deleteMasterDataRecipe, createMasterDataRecipe, updateMasterDataRecipe } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/dashboard-stats', getDashboardStats);
router.get('/waste-report', getWasteReport);
router.get('/users', getUsersList);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', updateUserStatus);
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Master Data Routes
router.get('/master-data/categories', getMasterDataCategories);
router.post('/master-data/categories', createMasterDataCategory);
router.put('/master-data/categories/:categoryName', updateMasterDataCategory);
router.delete('/master-data/categories/:categoryName', deleteMasterDataCategory);

router.get('/master-data/units', getMasterDataUnits);
router.post('/master-data/units', createMasterDataUnit);
router.put('/master-data/units/:oldUnitName', updateMasterDataUnit);
router.delete('/master-data/units/:unitName', deleteMasterDataUnit);

router.get('/master-data/recipes', getMasterDataRecipes);
router.post('/master-data/recipes', createMasterDataRecipe);
router.put('/master-data/recipes/:id', updateMasterDataRecipe);
router.delete('/master-data/recipes/:id', deleteMasterDataRecipe);

export default router;
