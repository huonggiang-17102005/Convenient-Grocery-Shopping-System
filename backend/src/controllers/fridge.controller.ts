import type { Request, Response, NextFunction } from 'express';
import * as fridgeService from '../services/fridge.service.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const getByFamilyId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { familyId } = req.params as { familyId: string };
    const items = await fridgeService.getFamilyFridge(familyId);
    
    return res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/fridge
 * Thêm thực phẩm vào tủ lạnh
 * Nếu cùng tên + gia đình đã có -> cộng số lượng
 * Body: { family_id, name, quantity, unit, category?, expiration_date, location?, image_url? }
 */
export const addFridgeItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      family_id,
      name,
      quantity,
      unit,
      category,
      expiration_date,
      location,
      image_url,
      image_public_id,
    } = req.body;

    const item = await fridgeService.addToFridge({
      family_id,
      name,
      quantity,
      unit,
      category,
      expiration_date,
      location,
      image_url,
      image_public_id,
    });

    res.status(201).json({
      success: true,
      message: 'Thêm thực phẩm vào tủ lạnh thành công.',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};
