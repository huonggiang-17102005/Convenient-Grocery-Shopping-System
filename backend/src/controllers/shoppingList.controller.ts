import type { Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as shoppingListService from '../services/shoppingList.service.js';

export const getShoppingItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const familyId = req.user?.family_id;
    if (!familyId) {
      res.status(403).json({ error: 'Không tìm thấy ID gia đình của người dùng.' });
      return;
    }

    const items = await shoppingListService.getShoppingItems(familyId);
    res.status(200).json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createShoppingItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const familyId = req.user?.family_id;
    if (!familyId) {
      res.status(403).json({ error: 'Không tìm thấy ID gia đình của người dùng.' });
      return;
    }

    const item = await shoppingListService.createShoppingItem(familyId, req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateShoppingItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const familyId = req.user?.family_id;
    if (!familyId) {
      res.status(403).json({ error: 'Không tìm thấy ID gia đình của người dùng.' });
      return;
    }

    const id = req.params.id as string;
    const updated = await shoppingListService.updateShoppingItem(familyId, id, req.body);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteShoppingItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const familyId = req.user?.family_id;
    if (!familyId) {
      res.status(403).json({ error: 'Không tìm thấy ID gia đình của người dùng.' });
      return;
    }

    const id = req.params.id as string;
    await shoppingListService.deleteShoppingItem(familyId, id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
