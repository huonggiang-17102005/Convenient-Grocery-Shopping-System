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
import Toast from '@/components/common/Toast';
import IngredientFormModal from '../fridge/modals/IngredientFormModal';
import { fridgeService } from '../fridge/fridge.service';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  const { items, setItems, isLoading: loading } = useShoppingListContext();
  const { familyMembers } = useFamilyContext();
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');

  // Modal states
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Fridge Modal state for checked items
  const [itemToSaveFridge, setItemToSaveFridge] = useState<ShoppingItem | null>(null);
  const [isFridgeModalOpen, setIsFridgeModalOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  // Show toast utility
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastTrigger(prev => prev + 1);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const hideToast = useCallback(() => {}, []);

  // Toggle item status
  const handleToggleCheck = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening bottom sheet

    const item = items.find(i => i.id === id);
    if (!item || item.isBought) return;

    // Thay vì gọi API ngay, mở modal để lưu tủ lạnh trước
    setItemToSaveFridge(item);
    setIsFridgeModalOpen(true);
  };

  const handleSaveToFridge = async (itemData: any) => {
    if (!itemToSaveFridge || !user?.family_id) return;
    try {
      // 1. Lưu vào tủ lạnh
      await fridgeService.addFridgeItem({
        family_id: user.family_id,
        name: itemData.name,
        quantity: itemData.quantity,
        unit: itemData.unit,
        category: itemData.category,
        expiration_date: itemData.expiryDate || new Date().toISOString(),
        location: itemData.storageType,
        image_url: itemData.image,
        image_public_id: itemData.imagePublicId
      });
      
      // 2. Đánh dấu đã mua ở Shopping List
      const updatedItem = await shoppingService.updateShoppingItem(itemToSaveFridge.id, { isBought: true });
      
      setItems(prev => prev.map(i => i.id === itemToSaveFridge.id ? updatedItem : i));
      
      showToast('Đã mua xong và lưu vào tủ lạnh!');
      setIsFridgeModalOpen(false);
      setItemToSaveFridge(null);
    } catch (error) {
      console.error('Error saving to fridge:', error);
      showToast('Lỗi khi lưu vào tủ lạnh');
    }
  };

  // Add or edit item submit
  const handleFormSubmit = async (itemData: Omit<ShoppingItem, 'id' | 'isBought' | 'assigneeId'>) => {
    try {
      if (formMode === 'create') {
        const newItem = await shoppingService.createShoppingItem(itemData);
        setItems(prev => [...prev, newItem]);
        showToast('Đã thêm vào danh sách mua sắm');
      } else if (formMode === 'edit' && selectedItem) {
        const updatedItem = await shoppingService.updateShoppingItem(selectedItem.id, itemData);
        setItems(prev => prev.map(i => i.id === selectedItem.id ? updatedItem : i));
        showToast('Đã cập nhật mặt hàng thành công!');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      console.error('Error saving item:', error);
      showToast('Lỗi khi lưu mặt hàng');
    }
  };

  // Assign member
  const handleAssignMember = async (itemId: string, assigneeId: string | null) => {
    try {
      const updatedItem = await shoppingService.updateShoppingItem(itemId, { assigneeId });
      setItems(prev => prev.map(i => i.id === itemId ? updatedItem : i));
      if (assigneeId) {
        const assignedMember = familyMembers.find(m => m.id === assigneeId);
        showToast(`Đã giao cho ${assignedMember?.name || assigneeId}`);
      } else {
        showToast('Đã hủy giao việc thành công!');
      }
    } catch (error) {
      console.error('Error assigning member:', error);
      showToast('Lỗi khi phân công');
    }

    // Close bottom sheet and clear selection
    setIsBottomSheetOpen(false);
    setSelectedItem(null);
  };

  // Delete item confirm
  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      try {
        await shoppingService.deleteShoppingItem(selectedItem.id);
        setItems(prev => prev.filter(item => item.id !== selectedItem.id));
        showToast('Đã xóa mặt hàng thành công!');
      } catch (error) {
        console.error('Error deleting item:', error);
        showToast('Lỗi khi xóa mặt hàng');
      }
      setSelectedItem(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Card click -> open bottom sheet or view modal
  const handleCardClick = (item: ShoppingItem) => {
    setSelectedItem(item);
    if (role === 'member') {
      // Member only views the item details directly
      setFormMode('view' as any);
      setIsFormModalOpen(true);
    } else {
      setIsBottomSheetOpen(true);
    }
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
      return item.deadlineDate === todayStr;
    }
    // "Trong tuần" - show all items
    return true;
  });

  // Group items by category
  const categoriesList: FoodCategory[] = ['Thịt cá', 'Rau củ quả', 'Trứng', 'Chất lỏng', 'Đồ khô', 'Gia vị', 'Khác'];
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
        trigger={toastTrigger}
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#757575' }}>
            Đang tải danh sách...
          </div>
        ) : Object.keys(groupedItems).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#757575' }}>
            Không có mặt hàng nào cần mua.
          </div>
        ) : (
          categoriesList.map(cat => {
            const catItems = groupedItems[cat];
            if (!catItems) return null;
            return (
              <CategoryGroup key={cat} title={cat}>
                {catItems.map(item => {
                  const disabledCheck = role === 'member' && item.assigneeId !== user?.id;
                  return (
                    <ShoppingCard
                      key={item.id}
                      item={item}
                      onToggleCheck={handleToggleCheck}
                      onClickCard={handleCardClick}
                      disabledCheck={disabledCheck}
                    />
                  );
                })}
              </CategoryGroup>
            );
          })
        )}
      </div>

      {/* FAB to add new item - Only Homemaker can add */}
      {role === 'homemaker' && (
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
      )}

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
        mode={formMode as any}
        readOnly={role === 'member'}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <IngredientFormModal
        isOpen={isFridgeModalOpen}
        mode="add"
        item={itemToSaveFridge as any}
        role={role}
        onClose={() => {
          setIsFridgeModalOpen(false);
          setItemToSaveFridge(null);
        }}
        onSave={handleSaveToFridge}
      />
    </div>
  );
};

export default ShoppingListFeature;
