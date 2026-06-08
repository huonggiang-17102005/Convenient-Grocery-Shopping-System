import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Shield } from 'lucide-react';
import './AdminLayout.css';

const navItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Bảng điều khiển' },
  { path: '/admin/users', icon: Users, label: 'Người dùng' },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
];

const AdminNavbar: React.FC = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-logo-section">
        <Shield size={24} color="#6366F1" />
        <span className="admin-logo-text">BridMate Admin</span>
      </div>
      <nav className="admin-nav-list">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <span style={{ fontSize: '12px', color: '#64748B' }}>Phiên bản 1.0.0</span>
      </div>
    </aside>
  );
};

export default AdminNavbar;
