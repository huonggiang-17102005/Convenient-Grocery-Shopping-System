import * as fridgeRepo from '../repo/fridge.repo.js';
import { BadRequestError } from '../errors/CommonError.js';

export const getFamilyFridge = async (familyId: string) => {
  if (!familyId) {
    throw new BadRequestError('Mã ID của gia đình (familyId) không được để trống.');
  }

  const items = await fridgeRepo.getItemsByFamilyId(familyId);
  
  return items;
};

export const deductInventory = async (
  familyId: string, 
  ingredients: { name: string; category?: string; amountValue: number; amountUnit: string }[]
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

      if (match.quantity <= remainingToDeduct) {
        // Deduct full match quantity and delete
        await fridgeRepo.deleteItem(match.id);
        remainingToDeduct -= match.quantity;
        match.quantity = 0; // update local cache
      } else {
        // Deduct partial and update
        const newQty = match.quantity - remainingToDeduct;
        await fridgeRepo.updateItemQuantity(match.id, newQty);
        match.quantity = newQty;
        remainingToDeduct = 0;
      }
    }

    results.push({
      name: ing.name,
      category: ing.category,
      deducted: Number(ing.amountValue) - remainingToDeduct,
      requested: ing.amountValue,
      missing: remainingToDeduct
    });
  }

  return results;
};
