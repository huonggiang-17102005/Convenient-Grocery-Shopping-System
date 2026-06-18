import type { Request, Response } from 'express';
import * as categoryService from '../services/category.service.js';

export const getAllCategories = async (req: Request, res: Response) => {
  const groupedCategories = await categoryService.getGroupedCategories();
  
  return res.status(200).json({
    success: true,
    data: groupedCategories
  });
};
