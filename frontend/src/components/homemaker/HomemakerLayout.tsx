import React from 'react';
import { Outlet } from 'react-router-dom';
import HomemakerHeader from './HomemakerHeader';
import HomemakerNavbar from './HomemakerNavbar';
import './HomemakerLayout.css';

const HomemakerLayout: React.FC = () => {
  return (
    <div className="homemaker-layout-container">
      <HomemakerHeader />
      <main className="homemaker-content">
        <Outlet />
      </main>
      <HomemakerNavbar />
    </div>
  );
};

export default HomemakerLayout;
