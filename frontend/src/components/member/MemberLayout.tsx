import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MemberHeader from './MemberHeader';
import MemberNavbar from './MemberNavbar';
import './MemberLayout.css';

const MemberLayout: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/member/dashboard';

  return (
    <div className="member-layout-container">
      {isDashboard && <MemberHeader />}
      <main className="member-content">
        <Outlet />
      </main>
      <MemberNavbar />
    </div>
  );
};

export default MemberLayout;
