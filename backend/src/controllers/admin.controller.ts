import type { Request, Response } from 'express';
import supabase from '../config/db.config.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total users
    let totalUsers = 0;
    const { count: usersCount, error: errUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .neq('role', 'Admin')
      .neq('role', 'admin');
    if (!errUsers) totalUsers = usersCount || 0;

    // 2. Active family groups
    let activeFamilies = 0;
    const { count: familiesCount, error: errFamilies } = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true });
    if (!errFamilies) activeFamilies = familiesCount || 0;

    // 3. Pending recipes
    let pendingRecipes = 0;
    const { count: recipesCount, error: errRecipes } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });
    if (!errRecipes) pendingRecipes = recipesCount || 0;

    // 4. System waste rate (Calculated based on inventory_logs amounts)
    let wasteRate = 0;
    const { data: logs, error: errLogs } = await supabase
      .from('inventory_logs')
      .select('action_type, amount');

    if (!errLogs && logs && logs.length > 0) {
      let totalAdded = 0;
      let totalWasted = 0;

      logs.forEach(log => {
        const amount = Number(log.amount) || 0;
        const action = String(log.action_type || '').toLowerCase();
        
        if (action.includes('add')) {
          totalAdded += amount;
        } else if (action.includes('expire') || action.includes('waste')) {
          totalWasted += amount;
        }
      });

      if (totalAdded > 0) {
        wasteRate = Number(((totalWasted / totalAdded) * 100).toFixed(1));
        if (wasteRate > 100) wasteRate = 100;
      }
    }

    // 5. User growth for the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data: usersLast7Days, error: errGrowth } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .neq('role', 'Admin')
      .neq('role', 'admin');

    // Initialize an array with 0 for the last 7 days
    const growthData = [0, 0, 0, 0, 0, 0, 0];
    
    if (!errGrowth && usersLast7Days) {
      usersLast7Days.forEach(user => {
        if (user.created_at) {
          const userDate = new Date(user.created_at);
          // Calculate difference in days between userDate and sevenDaysAgo
          const diffTime = userDate.getTime() - sevenDaysAgo.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays < 7) {
            growthData[diffDays] = (growthData[diffDays] || 0) + 1;
          }
        }
      });
    }

    // To make the chart look cumulative (total users up to that day)
    // We first need the base number of users before 7 days ago
    const baseUsersCount = totalUsers - (usersLast7Days?.length || 0);
    
    const cumulativeGrowth = [];
    let currentTotal = baseUsersCount;
    for (let i = 0; i < 7; i++) {
      currentTotal += (growthData[i] || 0);
      cumulativeGrowth.push(currentTotal);
    }

    // Calculate user growth percentage over the last 7 days
    let userGrowthRate = 0;
    const newUsers = usersLast7Days?.length || 0;
    if (baseUsersCount > 0) {
      userGrowthRate = Number(((newUsers / baseUsersCount) * 100).toFixed(1));
    } else {
      // If there were no users before the last 7 days, we can't calculate a meaningful growth rate
      // or we consider the growth rate as 0% to avoid confusion.
      userGrowthRate = 0;
    }

    // Prepare x-axis labels (T2, T3, T4, etc.)
    const labels = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(sevenDaysAgo.getDate() + i);
      labels.push(dayNames[d.getDay()]);
    }

    res.status(200).json({
      totalUsers: totalUsers,
      activeFamilies: activeFamilies,
      pendingRecipes: pendingRecipes,
      wasteRate,
      userGrowthRate,
      chartData: {
        labels,
        data: cumulativeGrowth
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê', error: error.message });
  }
};

export const getUsersList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'Admin')
      .neq('role', 'admin')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
      return;
    }

    // Fetch all families to map family_id to name
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('id, name');

    const familyMap = new Map();
    if (!familiesError && families) {
      families.forEach(f => {
        familyMap.set(f.id, f.name);
      });
    }

    const mappedUsers = users.map(u => {
      let role = u.role;
      if (!role || role === 'User') {
        role = 'Member';
      }

      let groupName = 'Chưa vào nhóm';
      if (u.family_id && familyMap.has(u.family_id)) {
        groupName = familyMap.get(u.family_id);
      }

      return {
        id: u.id,
        // Create a display name from email if name doesn't exist
        name: u.email ? u.email.split('@')[0] : 'Không rõ',
        email: u.email,
        role: role,
        group: groupName,
        status: u.status || 'active' // Use actual status or default to active
      };
    });

    res.status(200).json(mappedUsers);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu người dùng', error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ message: 'Thiếu ID người dùng' });
      return;
    }

    // 1. Lấy thông tin user trước khi xóa để biết họ thuộc nhóm gia đình nào
    const { data: usersData, error: fetchError } = await supabase
      .from('users')
      .select('family_id')
      .eq('id', id);

    if (fetchError) {
      console.error('Error fetching user before delete:', fetchError);
      res.status(500).json({ message: 'Lỗi khi kiểm tra dữ liệu người dùng' });
      return;
    }

    if (!usersData || usersData.length === 0) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    const familyId = usersData[0]?.family_id;

    // 2. Tiến hành xóa người dùng
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi xóa người dùng khỏi Database' });
      return;
    }

    // 3. Nếu người dùng thuộc 1 nhóm, kiểm tra xem nhóm đó còn ai không
    console.log(`Kiểm tra family_id: ${familyId}`);
    if (familyId) {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId);

      console.log(`Số lượng thành viên còn lại trong nhóm ${familyId} là: ${count}, error:`, countError);

      // Nếu đếm số lượng user trong nhóm đó = 0, thì xóa luôn nhóm
      if (!countError && count === 0) {
        console.log(`Đang tiến hành dọn dẹp các dữ liệu liên quan của nhóm ${familyId}...`);
        
        // Xóa các dữ liệu liên quan trước để tránh lỗi Foreign Key Constraint
        const { error: err1 } = await supabase.from('fridge_items').delete().eq('family_id', familyId);
        if (err1) console.error('Lỗi xóa fridge_items:', err1);
        
        const { error: err2 } = await supabase.from('recipes').delete().eq('family_id', familyId);
        if (err2) console.error('Lỗi xóa recipes:', err2);
        
        const { error: err3 } = await supabase.from('shopping_lists').delete().eq('family_id', familyId);
        if (err3) console.error('Lỗi xóa shopping_lists:', err3);
        
        const { error: err4 } = await supabase.from('meal_plans').delete().eq('family_id', familyId);
        if (err4) console.error('Lỗi xóa meal_plans:', err4);

        console.log(`Đang tiến hành xóa nhóm ${familyId}...`);
        const { error: delFamilyError } = await supabase
          .from('families')
          .delete()
          .eq('id', familyId);
          
        if (delFamilyError) {
          console.error('Lỗi khi xóa nhóm gia đình trống:', delFamilyError);
        } else {
          console.log(`Đã xóa thành công nhóm ${familyId}!`);
        }
      }
    }

    res.status(200).json({ message: 'Đã xóa người dùng thành công' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa người dùng', error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!id || !status) {
      res.status(400).json({ message: 'Thiếu thông tin ID hoặc status' });
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái trên Database (Có thể do bảng users chưa có cột status)' });
      return;
    }

    res.status(200).json({ message: 'Cập nhật trạng thái thành công' });
  } catch (error: any) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái', error: error.message });
  }
};

