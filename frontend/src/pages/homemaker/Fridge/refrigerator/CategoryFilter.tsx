import React from 'react';
import type { FoodCategory } from '../../../../types/homemaker/Fridge';

interface CategoryFilterProps {
  activeCategory: FoodCategory;
  onCategoryChange: (category: FoodCategory) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, onCategoryChange }) => {
  const categories: FoodCategory[] = ['Tất cả', 'Rau củ', 'Thịt cá', 'Đồ khô', 'Gia vị', 'Chất lỏng', 'Khác'];

  return (
    <div className="refrigerator-category-group">
      {categories.map(category => (
        <button
          key={category}
          className={`category-pill ${activeCategory === category ? 'active' : ''}`}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
