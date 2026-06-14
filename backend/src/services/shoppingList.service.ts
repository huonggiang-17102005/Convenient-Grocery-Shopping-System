import * as shoppingListRepo from '../repo/shoppingList.repo.js';
import * as fridgeRepo from '../repo/fridge.repo.js';
import supabase from '../config/db.config.js';
import { ForbiddenError, InternalServerError } from '../errors/CommonError.js';

// Format item to shape expected by the frontend
const mapDbToFrontendItem = (item: any) => {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: Number(item.quantity),
    unit: item.unit,
    isBought: item.is_bought,
    assigneeId: item.assignee_id,
    deadlineDate: item.deadline_date,
    deadlineTime: item.deadline_time ? item.deadline_time.substring(0, 5) : '', // HH:MM
    imageUrl: item.image_url,
    imagePublicId: item.image_public_id,
  };
};

export const getShoppingItems = async (familyId: string) => {
  const items = await shoppingListRepo.getActiveListItems(familyId);
  return items.map(mapDbToFrontendItem);
};

export const createShoppingItem = async (familyId: string, data: any) => {
  const activeList = await shoppingListRepo.getOrCreateActiveList(familyId);

  const insertData = {
    list_id: activeList.id,
    name: data.name,
    category: data.category || 'Khác',
    quantity: Number(data.quantity) || 1,
    unit: data.unit || 'g',
    is_bought: false,
    assignee_id: data.assigneeId || null,
    deadline_date: data.deadlineDate || new Date().toISOString().split('T')[0],
    deadline_time: data.deadlineTime ? `${data.deadlineTime}:00` : null,
    image_url: data.imageUrl || null,
    image_public_id: data.imagePublicId || null,
  };

  const created = await shoppingListRepo.createItem(insertData);
  return mapDbToFrontendItem(created);
};

export const updateShoppingItem = async (familyId: string, itemId: string, data: any) => {
  const existing = await shoppingListRepo.getItemById(itemId);

  // Verify that the item belongs to a list owned by this family
  const { data: list, error: listErr } = await supabase
    .from('shopping_lists')
    .select('family_id')
    .eq('id', existing.list_id)
    .single();

  if (listErr || !list || list.family_id !== familyId) {
    throw new ForbiddenError('Bạn không có quyền sửa mặt hàng này.');
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.quantity !== undefined) updateData.quantity = Number(data.quantity);
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.isBought !== undefined) updateData.is_bought = data.isBought;
  if (data.assigneeId !== undefined) updateData.assignee_id = data.assigneeId;
  if (data.deadlineDate !== undefined) updateData.deadline_date = data.deadlineDate;
  if (data.deadlineTime !== undefined) updateData.deadline_time = data.deadlineTime ? `${data.deadlineTime}:00` : null;
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.imagePublicId !== undefined) updateData.image_public_id = data.imagePublicId;

  const updated = await shoppingListRepo.updateItem(itemId, updateData);

  // Sync to fridge if marked as bought and it wasn't bought before
  if (updateData.is_bought && !existing.is_bought) {
    await syncItemToFridge(familyId, updated);
  }

  return mapDbToFrontendItem(updated);
};

export const deleteShoppingItem = async (familyId: string, itemId: string) => {
  const existing = await shoppingListRepo.getItemById(itemId);

  const { data: list, error: listErr } = await supabase
    .from('shopping_lists')
    .select('family_id')
    .eq('id', existing.list_id)
    .single();

  if (listErr || !list || list.family_id !== familyId) {
    throw new ForbiddenError('Bạn không có quyền xóa mặt hàng này.');
  }

  await shoppingListRepo.deleteItem(itemId);
};

// Helper function to sync a bought shopping item to fridge_items table
async function syncItemToFridge(familyId: string, item: any) {
  try {
    const fridgeItems = await fridgeRepo.getItemsByFamilyId(familyId);
    
    const existing = fridgeItems.find(f => 
      f.name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
      f.category?.toLowerCase().trim() === item.category.toLowerCase().trim()
    );

    if (existing) {
      // Add quantity
      const newQty = Number(existing.quantity) + Number(item.quantity);
      await fridgeRepo.updateItemQuantity(existing.id, newQty);
    } else {
      // Insert new fridge item
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7); // Default 7 days shelf life

      const newFridgeItem = {
        family_id: familyId,
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        category: item.category,
        image_url: item.image_url || null,
        image_public_id: item.image_public_id || null,
        location: item.category === 'Thịt cá' ? 'Ngăn đông' : 'Ngăn mát',
        expiration_date: expiry.toISOString().split('T')[0],
        is_wasted: false
      };

      const { error } = await supabase
        .from('fridge_items')
        .insert([newFridgeItem]);

      if (error) {
        console.error('Error syncing bought item to fridge:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to sync item to fridge:', error);
    throw new InternalServerError('Lỗi khi đồng bộ mặt hàng vào tủ lạnh.');
  }
}
