import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CategoryData {
  category: string;
  units: string[];
  default_storage_tip: string | null;
}

interface CategoryContextType {
  categoriesData: CategoryData[];
  refreshCategories: () => Promise<void>;
  isLoading: boolean;
}

const CategoryContext = createContext<CategoryContextType>({
  categoriesData: [],
  refreshCategories: async () => {},
  isLoading: false,
});

export const useCategoryContext = () => useContext(CategoryContext);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>(() => {
    const cached = localStorage.getItem('cached_categories');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync cache whenever items change
  useEffect(() => {
    localStorage.setItem('cached_categories', JSON.stringify(categoriesData));
  }, [categoriesData]);

  const refreshCategories = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`http://localhost:5000/api/categories`);
      const result = await res.json();

      if (result.success) {
        setCategoriesData(result.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục thực phẩm:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch lần đầu
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  return (
    <CategoryContext.Provider value={{ categoriesData, refreshCategories, isLoading }}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
