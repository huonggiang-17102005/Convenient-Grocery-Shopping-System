import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as shoppingListService from '../services/shoppingList.service.js';

export const getShoppingItems = async (req: AuthRequest, res: Response) => {
  const familyId = req.user?.family_id;
  if (!familyId) {
    return res.status(403).json({ error: 'Không tìm thấy ID gia đình của người dùng.' });
  }

  const items = await shoppingListService.getShoppingItems(familyId);
  return res.status(200).json(items);
};

export const createShoppingItem = async (req: AuthRequest, res: Response) => {
  const familyId = req.user?.family_id;
  const userId = req.user?.id;
  if (!familyId || !userId) {
    return res.status(403).json({ error: 'Không tìm thấy thông tin người dùng.' });
  }

  const item = await shoppingListService.createShoppingItem(familyId, userId, req.body);
  return res.status(201).json(item);
};

export const updateShoppingItem = async (req: AuthRequest, res: Response) => {
  const familyId = req.user?.family_id;
  const userId = req.user?.id;
  if (!familyId || !userId) {
    return res.status(403).json({ error: 'Không tìm thấy thông tin người dùng.' });
  }

  const id = req.params.id as string;
  const updated = await shoppingListService.updateShoppingItem(familyId, id, userId, req.body);
  return res.status(200).json(updated);
};

export const deleteShoppingItem = async (req: AuthRequest, res: Response) => {
  const familyId = req.user?.family_id;
  const userId = req.user?.id;
  if (!familyId || !userId) {
    return res.status(403).json({ error: 'Không tìm thấy thông tin người dùng.' });
  }

  const id = req.params.id as string;
  await shoppingListService.deleteShoppingItem(familyId, id, userId);
  return res.status(204).send();
};

export const checkOverdueTasks = async (req: AuthRequest, res: Response) => {
  const count = await shoppingListService.checkOverdueTasks();
  return res.status(200).json({ success: true, count, message: `Đã quét và thông báo ${count} nhiệm vụ trễ hạn.` });
};
