import React from 'react';
import { AuthProvider } from './AuthContext';
import { FamilyProvider } from './FamilyContext';
import { FridgeProvider } from './FridgeContext';
import { ShoppingListProvider } from './ShoppingListContext';
import { RecipesProvider } from './RecipesContext';
import { MealPlannerProvider } from './MealPlannerContext';
import { CategoryProvider } from './CategoryContext';
import { NotificationProvider } from './NotificationContext';

// Gom tất cả Context Providers vào đây
// Khi thêm Context mới (Fridge, Recipe...), chỉ cần sửa file này
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <FamilyProvider>
        <CategoryProvider>
          <FridgeProvider>
            <RecipesProvider>
              <ShoppingListProvider>
                <MealPlannerProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
                </MealPlannerProvider>
              </ShoppingListProvider>
            </RecipesProvider>
          </FridgeProvider>
        </CategoryProvider>
      </FamilyProvider>
    </AuthProvider>
  );
};

export default AppProviders;
