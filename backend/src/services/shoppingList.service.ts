import * as shoppingListRepo from '../repo/shoppingList.repo.js';
import * as fridgeRepo from '../repo/fridge.repo.js';
import * as notificationService from './notification.service.js';
import * as userRepo from '../repo/user.repo.js';
import * as familyRepo from '../repo/family.repo.js';
import supabase from '../config/db.config.js';
import { ForbiddenError, InternalServerError, BadRequestError } from '../errors/CommonError.js';

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

export const createShoppingItem = async (familyId: string, currentUserId: string, data: any) => {
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

  // Send TASK_ASSIGN notification if assigned to someone else
  if (data.assigneeId && data.assigneeId !== currentUserId) {
    const assignee = await userRepo.findById(data.assigneeId);
    if (assignee) {
      await notificationService.createNotification(
        familyId,
        'TASK_ASSIGN',
        'Nhiệm vụ mới',
        `Bạn đã được giao nhiệm vụ mua: ${data.name}.`,
        { task_id: created.id, assignee_id: data.assigneeId },
        data.assigneeId
      );
    }
  }

  return mapDbToFrontendItem(created);
};

export const updateShoppingItem = async (familyId: string, itemId: string, currentUserId: string, data: any) => {
  const existing = await shoppingListRepo.getItemById(itemId);

  // Verify that the item belongs to a list owned by this family
  const list = await shoppingListRepo.getListById(existing.list_id);

  if (!list || list.family_id !== familyId) {
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

  // Notification: TASK_UNASSIGN and TASK_ASSIGN
  if (data.assigneeId !== undefined && data.assigneeId !== existing.assignee_id) {
    if (existing.assignee_id) {
      await notificationService.createNotification(
        familyId,
        'TASK_UNASSIGN',
        'Hủy nhiệm vụ',
        `Bạn đã được gỡ khỏi nhiệm vụ: ${existing.name}.`,
        { task_id: existing.id, assignee_id: existing.assignee_id },
        existing.assignee_id
      );
    }
    if (data.assigneeId && data.assigneeId !== currentUserId) {
      await notificationService.createNotification(
        familyId,
        'TASK_ASSIGN',
        'Nhiệm vụ mới',
        `Bạn đã được giao nhiệm vụ mua: ${existing.name}.`,
        { task_id: existing.id, assignee_id: data.assigneeId },
        data.assigneeId
      );
    }
  }

  // Notification: TASK_COMPLETE
  if (updateData.is_bought && !existing.is_bought) {
    await syncItemToFridge(familyId, updated);

    // Báo cho toàn gia đình
    const currentUser = await userRepo.findById(currentUserId);
    const actorName = currentUser?.full_name || currentUser?.email || 'Một thành viên';
    await notificationService.createNotification(
      familyId,
      'TASK_COMPLETE',
      'Hoàn thành nhiệm vụ',
      `${actorName} đã hoàn thành nhiệm vụ mua: ${existing.name}.`,
      { task_id: existing.id, user_id: currentUserId }
    );
  }

  return mapDbToFrontendItem(updated);
};

export const deleteShoppingItem = async (familyId: string, itemId: string, currentUserId: string) => {
  const existing = await shoppingListRepo.getItemById(itemId);

  const list = await shoppingListRepo.getListById(existing.list_id);

  if (!list || list.family_id !== familyId) {
    throw new ForbiddenError('Bạn không có quyền xóa mặt hàng này.');
  }

  await shoppingListRepo.deleteItem(itemId);

  if (existing.assignee_id && existing.assignee_id !== currentUserId) {
    await notificationService.createNotification(
      familyId,
      'TASK_DELETE',
      'Xóa nhiệm vụ',
      `Nhiệm vụ "${existing.name}" đã bị hủy.`,
      { task_id: existing.id, assignee_id: existing.assignee_id },
      existing.assignee_id
    );
  }
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
      if (item.category === 'Gia vị') {
        // Do not add quantity for Gia vị
      } else {
        const newQty = Number(existing.quantity) + Number(item.quantity);
        await fridgeRepo.updateItemQuantity(existing.id, newQty);
      }
    } else {
      // Insert new fridge item
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 7); // Default 7 days shelf life

      const newFridgeItem = {
        family_id: familyId,
        name: item.name,
        quantity: item.category === 'Gia vị' ? 1 : Number(item.quantity),
        unit: item.category === 'Gia vị' ? 'cái' : item.unit,
        category: item.category,
        image_url: item.image_url || null,
        image_public_id: item.image_public_id || null,
        location: item.category === 'Thịt cá' ? 'Ngăn đông' : 'Ngăn mát',
        expiration_date: expiry.toISOString().split('T')[0] as string,
        is_wasted: false
      };

      await fridgeRepo.addItem(newFridgeItem);
    }
  } catch (error) {
    console.error('Failed to sync item to fridge:', error);
    throw new InternalServerError('Lỗi khi đồng bộ mặt hàng vào tủ lạnh.');
  }
}

export const checkOverdueTasks = async () => {
  const today = (new Date().toISOString().split('T')[0]) as string;

  const overdueItems = await shoppingListRepo.getOverdueUnboughtItems(today);

  if (!overdueItems || overdueItems.length === 0) return 0;

  for (const item of overdueItems) {
    const listInfo: any = item.shopping_lists;
    const familyId = Array.isArray(listInfo) ? listInfo[0]?.family_id : listInfo?.family_id;
    if (!familyId) continue;

    // Get homemaker
    const members = await familyRepo.getFamilyMembers(familyId);
    const homemaker = members.find(m => m.role === 'Homemaker');

    if (item.assignee_id) {
      // Báo cho người thực hiện
      await notificationService.createNotification(
        familyId,
        'TASK_OVERDUE',
        'Nhiệm vụ trễ hạn',
        `Nhiệm vụ "${item.name}" đã quá hạn!`,
        { task_id: item.id, assignee_id: item.assignee_id },
        item.assignee_id
      );
      
      // Báo cho homemaker nếu assignee_id khác homemaker
      if (homemaker && homemaker.id !== item.assignee_id) {
        const assignee = members.find(m => m.id === item.assignee_id);
        const assigneeName = assignee?.full_name || 'Một thành viên';
        await notificationService.createNotification(
          familyId,
          'TASK_OVERDUE',
          'Nhiệm vụ trễ hạn',
          `Nhiệm vụ "${item.name}" giao cho ${assigneeName} đã quá hạn!`,
          { task_id: item.id, homemaker_id: homemaker.id, assignee_id: item.assignee_id },
          homemaker.id
        );
      }
    } else {
      // Chưa giao ai -> báo cho Homemaker
      if (homemaker) {
        await notificationService.createNotification(
          familyId,
          'TASK_OVERDUE',
          'Nhiệm vụ trễ hạn',
          `Nhiệm vụ chưa giao "${item.name}" đã quá hạn!`,
          { task_id: item.id, homemaker_id: homemaker.id },
          homemaker.id
        );
      }
    }
  }

  return overdueItems.length;
};
