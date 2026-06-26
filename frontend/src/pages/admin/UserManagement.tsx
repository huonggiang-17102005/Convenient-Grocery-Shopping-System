import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, Unlock, Trash2, Copy, Check } from 'lucide-react';
import CustomSelect from '../../components/common/CustomSelect';
import './Dashboard.css';
import './UserManagement.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  group: string;
  status: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/admin/users`);
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/admin/users/${userToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = (user.status || '').toLowerCase() === 'active' ? 'locked' : 'active';
    
    // Optimistic UI update so the user sees it immediately even if DB fails
    setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) throw new Error('Failed to update user status');
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar - Reused from Dashboard */}
      <div className="admin-db-sidebar">
        <div className="admin-db-logo">
          <div className="admin-db-logo-text">FridMate Admin</div>
        </div>
        
        <div className="admin-db-nav">
          <div className="admin-db-nav-item" onClick={() => handleNavigate('/admin/dashboard')}>
            <div className="admin-db-nav-text">Tổng quan</div>
          </div>
          <div className="admin-db-nav-item active">
            <div className="admin-db-nav-text">Quản lý người dùng</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/recipe-approval')}>
            <div className="admin-db-nav-text">Kiểm duyệt nội dung</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/master-data')}>
            <div className="admin-db-nav-text">Quản lý dữ liệu gốc</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/settings')}>
            <div className="admin-db-nav-text">Báo cáo & Cài đặt</div>
          </div>
        </div>

        <div className="admin-db-logout-container">
          <div className="admin-db-logout-btn" onClick={handleLogout}>
            <div className="admin-db-logout-text">Đăng xuất</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-db-main">
        <div className="admin-db-content">
          {/* Header */}
          <div className="admin-db-header" style={{ justifyContent: 'flex-start' }}>
            <h1 className="admin-db-title">Quản lý người dùng</h1>
          </div>

          {/* Search & Filters */}
          <div className="um-header-actions">
            <div className="um-search-box">
              <Search className="um-search-icon" />
              <input 
                type="text" 
                className="um-search-input" 
                placeholder="Tìm kiếm theo tên hoặc email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filters */}
            <CustomSelect
              value={roleFilter}
              onChange={setRoleFilter}
              options={[
                { value: 'all', label: 'Vai trò: Tất cả' },
                { value: 'homemaker', label: 'Vai trò: Homemaker' },
                { value: 'member', label: 'Vai trò: Member' },
              ]}
              triggerHeight={40}
              fontSize={14}
              padding="0 16px"
              className="um-filter-select"
            />

            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'Trạng thái: Tất cả' },
                { value: 'active', label: 'Trạng thái: Hoạt động' },
                { value: 'locked', label: 'Trạng thái: Bị khóa' },
              ]}
              triggerHeight={40}
              fontSize={14}
              padding="0 16px"
              className="um-filter-select"
            />
          </div>

          {/* User Table */}
          <div className="um-table-container">
            <table className="um-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Nhóm gia đình</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Chưa có người dùng nào.</td>
                  </tr>
                ) : (
                  users.filter(u => {
                    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter;
                    const matchesStatus = statusFilter === 'all' || (u.status || '').toLowerCase() === statusFilter.toLowerCase();
                    
                    return matchesSearch && matchesRole && matchesStatus;
                  }).map((user) => (
                    <tr key={user.id}>
                      <td className="um-user-id" title={user.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {user.id.substring(0, 8)}...
                          <div 
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            onClick={() => handleCopyId(user.id)}
                            title="Sao chép ID"
                          >
                            {copiedId === user.id ? (
                              <Check size={14} color="#2E7D32" />
                            ) : (
                              <Copy size={14} color="#757575" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="um-user-name">{user.name}</td>
                      <td className="um-user-email">{user.email}</td>
                      <td>
                        <span className={user.role === 'Homemaker' ? 'um-badge-role-homemaker' : 'um-badge-role-member'}>
                          {user.role}
                        </span>
                      </td>
                      <td className="um-group-name">{user.group}</td>
                      <td>
                        {(user.status || '').toLowerCase() === 'locked' ? (
                          <div className="um-badge-status-locked">
                            Bị khóa
                          </div>
                        ) : (
                          <div className="um-badge-status-active">
                            Hoạt động
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="um-actions">
                          {(user.status || '').toLowerCase() === 'locked' ? (
                            <div className="um-action-icon" title="Mở khóa tài khoản" onClick={() => handleToggleStatus(user)}>
                              <Lock size={18} color="#1A1A1A" />
                            </div>
                          ) : (
                            <div className="um-action-icon" title="Khóa tài khoản" onClick={() => handleToggleStatus(user)}>
                              <Unlock size={18} color="#2E7D32" />
                            </div>
                          )}
                          <div className="um-action-icon" title="Xóa người dùng" onClick={() => setUserToDelete(user)}>
                            <Trash2 size={18} color="#D32F2F" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="um-modal-overlay">
          <div className="um-modal">
            <div className="um-modal-title">Cảnh báo nghiêm trọng</div>
            <div className="um-modal-desc">
              Bạn có chắc chắn muốn xóa tài khoản này không? 
            </div>
            <div className="um-modal-actions">
              <div className="um-modal-cancel-btn" onClick={() => setUserToDelete(null)}>Hủy bỏ</div>
              <div className="um-modal-delete-btn" onClick={handleDeleteConfirm}>Vẫn tiến hành xóa</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
