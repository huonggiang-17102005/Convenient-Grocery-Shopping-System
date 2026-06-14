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
