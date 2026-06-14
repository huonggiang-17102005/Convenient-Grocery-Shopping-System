import React from 'react';
import { FamilyProvider } from './FamilyContext';
import { FridgeProvider } from './FridgeContext';

// Gom tất cả Context Providers vào đây
// Khi thêm Context mới (Fridge, Recipe...), chỉ cần sửa file này
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FamilyProvider>
      <FridgeProvider>
        {children}
      </FridgeProvider>
    </FamilyProvider>
  );
};

export default AppProviders;