export const getWasteReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    
    let query = supabase
      .from('inventory_logs')
      .select('category, action_type, amount, created_at');

    if (year) {
      if (month) {
        // Filter items created within the specified month and year
        const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
        const endDate = new Date(Number(year), Number(month), 1).toISOString(); // 1st day of next month
        query = query.gte('created_at', startDate).lt('created_at', endDate);
      } else {
        // Filter items for the entire year
        const startDate = new Date(Number(year), 0, 1).toISOString();
        const endDate = new Date(Number(year) + 1, 0, 1).toISOString();
        query = query.gte('created_at', startDate).lt('created_at', endDate);
      }
    }

    const { data: logs, error: errLogs } = await query;

    console.log('Fetched inventory_logs:', logs?.length, 'Error:', errLogs);

    if (errLogs || !logs) {
      res.status(500).json({ message: 'Lỗi truy xuất dữ liệu nhật ký kho' });
      return;
    }

    // Process data to calculate waste percentage per category based on inventory_logs
    const categoryStats: Record<string, { total: number, wasted: number }> = {};

    logs.forEach((log: any) => {
      const category = log.category ? String(log.category) : '';
      if (!category) return;
      
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, wasted: 0 };
      }
      
      const amount = Number(log.amount) || 0;
      const action = String(log.action_type || '').toLowerCase();
      
      if (action.includes('add')) {
        categoryStats[category].total += amount;
      } else if (action.includes('expire') || action.includes('waste')) {
        categoryStats[category].wasted += amount;
      }
    });

    const reportData = Object.entries(categoryStats).map(([category, stats]) => {
      // Tính tỷ lệ hao phí (Tránh chia cho 0)
      const rate = stats.total > 0 ? Math.round((stats.wasted / stats.total) * 100) : 0;
      return {
        category,
        wasteRate: rate > 100 ? 100 : rate // Đảm bảo không quá 100% nếu logic nhập liệu có sai lệch
      };
    });

    // Sắp xếp báo cáo theo tỷ lệ lãng phí giảm dần
    reportData.sort((a, b) => b.wasteRate - a.wasteRate);

    res.status(200).json(reportData);
  } catch (error: any) {
    console.error('Error fetching waste report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Cài đặt hệ thống (System Settings) ---

export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('max_family_members, default_expiry_warning_days')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        res.status(200).json({ max_family_members: 10, default_expiry_warning_days: 3 });
        return;
      }
      res.status(500).json({ message: 'Lỗi lấy cài đặt hệ thống', error: error.message });
      return;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching system settings:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy cài đặt', error: error.message });
  }
};

