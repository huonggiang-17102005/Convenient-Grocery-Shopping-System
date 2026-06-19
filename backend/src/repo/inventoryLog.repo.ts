import supabase from '../config/db.config.js';
import { InternalServerError } from '../errors/CommonError.js';
import type { InventoryLog } from '../models/InventoryLog.js';

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

export const getLogsByFamilyAndMonth = async (
  familyId: string,
  month: number,
  year: number
): Promise<InventoryLog[]> => {
  // start of month
  const startDate = new Date(year, month - 1, 1).toISOString();
  // start of next month
  const endDate = new Date(year, month, 1).toISOString();

  const { data, error } = await supabase
    .from('inventory_logs')
    .select('*')
    .eq('family_id', familyId)
    .gte('created_at', startDate)
    .lt('created_at', endDate);

  if (error) {
    console.error('Lỗi khi fetch inventory_logs:', error);
    throw new InternalServerError('Không thể lấy lịch sử kho.');
  }

  return data as InventoryLog[];
};
