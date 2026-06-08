import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminLayout.css';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        Quản trị hệ thống
      </div>
      <div className="admin-header-actions">
        <button 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
          title="Thông báo"
        >
          <Bell size={20} />
        </button>
        <div className="admin-profile-info">
          <div className="admin-avatar">
            AD
          </div>
          <span className="admin-name">Administrator</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500 }}
          title="Đăng xuất"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