export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { max_family_members, default_expiry_warning_days } = req.body;

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({ 
        id: 1, 
        max_family_members, 
        default_expiry_warning_days,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      .select();

    if (error) {
      res.status(500).json({ message: 'Lỗi cập nhật cài đặt hệ thống', error: error.message });
      return;
    }

    res.status(200).json({ message: 'Đã cập nhật cài đặt thành công', settings: data });
  } catch (error: any) {
    console.error('Error updating system settings:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật cài đặt', error: error.message });
  }
};

// --- Quản lý dữ liệu gốc (Master Data) ---

export const getMasterDataCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('category_units')
      .select('category, unit, default_storage_tip, is_visible');

    if (error) {
      throw error;
    }

    const categoryMap = new Map<string, any>();
    
    data?.forEach(row => {
      if (row.category === '__UNIT__') return; // Bỏ qua dummy category cho units
      if (!categoryMap.has(row.category)) {
        categoryMap.set(row.category, {
          category: row.category,
          unit: row.unit || '-',
          default_storage_tip: row.default_storage_tip || '',
          is_visible: row.is_visible !== false
        });
      } else {
        const existing = categoryMap.get(row.category);
        if (row.unit && row.unit !== '-' && existing.unit !== '-') {
          if (existing.unit === '-') {
            existing.unit = row.unit;
          } else if (!existing.unit.split(', ').includes(row.unit)) {
            existing.unit += `, ${row.unit}`;
          }
        }
      }
    });

    const uniqueCategories = Array.from(categoryMap.values()).sort((a, b) => a.category.localeCompare(b.category));
    res.status(200).json(uniqueCategories);
  } catch (error: any) {
    console.error('Error fetching master data categories:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu gốc', error: error.message });
  }
};

export const getMasterDataUnits = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('category_units')
      .select('unit, is_visible')
      .neq('unit', '-')
      .not('unit', 'is', null);

    if (error) {
      throw error;
    }

    const unitMap = new Map<string, any>();
    
    data?.forEach(row => {
      if (!unitMap.has(row.unit)) {
        unitMap.set(row.unit, {
          unit: row.unit,
          is_visible: row.is_visible !== false
        });
      }
    });

    const uniqueUnits = Array.from(unitMap.values()).sort((a, b) => a.unit.localeCompare(b.unit));
    res.status(200).json(uniqueUnits);
  } catch (error: any) {
    console.error('Error fetching master data units:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy đơn vị đo lường', error: error.message });
  }
};

export const updateMasterDataCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryName } = req.params;
    const { default_storage_tip, is_visible } = req.body;

    if (!categoryName) {
      res.status(400).json({ message: 'Thiếu tên danh mục' });
      return;
    }

    const { error } = await supabase
      .from('category_units')
      .update({ default_storage_tip, is_visible })
      .eq('category', categoryName);

    if (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: 'Lỗi khi cập nhật danh mục' });
      return;
    }

    res.status(200).json({ message: 'Cập nhật danh mục thành công' });
  } catch (error: any) {
    console.error('Error updating master data category:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật dữ liệu gốc', error: error.message });
  }
};

