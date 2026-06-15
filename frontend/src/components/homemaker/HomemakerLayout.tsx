import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HomemakerHeader from './HomemakerHeader';
import HomemakerNavbar from './HomemakerNavbar';
import './HomemakerLayout.css';

const HomemakerLayout: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/homemaker/dashboard';

  return (
    <div className="homemaker-layout-container">
      {isDashboard && <HomemakerHeader />}
      <main className="homemaker-content">
        <Outlet />
      </main>
      <HomemakerNavbar />
    </div>
  );
};

export default HomemakerLayout;
