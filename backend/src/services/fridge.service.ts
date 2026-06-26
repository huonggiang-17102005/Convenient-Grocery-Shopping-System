import * as fridgeRepo from '../repo/fridge.repo.js';
import * as inventoryLogRepo from '../repo/inventoryLog.repo.js';
import * as notificationService from './notification.service.js';
import { BadRequestError, NotFoundError } from '../errors/CommonError.js';
import type { FridgeItem } from '../models/FridgeItem.js';
import supabase from '../config/db.config.js';

export const getFamilyFridge = async (familyId: string) => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình (familyId) không được để trống.');
  }

  const items = await fridgeRepo.getItemsByFamilyId(familyId);
  const now = new Date();
  
  // Lọc bỏ thực phẩm đã hết hạn (chênh lệch ngày <= 0) hoặc bị đánh dấu lãng phí
  return items.filter(item => {
    if (item.is_wasted) return false;
    const expDate = new Date(item.expiration_date);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0;
  });
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

  if (user) {
    const actorName = user.full_name || user.email || 'Một thành viên';
    const changes: string[] = [];

    if (data.name !== undefined && data.name !== existingItem.name) {
      changes.push(`tên từ '${existingItem.name}' thành '${data.name}'`);
    }
    if (data.category !== undefined && data.category !== existingItem.category) {
      changes.push(`danh mục từ '${existingItem.category || 'Khác'}' thành '${data.category}'`);
    }
    if (data.location !== undefined && data.location !== existingItem.location) {
      changes.push(`vị trí từ '${existingItem.location || 'Ngăn mát'}' thành '${data.location}'`);
    }
    if (data.quantity !== undefined && data.quantity !== existingItem.quantity) {
      changes.push(`số lượng từ ${existingItem.quantity} thành ${data.quantity} ${existingItem.unit || ''}`.trim());
    }
    if (data.expiration_date !== undefined) {
      // Compare dates using vi-VN format
      const oldDate = new Date(existingItem.expiration_date).toLocaleDateString('vi-VN');
      const newDate = new Date(data.expiration_date).toLocaleDateString('vi-VN');
      if (oldDate !== newDate) {
        changes.push(`hạn sử dụng từ '${oldDate}' thành '${newDate}'`);
      }
    }
    if (data.image_url !== undefined && data.image_url !== existingItem.image_url) {
      changes.push(`ảnh thực phẩm`);
    }

    if (changes.length > 0) {
      const changesText = changes.join(', ');
      await notificationService.createNotification(
        existingItem.family_id!,
        'UPDATE',
        'Cập nhật thực phẩm',
        `${actorName} đã cập nhật thông tin ${existingItem.name}: đổi ${changesText}.`,
        { 
          user_id: user.id, 
          actor_name: actorName, 
          item_name: existingItem.name,
          changes: changes
        }
      );
    }
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
  const now = new Date();
  
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(now.getDate() + 3);

  // Lọc những thực phẩm sắp hết hạn (0 < daysRemaining <= 3) và chưa bị đánh dấu lãng phí
  return items.filter(item => {
    if (item.is_wasted) return false;
    const expDate = new Date(item.expiration_date);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  });
};

// Hàm này được gọi bởi Vercel Cronjob thông qua API
export const runCronCheck = async () => {
  console.log('Bắt đầu chạy Cronjob kiểm tra thực phẩm hết hạn và sắp hết hạn...');

  // 1. Lấy cấu hình các gia đình và hệ thống
  const { data: families } = await supabase.from('families').select('id, expiration_warning_days');
  const { data: systemSetting } = await supabase
    .from('system_settings')
    .select('default_expiry_warning_days')
    .order('id', { ascending: true })
    .limit(1)
    .single();
  const globalDefault = systemSetting?.default_expiry_warning_days ?? 3;

  const familyConfigMap: Record<string, number> = {};
  if (families) {
    families.forEach((f: any) => {
      familyConfigMap[f.id] = f.expiration_warning_days ?? globalDefault;
    });
  }

  // 2. Lấy tất cả thực phẩm chưa bị lãng phí
  const { data: allItems } = await supabase
    .from('fridge_items')
    .select('*')
    .is('is_wasted', false);

  if (!allItems || allItems.length === 0) {
    console.log('Không có thực phẩm nào cần kiểm tra.');
    return { processedCount: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiredItemIds: string[] = [];
  const expiringItemsByFamily: Record<string, any[]> = {};
  let processedCount = 0;

  for (const item of allItems) {
    if (!item.family_id) continue;
    
    const warningDays = familyConfigMap[item.family_id] ?? 3;
    const expDate = new Date(item.expiration_date);
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // Đã hết hạn
      await inventoryLogRepo.insertLog(
        item.family_id,
        item.category || 'Khác',
        'expire',
        item.quantity,
        item.unit
      );

      await notificationService.createNotification(
        item.family_id,
        'EXPIRE',
        'Thực phẩm hết hạn',
        `⚠️ Cảnh báo: ${item.name} đã hết hạn!`,
        { item_name: item.name, quantity: item.quantity, unit: item.unit }
      );

      expiredItemIds.push(item.id);
      processedCount++;
    } else if (diffDays >= 0 && diffDays <= warningDays) {
      // Nằm trong vùng cảnh báo sắp hết hạn
      const famId = item.family_id;
      if (!expiringItemsByFamily[famId]) {
        expiringItemsByFamily[famId] = [];
      }
      expiringItemsByFamily[famId]!.push({ ...item, diffDays });
      processedCount++;
    }
  }

  // Đánh dấu đã phạt lãng phí
  if (expiredItemIds.length > 0) {
    await fridgeRepo.markItemsAsWasted(expiredItemIds);
    console.log(`Đã ghi log lãng phí (expire) cho ${expiredItemIds.length} món đồ.`);
  }

  // Xóa thực phẩm hết hạn khỏi tủ lạnh luôn để giải phóng dung lượng DB
  if (expiredItemIds.length > 0) {
    for (const id of expiredItemIds) {
      await fridgeRepo.deleteItem(id);
    }
    console.log(`Đã ghi log lãng phí (expire) và xóa ${expiredItemIds.length} món đồ hết hạn.`);
  }

  // Gửi một thông báo tổng hợp cho các món sắp hết hạn của mỗi gia đình (giữ nguyên tính năng mới từ main)
  for (const [familyId, items] of Object.entries(expiringItemsByFamily)) {
    const itemNames = items.map(i => `${i.name} (${i.diffDays === 0 ? 'hết hạn hôm nay' : `còn ${i.diffDays} ngày`})`).join(', ');
    await notificationService.createNotification(
      familyId,
      'EXPIRING_SOON',
      'Thực phẩm sắp hết hạn',
      `⌛ có ${items.length} thực phẩm sắp hết hạn: ${itemNames}. Hãy nhanh chóng sử dụng`,
      { count: items.length, items: items.map(i => ({ name: i.name, days_left: i.diffDays })) }
    );
  }

  return { processedCount: expiredItemIds.length };
};