export const updateMasterDataUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldUnitName } = req.params;
    const { unit, is_visible } = req.body;

    if (!oldUnitName) {
      res.status(400).json({ message: 'Thiếu tên đơn vị cũ' });
      return;
    }

    const { error } = await supabase
      .from('category_units')
      .update({ unit: unit || '-', is_visible })
      .eq('unit', oldUnitName);

    if (error) {
      console.error('Update unit error:', error);
      if (error.code === '23503') {
        res.status(400).json({ message: 'Không thể sửa đơn vị vì đang có thực phẩm trong tủ lạnh sử dụng đơn vị cũ.' });
        return;
      }
      if (error.code === '23505') {
        res.status(400).json({ message: 'Lỗi trùng lặp dữ liệu đơn vị.' });
        return;
      }
      res.status(500).json({ message: 'Lỗi khi cập nhật đơn vị đo lường' });
      return;
    }

    res.status(200).json({ message: 'Cập nhật đơn vị thành công' });
  } catch (error: any) {
    console.error('Error updating master data unit:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật đơn vị', error: error.message });
  }
};

export const createMasterDataCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, unit, default_storage_tip, is_visible } = req.body;

    if (!category) {
      res.status(400).json({ message: 'Thiếu tên danh mục / đơn vị' });
      return;
    }

    const { error } = await supabase
      .from('category_units')
      .insert([
        { 
          category, 
          unit: unit || '-', 
          default_storage_tip: default_storage_tip || '',
          is_visible: is_visible !== false
        }
      ]);

    if (error) {
      console.error('Insert error:', error);
      if (error.code === '23505') {
        res.status(400).json({ message: 'Danh mục này đã tồn tại!' });
        return;
      }
      res.status(500).json({ message: 'Lỗi khi tạo danh mục' });
      return;
    }

    res.status(201).json({ message: 'Tạo danh mục thành công' });
  } catch (error: any) {
    console.error('Error creating master data category:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo dữ liệu gốc', error: error.message });
  }
};

export const createMasterDataUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { unit, is_visible } = req.body;

    if (!unit) {
      res.status(400).json({ message: 'Thiếu tên đơn vị' });
      return;
    }

    const { error } = await supabase
      .from('category_units')
      .insert([
        { 
          category: '__UNIT__', 
          unit: unit.trim(), 
          default_storage_tip: '',
          is_visible: is_visible !== false
        }
      ]);

    if (error) {
      console.error('Insert unit error:', error);
      if (error.code === '23505') {
        res.status(400).json({ message: 'Đơn vị này đã tồn tại!' });
        return;
      }
      res.status(500).json({ message: 'Lỗi khi thêm mới đơn vị' });
      return;
    }

    res.status(201).json({ message: 'Thêm mới đơn vị thành công' });
  } catch (error: any) {
    console.error('Error creating master data unit:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm mới đơn vị', error: error.message });
  }
};

export const deleteMasterDataUnit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { unitName } = req.params;

    if (!unitName) {
      res.status(400).json({ message: 'Thiếu tên đơn vị' });
      return;
    }

    // Kiểm tra xem đơn vị có đang được gán cho danh mục thực sự nào không
    const { data } = await supabase
      .from('category_units')
      .select('category')
      .eq('unit', unitName)
      .neq('category', '__UNIT__');

    if (data && data.length > 0) {
      res.status(400).json({ message: 'Đơn vị đang được sử dụng bởi các danh mục, không thể xóa.' });
      return;
    }

    const { error } = await supabase
      .from('category_units')
      .delete()
      .eq('category', '__UNIT__')
      .eq('unit', unitName);

    if (error) {
      console.error('Delete unit error:', error);
      res.status(500).json({ message: 'Lỗi khi xóa đơn vị đo lường' });
      return;
    }

    res.status(200).json({ message: 'Xóa đơn vị thành công' });
  } catch (error: any) {
    console.error('Error deleting master data unit:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa đơn vị', error: error.message });
  }
};

