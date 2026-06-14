import type { Request, Response } from 'express';
import * as fridgeService from '../services/fridge.service.js';

export const getByFamilyId = async (req: Request, res: Response) => {
  const { familyId } = req.params as { familyId: string };
  const items = await fridgeService.getFamilyFridge(familyId);
  
  return res.status(200).json({
    success: true,
    data: items
  });
};

export const deduct = async (req: Request, res: Response) => {
  const { familyId, ingredients } = req.body;
  if (!familyId || !ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ success: false, message: 'Invalid payload' });
  }

  try {
    const result = await fridgeService.deductInventory(familyId, ingredients);
    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
