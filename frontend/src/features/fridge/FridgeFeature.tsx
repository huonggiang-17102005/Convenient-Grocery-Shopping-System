import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import './fridge.css';
import type { FoodItem, StorageType, FoodCategory } from './types';
import RefrigeratorHeader from './components/RefrigeratorHeader';
import StorageFilter from './components/StorageFilter';
import CategoryFilter from './components/CategoryFilter';
import FoodCard from './components/FoodCard';
import IngredientFormModal from './modals/IngredientFormModal';
import QuantityConfirmModal from './modals/QuantityConfirmModal';
import ConsumeConfirmModal from './modals/ConsumeConfirmModal';
import RecipeActionBar from './components/RecipeActionBar';
import Toast from '@/components/common/Toast';
import AiRecipeModal from './modals/AiRecipeModal';

export interface FridgeFeatureProps {
  role?: 'homemaker' | 'member';
}

import { useFridgeContext } from '../../contexts/FridgeContext';
import { useAuth } from '../../contexts/AuthContext';
import { fridgeService } from './fridge.service';

export const FridgeFeature: React.FC<FridgeFeatureProps> = ({ role = 'homemaker' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStorage, setActiveStorage] = useState<StorageType>('Tất cả');
  const [activeCategory, setActiveCategory] = useState<FoodCategory>('Tất cả');
  
  const { items, isLoading: isLoadingData, refreshFridge } = useFridgeContext();
  const { user } = useAuth();
  const familyId = user?.family_id;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Quantity Confirm Modal states
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [qtyModalMode, setQtyModalMode] = useState<'add' | 'subtract'>('add');
  const [qtyModalItem, setQtyModalItem] = useState<FoodItem | null>(null);
  
  const [consumeModalItem, setConsumeModalItem] = useState<FoodItem | null>(null);
  const [isConsumeModalOpen, setIsConsumeModalOpen] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastTrigger(p => p + 1);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    setQtyModalItem(item);
    setQtyModalMode(delta > 0 ? 'add' : 'subtract');
    setIsQtyModalOpen(true);
  };

  const handleConfirmQty = async (delta: number) => {
    if (!qtyModalItem) return;
    try {
      const newQuantity = Math.max(0, qtyModalItem.quantity + delta);
      await fridgeService.updateFridgeItem(qtyModalItem.id, { quantity: newQuantity });
      
      if (newQuantity <= 0) {
        showToast('Đã lấy hết & xóa thẻ thực phẩm!');
      } else {
        showToast('Đã cập nhật số lượng!');
      }
      await refreshFridge();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi cập nhật số lượng!');
    }
  };

  const handleConsumeSpiceClick = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setConsumeModalItem(item);
      setIsConsumeModalOpen(true);
    }
  };

  const handleConfirmConsume = async () => {
    if (!consumeModalItem) return;
    try {
      await fridgeService.updateFridgeItem(consumeModalItem.id, { quantity: 0 });
      showToast('Đã dùng hết gia vị!');
      await refreshFridge();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi dùng hết gia vị!');
    }
  };

  const handleDifferentExpiry = () => {
    if (!qtyModalItem) return;
    setSelectedItem(qtyModalItem);
    setModalMode('add');
    setIsModalOpen(true);
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
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedItem(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleSaveModal = async (itemData: Omit<FoodItem, 'id'>) => {
    try {
      if (modalMode === 'add') {
        await fridgeService.addFridgeItem({
          family_id: familyId,
          name: itemData.name,
          quantity: itemData.quantity,
          unit: itemData.unit,
          category: itemData.category,
          expiration_date: itemData.expiryDate || new Date().toISOString(),
          location: itemData.storageType,
          image_url: itemData.image,
          image_public_id: itemData.imagePublicId
        });
        showToast('Đã thêm thực phẩm vào tủ lạnh!');
      } else if (modalMode === 'edit' && selectedItem) {
        await fridgeService.updateFridgeItem(selectedItem.id, {
          name: itemData.name,
          quantity: itemData.quantity,
          unit: itemData.unit,
          category: itemData.category,
          expiration_date: itemData.expiryDate || new Date().toISOString(),
          location: itemData.storageType,
          image_url: itemData.image,
          image_public_id: itemData.imagePublicId
        });
        showToast('Đã cập nhật thực phẩm!');
      }
      await refreshFridge();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra!');
    }
    setIsModalOpen(false);
  };

  const handleDeleteModal = async (id: string) => {
    try {
      await fridgeService.throwAwayFridgeItem(id);
      showToast('Đã xóa thực phẩm!');
      await refreshFridge();
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi xóa!');
    }
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

  const totalOtherLotsQuantity = qtyModalItem 
    ? items
        .filter(i => i.id !== qtyModalItem.id && i.name === qtyModalItem.name && i.category === qtyModalItem.category)
        .reduce((sum, i) => sum + i.quantity, 0)
    : 0;

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
              onConsumeSpice={handleConsumeSpiceClick}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888', gridColumn: '1 / -1', fontSize: '15px', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🛒 Không có thực phẩm nào trong tủ lạnh.
          </div>
        )}
      </div>
      
      <>
        <button 
          className="fab-button ai-fab" 
          aria-label="AI Gợi ý nấu ăn" 
          title="AI Gợi ý nấu ăn"
          onClick={() => setIsAiModalOpen(true)}
        >
          <Sparkles size={24} />
        </button>
        <button 
          className="fab-button" 
          aria-label="Thêm thực phẩm" 
          title="Thêm thực phẩm"
          onClick={handleOpenAdd}
        >
          <Plus size={24} />
        </button>
      </>

      <AiRecipeModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />

      <IngredientFormModal 
        isOpen={isModalOpen}
        mode={modalMode}
        item={selectedItem}
        role={role}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={handleDeleteModal}
      />

      <QuantityConfirmModal
        isOpen={isQtyModalOpen}
        mode={qtyModalMode}
        item={qtyModalItem}
        totalOtherLotsQuantity={totalOtherLotsQuantity}
        onClose={() => setIsQtyModalOpen(false)}
        onConfirm={handleConfirmQty}
        onDifferentExpiry={handleDifferentExpiry}
      />

      <ConsumeConfirmModal
        isOpen={isConsumeModalOpen}
        itemName={consumeModalItem?.name || ''}
        onClose={() => setIsConsumeModalOpen(false)}
        onConfirm={handleConfirmConsume}
      />
    </div>
  );
};

export default FridgeFeature;

