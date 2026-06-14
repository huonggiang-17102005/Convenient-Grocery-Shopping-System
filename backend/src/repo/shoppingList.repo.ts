import supabase from '../config/db.config.js';
import { InternalServerError, NotFoundError } from '../errors/CommonError.js';

export const getActiveLists = async (familyId: string) => {
  const { data, error } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('family_id', familyId)
    .in('status', ['Planning', 'Shopping']);

  if (error) {
    console.error('Error fetching active shopping lists:', error);
    throw new InternalServerError('Không thể lấy danh sách mua sắm.');
  }

  return data;
};

export const getOrCreateActiveList = async (familyId: string): Promise<any> => {
  const { data: activeList, error: err } = await supabase
    .from('shopping_lists')
    .select('*')
    .eq('family_id', familyId)
    .in('status', ['Planning', 'Shopping'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (err) {
    console.error('Error finding active shopping list:', err);
    throw new InternalServerError('Lỗi khi truy vấn danh sách mua sắm.');
  }

  if (activeList) return activeList;

  // Create a new one
  const newList = {
    family_id: familyId,
    title: 'Danh sách đi chợ tuần này',
    status: 'Shopping',
    target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default to tomorrow
  };

  const { data: created, error: createErr } = await supabase
    .from('shopping_lists')
    .insert([newList])
    .select()
    .single();

  if (createErr) {
    console.error('Error creating shopping list:', createErr);
    throw new InternalServerError('Không thể tạo danh sách mua sắm mới.');
  }
  return created;
};

export const getActiveListItems = async (familyId: string) => {
  const lists = await getActiveLists(familyId);
  if (!lists || lists.length === 0) return [];

  const listIds = lists.map(l => l.id);

  const { data, error } = await supabase
    .from('shopping_list_items')
    .select('*')
    .in('list_id', listIds)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching shopping list items:', error);
    throw new InternalServerError('Không thể lấy chi tiết các mặt hàng mua sắm.');
  }

  return data;
};

export const getItemById = async (id: string) => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    throw new NotFoundError('Không tìm thấy mặt hàng mua sắm này.');
  }

  return data;
};

export const createItem = async (itemData: any) => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert([itemData])
    .select()
    .single();

  if (error) {
    console.error('Error creating shopping list item:', error);
    throw new InternalServerError('Không thể thêm mặt hàng mua sắm.');
  }

  return data;
};

export const updateItem = async (id: string, itemData: any) => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating shopping list item:', error);
    throw new InternalServerError('Không thể cập nhật mặt hàng mua sắm.');
  }

  return data;
};

export const deleteItem = async (id: string) => {
  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shopping list item:', error);
    throw new InternalServerError('Không thể xóa mặt hàng mua sắm.');
  }
};
