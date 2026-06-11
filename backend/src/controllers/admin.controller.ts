import type { Request, Response } from 'express';
import supabase from '../config/db.config.js';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Total users
    let totalUsers = 0;
    const { count: usersCount, error: errUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
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

    // 4. System waste rate (Calculated based on fridge_items is_wasted flag)
    let wasteRate = 0;
    const { count: totalItems, error: errItems } = await supabase
      .from('fridge_items')
      .select('*', { count: 'exact', head: true });
      
    if (!errItems && totalItems && totalItems > 0) {
      const { count: wastedItems, error: errWasted } = await supabase
        .from('fridge_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_wasted', true);
        
      if (!errWasted && wastedItems) {
        wasteRate = Number(((wastedItems / totalItems) * 100).toFixed(1));
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
      .gte('created_at', sevenDaysAgo.toISOString());

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

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Lỗi khi xóa người dùng khỏi Database' });
      return;
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
