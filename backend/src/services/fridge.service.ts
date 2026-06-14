import * as fridgeRepo from '../repo/fridge.repo.js';
import { BadRequestError } from '../errors/CommonError.js';

export const getFamilyFridge = async (familyId: string) => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình (familyId) không được để trống.');
  }

  const items = await fridgeRepo.getItemsByFamilyId(familyId);
  
  return items;
};