export const getMasterDataRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch system recipes (author_id is null)
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .is('author_id', null)
      .order('created_at', { ascending: false });

    console.log('Recipes fetched:', data, 'Error:', error);

    if (error) {
      console.error('Lỗi khi lấy danh sách công thức chuẩn:', error);
      res.status(500).json({ message: 'Lỗi server khi lấy công thức chuẩn' });
      return;
    }

    res.status(200).json(data || []);
  } catch (error: any) {
    console.error('Error fetching standard recipes:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const deleteMasterDataRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: 'Thiếu ID công thức' });
      return;
    }

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .is('author_id', null);

    if (error) {
      console.error('Lỗi khi xóa công thức chuẩn:', error);
      res.status(500).json({ message: 'Lỗi server khi xóa công thức chuẩn' });
      return;
    }

    res.status(200).json({ message: 'Xóa công thức chuẩn thành công' });
  } catch (error: any) {
    console.error('Error deleting standard recipe:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const createMasterDataRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipeData = req.body;
    
    const newRecipe = {
      ...recipeData,
      author_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: recipeData.likes_count || 0
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert(newRecipe)
      .select();

    if (error) {
      console.error('Lỗi tạo công thức:', error);
      res.status(500).json({ message: 'Lỗi tạo công thức', error: error.message });
      return;
    }
    
    res.status(201).json(data[0]);
  } catch (error: any) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

export const updateMasterDataRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipeData = req.body;

    const { data, error } = await supabase
      .from('recipes')
      .update({ ...recipeData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('author_id', null)
      .select();

    if (error) {
      console.error('Lỗi cập nhật công thức:', error);
      res.status(500).json({ message: 'Lỗi cập nhật công thức', error: error.message });
      return;
    }

    res.status(200).json(data[0]);
} catch (error: any) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// --- Kiểm duyệt nội dung (Content Approval) ---

export const getPendingRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('visibility', 'Pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Lấy thông tin user thủ công để tránh lỗi Join nếu thiếu Foreign Key hoặc sai tên cột
    if (recipes && recipes.length > 0) {
      const authorIds = recipes.map(r => r.author_id).filter(id => id);
      
      let usersMap = new Map();
      if (authorIds.length > 0) {
        // Thử lấy email, full_name hoặc name (để xử lý linh hoạt cho các trường hợp tên cột khác nhau)
        const { data: usersData } = await supabase
          .from('users')
          .select('*')
          .in('id', authorIds);
          
        if (usersData) {
          usersData.forEach(u => {
            // Ưu tiên full_name, name, hoặc lấy phần đầu của email
            const displayName = u.full_name || u.name || (u.email ? u.email.split('@')[0] : 'Không rõ');
            usersMap.set(u.id, { full_name: displayName });
          });
        }
      }

      const enrichedRecipes = recipes.map(r => ({
        ...r,
        author: r.author_id ? (usersMap.get(r.author_id) || { full_name: 'Không rõ' }) : null
      }));

      res.status(200).json(enrichedRecipes);
      return;
    }

    res.status(200).json([]);
  } catch (error: any) {
    console.error('Error fetching pending recipes:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy công thức chờ duyệt', error: error.message });
  }
};

export const approveRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('recipes')
      .update({ visibility: 'Public', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }
    res.status(200).json({ message: 'Duyệt công thức thành công' });
  } catch (error: any) {
    console.error('Error approving recipe:', error);
    res.status(500).json({ message: 'Lỗi server khi duyệt công thức', error: error.message });
  }
};

export const rejectRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('recipes')
      .update({ visibility: 'Private', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw error;
    }
    res.status(200).json({ message: 'Từ chối công thức thành công' });
  } catch (error: any) {
    console.error('Error rejecting recipe:', error);
    res.status(500).json({ message: 'Lỗi server khi từ chối công thức', error: error.message });
  }
};

export const deleteMasterDataCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      res.status(400).json({ message: 'Thiếu tên danh mục' });
      return;
    }

    const { error } = await supabase
      .from('category_units')
      .delete()
      .eq('category', categoryName);

    if (error) {
      console.error('Delete error:', error);
      // Lỗi ràng buộc khóa ngoại (foreign key constraint)
      if (error.code === '23503') {
        res.status(400).json({ message: 'Không thể xóa danh mục này vì đang có thực phẩm trong tủ lạnh hoặc công thức sử dụng nó.' });
        return;
      }
      res.status(500).json({ message: 'Lỗi khi xóa danh mục' });
      return;
    }

    res.status(200).json({ message: 'Đã xóa danh mục thành công' });
  } catch (error: any) {
    console.error('Error deleting master data category:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa dữ liệu gốc', error: error.message });
  }
};
