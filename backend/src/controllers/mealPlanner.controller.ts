import { Request, Response } from 'express';
import { mealPlannerService } from '../services/mealPlanner.service';

export const mealPlannerController = {
  getMealPlan: async (req: Request, res: Response) => {
    try {
      const familyId = req.user?.familyId;
      if (!familyId) return res.status(403).json({ error: 'Require family access' });

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ error: 'Missing date range' });

      const data = await mealPlannerService.getMealPlan(familyId, startDate as string, endDate as string);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  addMealPlan: async (req: Request, res: Response) => {
    try {
      const familyId = req.user?.familyId;
      const userId = req.user?.id;
      if (!familyId || !userId) return res.status(403).json({ error: 'Require family access' });

      const { recipeId, date, mealType } = req.body;
      if (!recipeId || !date || !mealType) return res.status(400).json({ error: 'Missing fields' });

      const data = await mealPlannerService.addMealPlan(familyId, userId, recipeId, date, mealType);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  removeMealPlan: async (req: Request, res: Response) => {
    try {
      const familyId = req.user?.familyId;
      if (!familyId) return res.status(403).json({ error: 'Require family access' });

      const { id } = req.params;
      const data = await mealPlannerService.removeMealPlan(familyId, id);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
