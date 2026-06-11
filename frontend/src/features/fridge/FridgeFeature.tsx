import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import './fridge.css';
import type { FoodItem, StorageType, FoodCategory } from './types';
import RefrigeratorHeader from './components/RefrigeratorHeader';
import StorageFilter from './components/StorageFilter';
import CategoryFilter from './components/CategoryFilter';
import FoodCard from './components/FoodCard';

export interface FridgeFeatureProps {
  role?: 'homemaker' | 'member';
}

const MOCK_DATA: FoodItem[] = [
  { id: '1', emoji: '🥕', name: 'Cà rốt', quantity: 3, daysRemaining: 7, category: 'Rau củ', storageType: 'Ngăn mát' },
  { id: '2', emoji: '🥩', name: 'Thịt bò', quantity: 1, daysRemaining: 1, category: 'Thịt cá', storageType: 'Ngăn đông' },
  { id: '3', emoji: '🥛', name: 'Sữa tươi', quantity: 2, daysRemaining: 3, category: 'Đồ uống', storageType: 'Ngăn mát' },
  { id: '4', emoji: '🧅', name: 'Hành tây', quantity: 4, daysRemaining: 5, category: 'Rau củ', storageType: 'Khô' },
];

export const FridgeFeature: React.FC<FridgeFeatureProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStorage, setActiveStorage] = useState<StorageType>('Tất cả');
  const [activeCategory, setActiveCategory] = useState<FoodCategory>('Tất cả');
  const [items, setItems] = useState<FoodItem[]>(() => {
    const data = localStorage.getItem('homemaker_fridge_items');
    if (!data) {
      localStorage.setItem('homemaker_fridge_items', JSON.stringify(MOCK_DATA));
      return MOCK_DATA;
    }
    return JSON.parse(data);
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('homemaker_fridge_items', JSON.stringify(updatedItems));
  };

  const handleSelect = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStorage = activeStorage === 'Tất cả' || item.storageType === activeStorage;
    const matchCategory = activeCategory === 'Tất cả' || item.category === activeCategory;
    return matchSearch && matchStorage && matchCategory;
  });

  return (
    <div className="refrigerator-page">
      <RefrigeratorHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <StorageFilter activeStorage={activeStorage} onStorageChange={setActiveStorage} />
      <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      
      <div className="food-list-container">
        {filteredItems.map(item => (
          <FoodCard 
            key={item.id} 
            item={item} 
            onUpdateQuantity={handleUpdateQuantity}
            onSelect={handleSelect}
            selected={selectedIds.has(item.id)}
          />
        ))}
      </div>
      
      <button className="fab-button" aria-label="Thêm thực phẩm" title="Thêm thực phẩm">
        <Plus size={24} />
      </button>
    </div>
  );
};

export default FridgeFeature;
