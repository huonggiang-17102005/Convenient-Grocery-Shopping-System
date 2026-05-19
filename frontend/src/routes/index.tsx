import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Các route khác sẽ được thêm ở đây */}
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
