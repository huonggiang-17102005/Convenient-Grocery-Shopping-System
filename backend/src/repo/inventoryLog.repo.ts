import supabase from '../config/db.config.js';
import { InternalServerError } from '../errors/CommonError.js';

export const insertLog = async (
  familyId: string,
  category: string,
  actionType: string,
  amount: number,
  unit: string
): Promise<void> => {
  const { error } = await supabase.from('inventory_logs').insert([
    {
      family_id: familyId,
      category: category,
      action_type: actionType,
      amount: amount,
      unit: unit,
    },
  ]);

  if (error) {
    console.error('Lỗi khi insert inventory_logs:', error);
    throw new InternalServerError('Không thể ghi nhận lịch sử kho.');
  }
};
