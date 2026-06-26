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

export const leaveFamilyRepo = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ family_id: null, role: null })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new InternalServerError('Lỗi khi rời khỏi gia đình');
  return data;
};

export const kickUserRepo = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ family_id: null, role: 'Kicked' })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new InternalServerError('Lỗi khi xóa thành viên khỏi gia đình');
  return data;
};

export const transferHomemakerRole = async (currentHomemakerId: string, newHomemakerId: string) => {
  // Hạ quyền người hiện tại xuống Member
  const { error: error1 } = await supabase
    .from('users')
    .update({ role: 'Member' })
    .eq('id', currentHomemakerId);

  if (error1) {
    console.error('Lỗi hạ quyền chi tiết:', error1);
    throw new InternalServerError(`Lỗi khi hạ quyền Homemaker hiện tại: ${error1.message}`);
  }

  // Nâng quyền người mới lên Homemaker
  const { data, error: error2 } = await supabase
    .from('users')
    .update({ role: 'Homemaker' })
    .eq('id', newHomemakerId)
    .select('*')
    .single();

  if (error2) {
    console.error('Lỗi cấp quyền chi tiết:', error2);
    throw new InternalServerError(`Lỗi khi cấp quyền Homemaker mới: ${error2.message}`);
  }

  return data;
};

export const getFamilyById = async (familyId: string) => {
  const { data, error } = await supabase
    .from('families')
    .select('*')
    .eq('id', familyId)
    .single();

  if (error) {
    console.error('Lỗi khi lấy thông tin gia đình:', error);
    throw new InternalServerError('Không thể lấy thông tin gia đình');
  }
  return data;
};

export const updateExpirationWarningDays = async (familyId: string, days: number) => {
  const { data, error } = await supabase
    .from('families')
    .update({ expiration_warning_days: days })
    .eq('id', familyId)
    .select('*')
    .single();

  if (error) {
    console.error('Lỗi cập nhật ngày cảnh báo:', error);
    throw new InternalServerError('Không thể cập nhật số ngày cảnh báo hết hạn');
  }
  return data;
};
