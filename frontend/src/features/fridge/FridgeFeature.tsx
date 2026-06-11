import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import './fridge.css';
import type { FoodItem, StorageType, FoodCategory } from './types';
import RefrigeratorHeader from './components/RefrigeratorHeader';
import StorageFilter from './components/StorageFilter';
import CategoryFilter from './components/CategoryFilter';
import FoodCard from './components/FoodCard';
import IngredientFormModal from './modals/IngredientFormModal';
import RecipeActionBar from './components/RecipeActionBar';
import Toast from '@/components/shared/Toast';

export interface FridgeFeatureProps {
  role?: 'homemaker' | 'member';
}

const MOCK_DATA: FoodItem[] = [
  { id: '1', emoji: '🥕', name: 'Cà rốt', quantity: 3, unit: 'Kg', daysRemaining: 7, category: 'Rau củ quả', storageType: 'Ngăn mát' },
  { id: '2', emoji: '🥩', name: 'Thịt bò', quantity: 1, unit: 'Kg', daysRemaining: 1, category: 'Thịt cá', storageType: 'Ngăn đông' },
  { id: '3', emoji: '🥚', name: 'Trứng gà', quantity: 10, unit: 'Quả', daysRemaining: 14, category: 'Trứng', storageType: 'Ngăn mát' },
  { id: '4', emoji: '🥛', name: 'Sữa tươi', quantity: 2, unit: 'Lít', daysRemaining: 3, category: 'Chất lỏng', storageType: 'Ngăn mát' },
  { id: '5', emoji: '🌾', name: 'Gạo tẻ', quantity: 5, unit: 'Kg', daysRemaining: 60, category: 'Đồ khô', storageType: 'Khô' },
  { id: '6', emoji: '🧂', name: 'Muối hột', quantity: 0, daysRemaining: 365, category: 'Gia vị', storageType: 'Khô' },
  { id: '7', emoji: '📦', name: 'Mứt Tết', quantity: 1, unit: 'Kg', daysRemaining: 30, category: 'Khác', storageType: 'Ngăn mát' },
];

export const FridgeFeature: React.FC<FridgeFeatureProps> = ({ role = 'homemaker' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStorage, setActiveStorage] = useState<StorageType>('Tất cả');
  const [activeCategory, setActiveCategory] = useState<FoodCategory>('Tất cả');
  const [items, setItems] = useState<FoodItem[]>(() => {
    // We clear localStorage mock to force load the new mock data with all categories for testing
    const data = localStorage.getItem('homemaker_fridge_items_v2');
    if (!data) {
      localStorage.setItem('homemaker_fridge_items_v2', JSON.stringify(MOCK_DATA));
      return MOCK_DATA;
    }
    return JSON.parse(data);
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastTrigger(p => p + 1);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('homemaker_fridge_items_v2', JSON.stringify(updatedItems));
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

  const handleCardClick = (item: FoodItem) => {
    setSelectedItem(item);
    setModalMode(role === 'member' ? 'detail' : 'edit');
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleSaveModal = (itemData: Omit<FoodItem, 'id'>) => {
    if (modalMode === 'add') {
      const newItem: FoodItem = {
        ...itemData,
        id: 'fridge_' + Date.now() + Math.random().toString(36).substr(2, 4)
      };
      const updated = [...items, newItem];
      setItems(updated);
      localStorage.setItem('homemaker_fridge_items_v2', JSON.stringify(updated));
      showToast('Đã thêm thực phẩm vào tủ lạnh!');
    } else if (modalMode === 'edit' && selectedItem) {
      const updated = items.map(i => i.id === selectedItem.id ? { ...itemData, id: selectedItem.id } : i);
      setItems(updated);
      localStorage.setItem('homemaker_fridge_items_v2', JSON.stringify(updated));
      showToast('Đã cập nhật thực phẩm!');
    }
    setIsModalOpen(false);
  };

  const handleDeleteModal = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('homemaker_fridge_items_v2', JSON.stringify(updated));
    showToast('Đã xóa thực phẩm!');
    setIsModalOpen(false);
    
    // Remove from selection if deleted
    if (selectedIds.has(id)) {
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const filteredItems = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStorage = activeStorage === 'Tất cả' || item.storageType === activeStorage;
    const matchCategory = activeCategory === 'Tất cả' || item.category === activeCategory;
    return matchSearch && matchStorage && matchCategory;
  });

  const selectedNames = items.filter(i => selectedIds.has(i.id)).map(i => i.name);

  return (
    <div className="refrigerator-page">
      <Toast message={toastMsg} trigger={toastTrigger} onHide={() => {}} />
      
      <div className="fridge-sticky-header">
        <RefrigeratorHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div className="fridge-filters-row">
          <StorageFilter activeStorage={activeStorage} onStorageChange={setActiveStorage} />
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </div>
      </div>
      
      <RecipeActionBar 
        selectedCount={selectedIds.size} 
        role={role} 
        selectedItems={selectedNames} 
      />

      <div className="food-list-container">
        {filteredItems.map(item => (
          <FoodCard 
            key={item.id} 
            item={item} 
            onUpdateQuantity={handleUpdateQuantity}
            onSelect={handleSelect}
            selected={selectedIds.has(item.id)}
            role={role}
            onCardClick={handleCardClick}
          />
        ))}
      </div>
      
      {role === 'homemaker' && (
        <button 
          className="fab-button" 
          aria-label="Thêm thực phẩm" 
          title="Thêm thực phẩm"
          onClick={handleOpenAdd}
        >
          <Plus size={24} />
        </button>
      )}

      <IngredientFormModal 
        isOpen={isModalOpen}
        mode={modalMode}
        item={selectedItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={handleDeleteModal}
      />
    </div>
  );
};

export default FridgeFeature;

