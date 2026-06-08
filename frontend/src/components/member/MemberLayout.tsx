import React from 'react';
import { Outlet } from 'react-router-dom';
import MemberHeader from './MemberHeader';
import MemberNavbar from './MemberNavbar';
import './MemberLayout.css';

const MemberLayout: React.FC = () => {
  return (
    <div className="member-layout-container">
      <MemberHeader />
      <main className="member-content">
        <Outlet />
      </main>
      <MemberNavbar />
    </div>
  );
};

export default MemberLayout;
