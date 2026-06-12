import React, { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import TimeFilterTabs from './components/TimeFilterTabs';
import CategoryGroup from './components/CategoryGroup';
import ShoppingCard from './components/ShoppingCard';
import ActionBottomSheet from './modals/ActionBottomSheet';
import type { FamilyMember } from './modals/ActionBottomSheet';
import ItemFormModal from './modals/ItemFormModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import ExpiryDateModal from './modals/ExpiryDateModal';
import type { ShoppingItem, ShoppingList, FoodCategory, CreateItemPayload } from './types';
import * as shoppingService from './shopping-list.service';
import type { FamilyMemberDTO } from './shopping-list.service';
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

  // State
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Expiry modal state
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);
  const [pendingFridgeItem, setPendingFridgeItem] = useState<ShoppingItem | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  // Family & members
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  // Map: userId -> name
  const [memberMap, setMemberMap] = useState<Record<string, string>>({});

  // Get family ID from local storage
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.family_id) {
          setFamilyId(user.family_id);
        }
      }
    } catch {
      console.error('Không thể đọc user từ localStorage');
    }
  }, []);

  // Load data when familyId is set
  useEffect(() => {
    if (!familyId) {
      setIsLoading(false);
      return;
    }

    const loadAll = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load song song: lists + members
        const [rawLists, rawMembers] = await Promise.all([
          shoppingService.getListsByFamilyId(familyId),
          shoppingService.getFamilyMembers().catch(() => [] as FamilyMemberDTO[]),
        ]);

        // Map members -> FamilyMember shape cho ActionBottomSheet
        const mappedMembers: FamilyMember[] = rawMembers.map((m) => ({
          id: m.id,
          full_name: m.full_name ?? m.email,
          avatar_initial: (m.full_name ?? m.email).charAt(0).toUpperCase(),
          avatar_color: '#FFE0B2',
          text_color: '#FF8A00',
        }));

        // Map userId -> name để dùng trong ShoppingCard
        const map: Record<string, string> = {};
        rawMembers.forEach((m) => {
          map[m.id] = m.full_name ?? m.email;
        });

        setMembers(mappedMembers);
        setMemberMap(map);

        // Auto-tạo list mặc định nếu chưa có
        let data = rawLists;
        if (data.length === 0) {
          const today = new Date().toISOString().split('T')[0];
          const defaultList = await shoppingService.createList({
            family_id: familyId,
            title: 'Danh sách mua sắm',
            target_date: today,
            status: 'Planning',
          });
          data = [{ ...defaultList, items: [] }];
        }

        setLists(data);
        if (data.length > 0 && !activeListId) {
          setActiveListId(data[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError('Không thể tải danh sách mua sắm. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [familyId]);

  // Toast helpers
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastTrigger(prev => prev + 1);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const hideToast = useCallback(() => {}, []);

  const activeList = lists.find(l => l.id === activeListId) ?? null;

  const updateLocalItems = (listId: string, newItems: ShoppingItem[]) => {
    setLists(prev => prev.map(l => l.id === listId ? { ...l, items: newItems } : l));
  };

  // Toggle item status
  const handleToggleCheck = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeList) return;

    try {
      const updated = await shoppingService.toggleItemBought(activeList.id, itemId);
      const newItems = activeList.items.map(i => i.id === itemId ? updated : i);
      updateLocalItems(activeList.id, newItems);

      if (updated.is_bought) {
        // Mở modal nhập hạn sử dụng trước khi thêm vào tủ lạnh
        setPendingFridgeItem(updated);
        setIsExpiryModalOpen(true);
        showToast('Đã đánh dấu đã mua!');
      } else {
        showToast('Đã bỏ đánh dấu đã mua.');
      }
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  // Add item to fridge with expiry date
  const handleExpiryConfirm = async (expirationDate: string) => {
    setIsExpiryModalOpen(false);
    if (!pendingFridgeItem || !activeList || !familyId) return;

    try {
      await shoppingService.addItemToFridge(
        activeList.id,
        pendingFridgeItem.id,
        familyId,
        expirationDate,
      );
      showToast('Đã thêm vào tủ lạnh với hạn sử dụng!');
    } catch {
      showToast('Không thể thêm vào tủ lạnh. Kiểm tra lại sau.');
    } finally {
      setPendingFridgeItem(null);
    }
  };

  const handleExpiryCancel = () => {
    setIsExpiryModalOpen(false);
    setPendingFridgeItem(null);
    showToast('Đã đánh dấu đã mua. Không thêm vào tủ lạnh.');
  };

  // Create or edit item
  const handleFormSubmit = async (payload: CreateItemPayload) => {
    if (!activeList) return;

    try {
      if (formMode === 'create') {
        const newItem = await shoppingService.createItem(activeList.id, payload);
        updateLocalItems(activeList.id, [...activeList.items, newItem]);
        showToast('Đã thêm vào danh sách mua sắm');
      } else if (formMode === 'edit' && selectedItem) {
        const updatedItem = await shoppingService.updateItem(activeList.id, selectedItem.id, payload);
        const newItems = activeList.items.map(i => i.id === selectedItem.id ? updatedItem : i);
        updateLocalItems(activeList.id, newItems);
        showToast('Đã cập nhật mặt hàng thành công!');
      }
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  // Assign task to family member
  const handleAssignMember = async (itemId: string, assigneeId: string | null) => {
    if (!activeList) return;

    try {
      const updatedItem = await shoppingService.updateItem(activeList.id, itemId, { assignee_id: assigneeId });
      const newItems = activeList.items.map(i => i.id === itemId ? updatedItem : i);
      updateLocalItems(activeList.id, newItems);

      showToast(assigneeId ? 'Đã giao việc thành công!' : 'Đã hủy giao việc thành công!');
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại.');
    }

    setIsBottomSheetOpen(false);
    setSelectedItem(null);
  };

  // Delete item
  const handleDeleteConfirm = async () => {
    if (!selectedItem || !activeList) return;

    try {
      await shoppingService.deleteItem(activeList.id, selectedItem.id);
      const newItems = activeList.items.filter(i => i.id !== selectedItem.id);
      updateLocalItems(activeList.id, newItems);
      showToast('Đã xóa mặt hàng thành công!');
    } catch {
      showToast('Có lỗi xảy ra, vui lòng thử lại.');
    }

    setSelectedItem(null);
  };

  // Open action bottom sheet
  const handleCardClick = (item: ShoppingItem) => {
    setSelectedItem(item);
    setIsBottomSheetOpen(true);
  };

  // Open create form modal
  const handleOpenCreateForm = () => {
    setFormMode('create');
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  // Open edit form modal
  const handleOpenEditForm = (item: ShoppingItem) => {
    setFormMode('edit');
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  // Open delete confirm modal
  const handleOpenDeleteConfirm = (item: ShoppingItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // Filter items by deadline
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const todayStr = localDate.toISOString().split('T')[0];

  const allItems = activeList?.items ?? [];

  const filteredItems = allItems.filter(item => {
    if (activeTab === 'today') {
      if (!item.deadline_date) return true; // Không có deadline → hiện hết
      const isToday = item.deadline_date === todayStr;
      const isOverdue = !item.is_bought && item.deadline_date < todayStr;
      return isToday || isOverdue;
    }
    return true; // "Trong tuần" → hiện tất cả
  });

  // Group by category
  const categoriesList: FoodCategory[] = ['Thịt cá', 'Rau củ', 'Đồ khô', 'Gia vị', 'Đồ uống', 'Khác'];
  const groupedItems = categoriesList.reduce((acc, cat) => {
    const catItems = filteredItems.filter(item => item.category === cat);
    if (catItems.length > 0) {
      acc[cat] = catItems;
    }
    return acc;
  }, {} as Record<FoodCategory, ShoppingItem[]>);

  if (!familyId) {
    return (
      <div className="shopping-page">
        <div style={{ textAlign: 'center', padding: '64px 16px', color: '#757575' }}>
          <p>Bạn chưa thuộc nhóm gia đình nào.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Tạo hoặc tham gia một nhóm để bắt đầu.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="shopping-page">
        <div style={{ textAlign: 'center', padding: '64px 16px', color: '#757575' }}>
          Đang tải danh sách mua sắm...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shopping-page">
        <div style={{ textAlign: 'center', padding: '64px 16px', color: '#e53935' }}>
          {error}
        </div>
      </div>
    );
  }

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

        {lists.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
            {lists.map(list => (
              <button
                key={list.id}
                type="button"
                onClick={() => setActiveListId(list.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: `1.5px solid ${activeListId === list.id ? primaryColor : '#e0e0e0'}`,
                  background: activeListId === list.id ? primaryColor : 'transparent',
                  color: activeListId === list.id ? '#fff' : '#757575',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: activeListId === list.id ? 600 : 400,
                }}
              >
                {list.title}
              </button>
            ))}
          </div>
        )}

        {lists.length === 0 && (
          <p style={{ fontSize: '13px', color: '#9e9e9e', margin: '4px 0 0' }}>
            Chưa có danh sách nào — nhấn + để tạo mới
          </p>
        )}

        <TimeFilterTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Shopping List Container */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!activeList ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: '#757575' }}>
            Chưa có danh sách mua sắm nào. Nhấn + để tạo mới.
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
                {catItems.map(item => (
                  <ShoppingCard
                    key={item.id}
                    item={item}
                    memberMap={memberMap}
                    onToggleCheck={handleToggleCheck}
                    onClickCard={handleCardClick}
                  />
                ))}
              </CategoryGroup>
            );
          })
        )}
      </div>

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

      <ActionBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        item={selectedItem}
        members={members}
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

      <ExpiryDateModal
        isOpen={isExpiryModalOpen}
        itemName={pendingFridgeItem?.name ?? ''}
        onConfirm={handleExpiryConfirm}
        onCancel={handleExpiryCancel}
      />
    </div>
  );
};

export default ShoppingListFeature;

