import type { Response } from 'express';
import { mealPlannerService } from '../services/mealPlanner.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const mealPlannerController = {
  getMealPlan: async (req: AuthRequest, res: Response) => {
    try {
      const familyId = req.user?.family_id;
      if (!familyId) return res.status(403).json({ error: 'Require family access' });

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ error: 'Missing date range' });

      const data = await mealPlannerService.getMealPlan(familyId, startDate as string, endDate as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  addMealPlan: async (req: AuthRequest, res: Response) => {
    try {
      const familyId = req.user?.family_id;
      const userId = req.user?.id;
      if (!familyId || !userId) return res.status(403).json({ error: 'Require family access' });

      const { recipeId, date, mealType, peopleCount } = req.body;
      if (!recipeId || !date || !mealType) return res.status(400).json({ error: 'Missing fields' });

      const data = await mealPlannerService.addMealPlan(familyId, userId, recipeId, date, mealType, peopleCount || 1, req.user);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  updateServings: async (req: AuthRequest, res: Response) => {
    try {
      const familyId = req.user?.family_id;
      if (!familyId) return res.status(403).json({ error: 'Require family access' });

      const { date, mealType, peopleCount } = req.body;
      if (!date || !mealType || peopleCount === undefined) return res.status(400).json({ error: 'Missing fields' });

      const data = await mealPlannerService.updateServings(familyId, date, mealType, Number(peopleCount));
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  removeMealPlan: async (req: AuthRequest, res: Response) => {
    try {
      const familyId = req.user?.family_id;
      if (!familyId) return res.status(403).json({ error: 'Require family access' });

      const id = req.params.id as string;
      const data = await mealPlannerService.removeMealPlan(familyId, id, req.user);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
