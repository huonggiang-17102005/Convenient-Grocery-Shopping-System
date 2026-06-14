import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, ChefHat, User } from 'lucide-react';
import './MemberLayout.css';

const navItems = [
  { path: '/member/dashboard', icon: Home, label: 'Trang chủ' },
  { path: '/member/refrigerator', icon: UtensilsCrossed, label: 'Tủ lạnh' },
  { path: '/member/shopping-list', icon: ShoppingCart, label: 'Mua sắm' },
  { path: '/member/recipes', icon: ChefHat, label: 'Công thức' },
  { path: '/member/profile', icon: User, label: 'Hồ sơ' },
];

const MemberNavbar: React.FC = () => {
  return (
    <nav className="member-bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <item.icon size={24} />
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MemberNavbar;
