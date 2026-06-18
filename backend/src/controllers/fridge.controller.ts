import type { Request, Response } from 'express';
import * as fridgeService from '../services/fridge.service.js';
import { BadRequestError } from '../errors/CommonError.js';

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
    throw new BadRequestError('Invalid payload');
  }

  const result = await fridgeService.deductInventory(familyId, ingredients);
  return res.status(200).json({ success: true, data: result });
};

export const addItem = async (req: Request, res: Response) => {
  const newItem = await fridgeService.addFridgeItem(req.body);
  return res.status(201).json({
    success: true,
    message: 'Đã thêm nguyên liệu vào tủ lạnh',
    data: newItem
  });
};

export const updateItem = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await fridgeService.updateFridgeItem(id, req.body);
  return res.status(200).json({
    success: true,
    message: result.deleted ? 'Đã dùng hết nguyên liệu' : 'Cập nhật thành công',
    data: result.item || null
  });
};

export const wasteItem = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await fridgeService.throwAwayFridgeItem(id);
  return res.status(200).json({
    success: true,
    message: result.message
  });
};

export const getExpiring = async (req: Request, res: Response) => {
  const { familyId } = req.params as { familyId: string };
  const items = await fridgeService.checkExpiringItems(familyId);
  return res.status(200).json({
    success: true,
    data: items
  });
};

export const runCron = async (req: Request, res: Response) => {
  const result = await fridgeService.runCronCheck();
  return res.status(200).json({
    success: true,
    message: 'Cronjob executed successfully',
    data: result
  });
};
