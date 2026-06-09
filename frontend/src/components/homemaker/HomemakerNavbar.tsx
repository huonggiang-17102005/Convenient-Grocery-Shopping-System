import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, ChefHat, User } from 'lucide-react';
import './HomemakerLayout.css';

const navItems = [
  { path: '/homemaker/dashboard', icon: Home, label: 'Trang chủ' },
  { path: '/homemaker/fridge', icon: UtensilsCrossed, label: 'Tủ lạnh' },
  { path: '/homemaker/shopping-list', icon: ShoppingCart, label: 'Mua sắm' },
  { path: '/homemaker/recipes', icon: ChefHat, label: 'Công thức' },
  { path: '/homemaker/profile', icon: User, label: 'Hồ sơ' },
];

const HomemakerNavbar: React.FC = () => {
  return (
    <nav className="homemaker-bottom-nav">
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

export default HomemakerNavbar;
