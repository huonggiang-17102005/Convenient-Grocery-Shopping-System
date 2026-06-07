import React from 'react';
import { Outlet } from 'react-router-dom';
import HomemakerHeader from './HomemakerHeader';
import HomemakerBottomNav from './HomemakerBottomNav';
import './HomemakerLayout.css';

const HomemakerLayout: React.FC = () => {
  return (
    <div className="homemaker-layout-container">
      <HomemakerHeader />
      <main className="homemaker-content">
        <Outlet />
      </main>
      <HomemakerBottomNav />
    </div>
  );
};

export default HomemakerLayout;
