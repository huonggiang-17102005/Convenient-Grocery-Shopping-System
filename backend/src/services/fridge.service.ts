import * as fridgeRepo from '../repo/fridge.repo.js';
import type { FridgeItem } from '../models/FridgeItem.js';
import { BadRequestError } from '../errors/CommonError.js';

export const getFamilyFridge = async (familyId: string) => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình (familyId) không được để trống.');
  }

  const items = await fridgeRepo.getItemsByFamilyId(familyId);
  
  return items;
};

/**
 * Thêm thực phẩm mới vào tủ lạnh (dành cho tab tủ lạnh — thêm thủ công)
 * Luôn tạo record MỚI: mỗi lần mua là một lần nhập kho riêng,
 * có thể cùng tên nhưng ngày hết hạn khác nhau.
 */
export const addToFridge = async (payload: {
  family_id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string | null;
  image_url?: string | null;
  image_public_id?: string | null;
  location?: string | null;
  expiration_date: string;
  is_wasted?: boolean;
}): Promise<FridgeItem> => {
  if (!payload.family_id) throw new BadRequestError('family_id không được để trống.');
  if (!payload.name?.trim()) throw new BadRequestError('Tên thực phẩm không được để trống.');
  if (!payload.quantity || payload.quantity <= 0) throw new BadRequestError('Số lượng phải lớn hơn 0.');
  if (!payload.unit?.trim()) throw new BadRequestError('Đơn vị không được để trống.');
  if (!payload.expiration_date) throw new BadRequestError('Ngày hết hạn không được để trống.');

  // Luôn tạo mới — không upsert
  return await fridgeRepo.createFridgeItem({
    family_id: payload.family_id,
    name: payload.name.trim(),
    quantity: payload.quantity,
    unit: payload.unit.trim(),
    category: payload.category ?? null,
    image_url: payload.image_url ?? null,
    image_public_id: payload.image_public_id ?? null,
    location: payload.location ?? null,
    expiration_date: payload.expiration_date,
    is_wasted: payload.is_wasted ?? false,
  });
};

