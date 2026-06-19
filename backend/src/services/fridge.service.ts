import * as fridgeRepo from '../repo/fridge.repo.js';
import * as inventoryLogRepo from '../repo/inventoryLog.repo.js';
import * as notificationService from './notification.service.js';
import { BadRequestError, NotFoundError } from '../errors/CommonError.js';
import type { FridgeItem } from '../models/FridgeItem.js';

export const getFamilyFridge = async (familyId: string) => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình (familyId) không được để trống.');
  }

  const items = await fridgeRepo.getItemsByFamilyId(familyId);
  
  return items;
};

export const deductInventory = async (
  familyId: string, 
  ingredients: { name: string; category?: string; amountValue: number; amountUnit: string }[],
  user?: any
) => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình không hợp lệ.');
  }

  // Fetch all items
  const fridgeItems = await fridgeRepo.getItemsByFamilyId(familyId);
  const results = [];

  for (const ing of ingredients) {
    let remainingToDeduct = Number(ing.amountValue);
    if (isNaN(remainingToDeduct) || remainingToDeduct <= 0) continue;

    // Filter matching items (case-insensitive name AND category)
    const matches = fridgeItems.filter(fi => 
      fi.name.toLowerCase().trim() === ing.name.toLowerCase().trim() &&
      (!ing.category || (fi.category && fi.category.toLowerCase().trim() === ing.category.toLowerCase().trim()))
    );

    // Sort by expiration_date ASC (FIFO)
    matches.sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

    for (const match of matches) {
      if (remainingToDeduct <= 0) break;

      let amountDeducted = 0;
      if (match.quantity <= remainingToDeduct) {
        // Deduct full match quantity and delete
        amountDeducted = match.quantity;
        await fridgeRepo.deleteItem(match.id);
        remainingToDeduct -= match.quantity;
        match.quantity = 0; // update local cache
      } else {
        // Deduct partial and update
        amountDeducted = remainingToDeduct;
        const newQty = match.quantity - remainingToDeduct;
        await fridgeRepo.updateItemQuantity(match.id, newQty);
        match.quantity = newQty;
        remainingToDeduct = 0;
      }

      if (!match.is_wasted) {
        await inventoryLogRepo.insertLog(
          familyId,
          match.category || 'Khác',
          'consume',
          amountDeducted,
          match.unit
        );
      }
    }

    results.push({
      name: ing.name,
      category: ing.category,
      deducted: Number(ing.amountValue) - remainingToDeduct,
      requested: ing.amountValue,
      missing: remainingToDeduct
    });

    const deductedAmount = Number(ing.amountValue) - remainingToDeduct;
    if (deductedAmount > 0 && user) {
      const actorName = user.full_name || user.email || 'Một thành viên';
      await notificationService.createNotification(
        familyId,
        'CONSUME',
        'Sử dụng thực phẩm',
        `${actorName} đã lấy ${deductedAmount} ${ing.amountUnit || ''} ${ing.name} từ tủ lạnh để nấu ăn.`,
        { user_id: user.id, actor_name: actorName, item_name: ing.name, deducted: deductedAmount, unit: ing.amountUnit }
      );
    }
  }

  return results;
};

export const addFridgeItem = async (data: Partial<FridgeItem>, user?: any) => {
  if (!data.family_id || !data.name || data.quantity === undefined || !data.expiration_date) {
    throw new BadRequestError('Thiếu thông tin bắt buộc để thêm vào tủ lạnh.');
  }

  // Database bắt buộc `unit` không được null. Nếu là 'Gia vị' không có unit thì lưu chuỗi rỗng
  if (!data.unit) {
    data.unit = '';
  }

  const newItem = await fridgeRepo.addItem(data);

  // Log action
  await inventoryLogRepo.insertLog(
    data.family_id,
    data.category || 'Khác',
    'add',
    data.quantity,
    data.unit
  );

  console.log('--- addFridgeItem --- user is:', user);

  if (user) {
    const actorName = user.full_name || user.email || 'Một thành viên';
    const quantityText = data.category === 'Gia vị' ? '' : `${data.quantity} ${data.unit || ''} `;
    await notificationService.createNotification(
      data.family_id!,
      'ADD',
      'Thêm thực phẩm',
      `${actorName} đã thêm ${quantityText}${data.name} vào tủ lạnh.`,
      { user_id: user.id, actor_name: actorName, item_name: data.name, quantity: data.quantity, unit: data.unit, category: data.category }
    );
  }

  return newItem;
};

