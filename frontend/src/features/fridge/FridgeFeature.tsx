import React, { useState, useEffect } from 'react';
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

const mapCategoryToEmoji = (category: string) => {
  const map: Record<string, string> = {
    'Thịt cá': '🥩',
    'Rau củ quả': '🥕',
    'Trứng': '🥚',
    'Chất lỏng': '🥛',
    'Đồ khô': '🌾',
    'Gia vị': '🧂',
  };
  return map[category] || '🍽️';
};

const mapBackendToFrontend = (item: any): FoodItem => {
  const expDate = new Date(item.expiration_date || new Date());
  const diffDays = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit || '',
    category: (item.category || 'Khác') as FoodCategory,
    storageType: (item.location || 'Ngăn mát') as StorageType,
    daysRemaining: diffDays > 0 ? diffDays : 0,
    emoji: mapCategoryToEmoji(item.category || ''),
    expiryDate: item.expiration_date,
    image: item.image_url || undefined,
  };
};

export const FridgeFeature: React.FC<FridgeFeatureProps> = ({ role = 'homemaker' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStorage, setActiveStorage] = useState<StorageType>('Tất cả');
  const [activeCategory, setActiveCategory] = useState<FoodCategory>('Tất cả');
  
  const [items, setItems] = useState<FoodItem[]>(() => {
    // Lấy dữ liệu từ Cache để hiển thị ngay lập tức
    const cached = localStorage.getItem('cached_fridge_items');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const familyId = user.family_id;
        
        if (!familyId) return;

        // Nếu cache trống thì hiện chữ Loading
        if (items.length === 0) setIsLoadingData(true);

        const res = await fetch(`http://localhost:5000/api/fridge/family/${familyId}`);
        const result = await res.json();

        if (result.success) {
          const formattedItems = result.data.map(mapBackendToFrontend);
          setItems(formattedItems);
          // Lưu lại vào cache cho lần tải sau
          localStorage.setItem('cached_fridge_items', JSON.stringify(formattedItems));
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu tủ lạnh:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchItems();
  }, []);
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
    localStorage.setItem('cached_fridge_items', JSON.stringify(updatedItems));
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
      localStorage.setItem('cached_fridge_items', JSON.stringify(updated));
      showToast('Đã thêm thực phẩm vào tủ lạnh!');
    } else if (modalMode === 'edit' && selectedItem) {
      const updated = items.map(i => i.id === selectedItem.id ? { ...itemData, id: selectedItem.id } : i);
      setItems(updated);
      localStorage.setItem('cached_fridge_items', JSON.stringify(updated));
      showToast('Đã cập nhật thực phẩm!');
    }
    setIsModalOpen(false);
  };

  const handleDeleteModal = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    localStorage.setItem('cached_fridge_items', JSON.stringify(updated));
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
        {isLoadingData ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888', gridColumn: '1 / -1', fontSize: '15px', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⏳ Đang tải dữ liệu tủ lạnh...
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <FoodCard 
              key={item.id} 
              item={item} 
              onUpdateQuantity={handleUpdateQuantity}
              onSelect={handleSelect}
              selected={selectedIds.has(item.id)}
              role={role}
              onCardClick={handleCardClick}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888', gridColumn: '1 / -1', fontSize: '15px', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🛒 Không có thực phẩm nào trong tủ lạnh.
          </div>
        )}
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

