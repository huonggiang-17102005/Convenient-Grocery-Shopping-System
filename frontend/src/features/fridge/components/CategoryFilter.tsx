import React from 'react';
import type { FoodCategory } from '../types';
import FridgeDropdown from './FridgeDropdown';

interface CategoryFilterProps {
  activeCategory: FoodCategory;
  onCategoryChange: (category: FoodCategory) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'Tất cả',     label: 'Tất cả danh mục' },
  { value: 'Thịt cá',   label: '🥩  Thịt cá' },
  { value: 'Rau củ quả',label: '🥕  Rau củ quả' },
  { value: 'Trứng',     label: '🥚  Trứng' },
  { value: 'Chất lỏng', label: '🥛  Chất lỏng' },
  { value: 'Đồ khô',    label: '🌾  Đồ khô' },
  { value: 'Gia vị',    label: '🧂  Gia vị' },
  { value: 'Khác',      label: '📦  Khác' },
];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, onCategoryChange }) => (
  <FridgeDropdown
    value={activeCategory}
    onChange={(v) => onCategoryChange(v as FoodCategory)}
    options={CATEGORY_OPTIONS}
  />
);

export default CategoryFilter;
