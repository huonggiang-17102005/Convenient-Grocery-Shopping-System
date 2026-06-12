import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import * as shoppingListService from '../services/shopping-list.service.js';

// --- Shopping Lists ---
export const getListsByFamilyId = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { familyId } = req.params;
    const lists = await shoppingListService.getListsByFamilyId(familyId);

    res.status(200).json({
      success: true,
      data: lists,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/shopping-lists/:id
export const getListById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const list = await shoppingListService.getListById(id);

    res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/shopping-lists
export const createList = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { family_id, title, target_date, status } = req.body;

    const newList = await shoppingListService.createList({
      family_id,
      title,
      target_date,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo danh sách mua sắm thành công.',
      data: newList,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/shopping-lists/:id
export const updateList = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, status, target_date } = req.body;

    const updatedList = await shoppingListService.updateList(id, {
      title,
      status,
      target_date,
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật danh sách mua sắm thành công.',
      data: updatedList,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/shopping-lists/:id
export const deleteList = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await shoppingListService.deleteList(id);

    res.status(200).json({
      success: true,
      message: 'Xóa danh sách mua sắm thành công.',
    });
  } catch (error) {
    next(error);
  }
};

// --- Shopping List Items ---
// POST /api/shopping-lists/:id/items
export const createItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: listId } = req.params;
    const { name, category, quantity, unit, image_url, image_public_id, assignee_id, deadline_date, deadline_time } = req.body;

    const newItem = await shoppingListService.createItem(listId, {
      name,
      category,
      quantity,
      unit,
      image_url,
      image_public_id,
      assignee_id,
      deadline_date,
      deadline_time,
    });

    res.status(201).json({
      success: true,
      message: 'Thêm mặt hàng vào danh sách thành công.',
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/shopping-lists/:id/items/:itemId
export const updateItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: listId, itemId } = req.params;
    const { name, category, quantity, unit, image_url, image_public_id, is_bought, assignee_id, deadline_date, deadline_time } = req.body;

    const updatedItem = await shoppingListService.updateItem(listId, itemId, {
      name,
      category,
      quantity,
      unit,
      image_url,
      image_public_id,
      is_bought,
      assignee_id,
      deadline_date,
      deadline_time,
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật mặt hàng thành công.',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/shopping-lists/:id/items/:itemId/toggle
export const toggleItemBought = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: listId, itemId } = req.params;
    const updatedItem = await shoppingListService.toggleItemBought(listId, itemId);

    res.status(200).json({
      success: true,
      message: updatedItem.is_bought ? 'Đã đánh dấu là đã mua.' : 'Đã bỏ đánh dấu đã mua.',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/shopping-lists/:id/items/:itemId
export const deleteItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: listId, itemId } = req.params;
    await shoppingListService.deleteItem(listId, itemId);

    res.status(200).json({
      success: true,
      message: 'Xóa mặt hàng khỏi danh sách thành công.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/shopping-lists/:id/items/:itemId/add-to-fridge
export const addItemToFridge = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: listId, itemId } = req.params;
    const { family_id, expiration_date, location, image_url, image_public_id } = req.body;

    const fridgeItem = await shoppingListService.addItemToFridge(listId, itemId, {
      family_id,
      expiration_date,
      location,
      image_url,
      image_public_id,
    });

    res.status(201).json({
      success: true,
      message: 'Đã thêm vào tủ lạnh thành công.',
      data: fridgeItem,
    });
  } catch (error) {
    next(error);
  }
};

