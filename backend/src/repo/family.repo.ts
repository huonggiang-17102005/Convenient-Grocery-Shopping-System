import supabase from '../config/db.config.js';
import { InternalServerError } from '../errors/CommonError.js';

export const getFamilyMembers = async (familyId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, avatar, role')
    .eq('family_id', familyId);

  if (error) throw new InternalServerError('Lỗi truy vấn danh sách thành viên gia đình');
  return data;
};

export const removeUserFromFamily = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ family_id: null, role: null })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new InternalServerError('Lỗi khi xóa/rời khỏi gia đình');
  return data;
};

export const transferHomemakerRole = async (currentHomemakerId: string, newHomemakerId: string) => {
  // Hạ quyền người hiện tại xuống Member
  const { error: error1 } = await supabase
    .from('users')
    .update({ role: 'Member' })
    .eq('id', currentHomemakerId);

  if (error1) throw new InternalServerError('Lỗi khi hạ quyền Homemaker hiện tại');

  // Nâng quyền người mới lên Homemaker
  const { data, error: error2 } = await supabase
    .from('users')
    .update({ role: 'Homemaker' })
    .eq('id', newHomemakerId)
    .select('*')
    .single();

  if (error2) throw new InternalServerError('Lỗi khi cấp quyền Homemaker mới');

  return data;
};
