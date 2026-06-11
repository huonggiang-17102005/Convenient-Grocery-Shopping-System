import React, { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import TimeFilterTabs from './components/TimeFilterTabs';
import CategoryGroup from './components/CategoryGroup';
import ShoppingCard from './components/ShoppingCard';
import ActionBottomSheet from './modals/ActionBottomSheet';
import ItemFormModal from './modals/ItemFormModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import type { ShoppingItem, FoodCategory } from './types';
import { shoppingService } from './shopping-list.service';
import Toast from '@/components/shared/Toast';
import './shopping-list.css';

// Color theme per role
const ROLE_COLORS: Record<'homemaker' | 'member', string> = {
  homemaker: '#FF8A00',
  member: '#1E88E5',
};

export interface ShoppingListFeatureProps {
  role: 'homemaker' | 'member';
}

export const ShoppingListFeature: React.FC<ShoppingListFeatureProps> = ({ role }) => {
  const primaryColor = ROLE_COLORS[role];
  const [items, setItems] = useState<ShoppingItem[]>(() => shoppingService.getShoppingItems());
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');

  // Modal states
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Show toast utility
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  // Helper to save items
  const updateItemsList = (newItems: ShoppingItem[]) => {
    setItems(newItems);
    shoppingService.saveShoppingItems(newItems);
  };

  // Toggle item status
  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening bottom sheet

    const updated = items.map(item => {
      if (item.id === id) {
        const nextBought = !item.isBought;
        if (nextBought) {
          // If bought, sync to fridge and show toast
          shoppingService.syncItemToFridge(item);
          showToast(`Đã mua xong! Số lượng đã tự động cộng vào kho Tủ lạnh`);
        }
        return { ...item, isBought: nextBought };
      }
      return item;
    });

    updateItemsList(updated);
  };

  // Add or edit item submit
  const handleFormSubmit = (itemData: Omit<ShoppingItem, 'id' | 'isBought' | 'assigneeId'>) => {
    if (formMode === 'create') {
      const newItem: ShoppingItem = {
        ...itemData,
        id: 'shop_' + Date.now() + Math.random().toString(36).substr(2, 4),
        isBought: false,
        assigneeId: null,
      };
      const updated = [...items, newItem];
      updateItemsList(updated);
      showToast('Đã thêm vào danh sách mua sắm');
    } else if (formMode === 'edit' && selectedItem) {
      const updated = items.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            ...itemData,
          };
        }
        return item;
      });
      updateItemsList(updated);
      showToast('Đã cập nhật mặt hàng thành công!');
    }
  };

  // Assign member
  const handleAssignMember = (itemId: string, assigneeId: 'Kat' | 'Shin' | null) => {
    const updated = items.map(item => {
      if (item.id === itemId) {
        return { ...item, assigneeId };
      }
      return item;
    });
    updateItemsList(updated);

    if (assigneeId) {
      showToast(`Đã giao cho ${assigneeId}`);
    } else {
      showToast('Đã hủy giao việc thành công!');
    }

    // Close bottom sheet and clear selection
    setIsBottomSheetOpen(false);
    setSelectedItem(null);
  };

  // Delete item confirm
  const handleDeleteConfirm = () => {
    if (selectedItem) {
      const updated = items.filter(item => item.id !== selectedItem.id);
      updateItemsList(updated);
      showToast('Đã xóa mặt hàng thành công!');
      setSelectedItem(null);
    }
  };

  // Card click -> open bottom sheet
  const handleCardClick = (item: ShoppingItem) => {
    setSelectedItem(item);
    setIsBottomSheetOpen(true);
  };

  // Open create form
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  // Open edit form
  const handleOpenEditForm = (item: ShoppingItem) => {
    setFormMode('edit');
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  // Open delete confirm
  const handleOpenDeleteConfirm = (item: ShoppingItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Filter items
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const todayStr = localDate.toISOString().split('T')[0];

  const filteredItems = items.filter(item => {
    if (activeTab === 'today') {
      // Show if due today OR overdue
      const isToday = item.deadlineDate === todayStr;
      const isOverdue = !item.isBought && item.deadlineDate < todayStr;
      
      // If due today, verify if it was overdue due to hour as well
      if (!isToday && !isOverdue) return false;
      return true;
    }
    // "Trong tuần" - show all items
    return true;
  });

  // Group items by category
  const categoriesList: FoodCategory[] = ['Thịt cá', 'Rau củ', 'Đồ khô', 'Gia vị', 'Đồ uống', 'Khác'];
  const groupedItems = categoriesList.reduce((acc, cat) => {
    const catItems = filteredItems.filter(item => item.category === cat);
    if (catItems.length > 0) {
      acc[cat] = catItems;
    }
    return acc;
  }, {} as Record<FoodCategory, ShoppingItem[]>);

  return (
    <div className="shopping-page">
      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onHide={hideToast}
      />

      {/* Header */}
      <div className="shopping-header">
        <div className="shopping-title-row">
          <h1 className="shopping-title">Danh sách mua sắm</h1>
        </div>
        <TimeFilterTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Shopping List Container */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {Object.keys(groupedItems).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#757575' }}>
            Không có mặt hàng nào cần mua.
          </div>
        ) : (
          categoriesList.map(cat => {
            const catItems = groupedItems[cat];
            if (!catItems) return null;
            return (
              <CategoryGroup key={cat} title={cat}>
                {catItems.map(item => (
                  <ShoppingCard
                    key={item.id}
                    item={item}
                    onToggleCheck={handleToggleCheck}
                    onClickCard={handleCardClick}
                  />
                ))}
              </CategoryGroup>
            );
          })
        )}
      </div>

      {/* FAB to add new item */}
      <button
        type="button"
        className="fab-button"
        style={{ background: primaryColor }}
        onClick={handleOpenCreateForm}
        title="Thêm mặt hàng mới"
        aria-label="Thêm mặt hàng mới"
      >
        <Plus size={24} />
      </button>

      {/* Modals */}
      <ActionBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        item={selectedItem}
        onAssign={handleAssignMember}
        onEdit={handleOpenEditForm}
        onDelete={handleOpenDeleteConfirm}
      />

      <ItemFormModal
        key={isFormModalOpen ? (selectedItem ? selectedItem.id : 'new') : 'closed'}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        item={selectedItem}
        mode={formMode}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ShoppingListFeature;
