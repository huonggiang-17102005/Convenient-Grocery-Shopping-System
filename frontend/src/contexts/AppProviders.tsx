import React from 'react';
import { AuthProvider } from './AuthContext';
import { FamilyProvider } from './FamilyContext';
import { FridgeProvider } from './FridgeContext';
import { ShoppingListProvider } from './ShoppingListContext';
import { RecipesProvider } from './RecipesContext';
import { MealPlannerProvider } from './MealPlannerContext';

// Gom tất cả Context Providers vào đây
// Khi thêm Context mới (Fridge, Recipe...), chỉ cần sửa file này
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <FamilyProvider>
        <FridgeProvider>
          <RecipesProvider>
            <ShoppingListProvider>
              <MealPlannerProvider>
                {children}
              </MealPlannerProvider>
            </ShoppingListProvider>
          </RecipesProvider>
        </FridgeProvider>
      </FamilyProvider>
    </AuthProvider>
  );
};

export default AppProviders;