export const updateFridgeItem = async (id: string, data: Partial<FridgeItem>, user?: any) => {
  if (!id) throw new BadRequestError('Thiếu ID nguyên liệu.');

  const existingItem = await fridgeRepo.getItemById(id);
  if (!existingItem) {
    throw new NotFoundError('Không tìm thấy nguyên liệu trong tủ lạnh.');
  }

  // Nếu truyền `unit` là null (ví dụ khi update Gia vị), ép về chuỗi rỗng để không bị NOT NULL của Database chặn.
  // Nếu `unit` là undefined (không truyền trong request), thì giữ nguyên (không update trường này).
  if (data.unit === null) {
    data.unit = '';
  }

  if (data.quantity !== undefined && data.quantity <= 0) {
    // Dùng hết -> xóa
    // Chỉ ghi log consume nếu chưa bị phạt lãng phí
    if (!existingItem.is_wasted) {
      await inventoryLogRepo.insertLog(
        existingItem.family_id!,
        existingItem.category || 'Khác',
        'consume',
        existingItem.quantity, // log số lượng trước khi = 0
        existingItem.unit
      );
    }
    await fridgeRepo.deleteItem(id);

    if (user) {
      const actorName = user.full_name || user.email || 'Một thành viên';
      await notificationService.createNotification(
        existingItem.family_id!,
        'CONSUME',
        'Dùng hết thực phẩm',
        `${actorName} đã báo dùng hết ${existingItem.name}.`,
        { user_id: user.id, actor_name: actorName, item_name: existingItem.name }
      );
    }

    return { deleted: true, message: 'Đã dùng hết nguyên liệu.' };
  }

  // Cập nhật thông thường
  const updatedItem = await fridgeRepo.updateItem(id, data);

  if (user && data.quantity !== undefined && data.quantity !== existingItem.quantity) {
    const actorName = user.full_name || user.email || 'Một thành viên';
    await notificationService.createNotification(
      existingItem.family_id!,
      'UPDATE',
      'Cập nhật thực phẩm',
      `${actorName} đã cập nhật số lượng ${existingItem.name} từ ${existingItem.quantity} thành ${data.quantity} ${existingItem.unit || ''}.`,
      { user_id: user.id, actor_name: actorName, item_name: existingItem.name, old_qty: existingItem.quantity, new_qty: data.quantity, unit: existingItem.unit }
    );
  }

  return { deleted: false, item: updatedItem };
};

export const throwAwayFridgeItem = async (id: string, user?: any) => {
  if (!id) throw new BadRequestError('Thiếu ID nguyên liệu.');

  const existingItem = await fridgeRepo.getItemById(id);
  if (!existingItem) {
    throw new NotFoundError('Không tìm thấy nguyên liệu trong tủ lạnh.');
  }

  if (existingItem.is_wasted) {
    // Đã bị phạt lãng phí (expire) từ trước, giờ chỉ xóa lặng lẽ
    await fridgeRepo.deleteItem(id);
    return { message: 'Đã vứt bỏ nguyên liệu (không ghi thêm log).' };
  }

  // Chưa bị phạt -> ghi log waste do người dùng chủ động vứt
  await inventoryLogRepo.insertLog(
    existingItem.family_id!,
    existingItem.category || 'Khác',
    'waste',
    existingItem.quantity,
    existingItem.unit
  );

  await fridgeRepo.deleteItem(id);

  if (user) {
    const actorName = user.full_name || user.email || 'Một thành viên';
    const quantityText = existingItem.category === 'Gia vị' ? '' : `${existingItem.quantity} ${existingItem.unit || ''} `;
    await notificationService.createNotification(
      existingItem.family_id!,
      'WASTE',
      'Vứt bỏ thực phẩm',
      `${actorName} đã vứt bỏ ${quantityText}${existingItem.name}.`,
      { user_id: user.id, actor_name: actorName, item_name: existingItem.name, quantity: existingItem.quantity, unit: existingItem.unit }
    );
  }

  return { message: 'Đã vứt bỏ nguyên liệu.' };
};

export const checkExpiringItems = async (familyId: string) => {
  if (!familyId) throw new BadRequestError('Mã ID của gia đình không được để trống.');

  const items = await fridgeRepo.getItemsByFamilyId(familyId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  // Filter items that are expiring within 3 days or already expired
  const expiringItems = items.filter(item => {
    const expDate = new Date(item.expiration_date);
    return expDate <= threeDaysFromNow;
  });

  return expiringItems;
};

// Hàm này được gọi bởi Vercel Cronjob thông qua API
export const runCronCheck = async () => {
  console.log('Bắt đầu chạy Cronjob kiểm tra thực phẩm hết hạn...');
  
  const expiredItems = await fridgeRepo.getExpiredUnwastedItems();
  
  if (expiredItems.length === 0) {
    console.log('Không có thực phẩm nào hết hạn cần ghi log.');
    return { processedCount: 0 };
  }

  const itemIds: string[] = [];

  for (const item of expiredItems) {
    if (!item.family_id) continue;
    
    // Ghi log expire
    await inventoryLogRepo.insertLog(
      item.family_id,
      item.category || 'Khác',
      'expire',
      item.quantity,
      item.unit
    );

    // Đẩy notification
    await notificationService.createNotification(
      item.family_id,
      'EXPIRE',
      'Thực phẩm hết hạn',
      `⚠️ Cảnh báo: ${item.name} đã hết hạn!`,
      { item_name: item.name, quantity: item.quantity, unit: item.unit }
    );

    itemIds.push(item.id);
  }

  // Đánh dấu đã phạt lãng phí để không bị ghi log đúp vào hôm sau
  if (itemIds.length > 0) {
    await fridgeRepo.markItemsAsWasted(itemIds);
    console.log(`Đã ghi log lãng phí (expire) cho ${itemIds.length} món đồ.`);
  }

  return { processedCount: itemIds.length };
};
