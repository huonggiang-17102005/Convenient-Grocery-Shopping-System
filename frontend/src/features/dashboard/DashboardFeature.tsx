import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import './dashboard.css';

// Color theme per role
const ROLE_COLORS: Record<'homemaker' | 'member', string> = {
  homemaker: '#FF8A00',
  member: '#1E88E5',
};

export interface DashboardFeatureProps {
  role: 'homemaker' | 'member';
}

// Components
import Toast from '@/components/common/Toast';
import ExpiringWarningList from './components/ExpiringWarningList';
import TodayMenu from './components/TodayMenu';
import type { IngredientCardProps } from './components/IngredientCard';
import ShoppingMission from './components/ShoppingMission';
import { useAuth } from '../../contexts/AuthContext';
import { useFridgeContext } from '../../contexts/FridgeContext';
import { useShoppingListContext } from '../../contexts/ShoppingListContext';
import { useMealPlannerContext } from '../../contexts/MealPlannerContext';
import { shoppingService } from '../shopping-list/shopping-list.service';
import { fridgeService } from '../fridge/fridge.service';

// Modals
import InviteCodeModal from './modals/InviteCodeModal';
import ExpireItemModal from './modals/ExpireItemModal';
import CookConfirmModal from './modals/CookConfirmModal';
import type { CookIngredient } from './modals/CookConfirmModal';
import type { ShoppingItem } from '../shopping-list/types';
import { getCategoryBgClass } from '../../utils/categoryHelper';

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const EMOJI_MAP: Record<string, string> = {
  'Thịt cá': '🥩',
  'Rau củ quả': '🥕',
  'Trứng': '🥚',
  'Chất lỏng': '🥛',
  'Đồ khô': '🌾',
  'Gia vị': '🧂',
  'Khác': '📦',
  'Tất cả': '🛒',
};

const mapFoodItemToExpiringCardProps = (item: any): IngredientCardProps => {
  return {
    emoji: item.emoji || EMOJI_MAP[item.category] || '📦',
    image: item.image,
    name: item.name,
    category: item.category || 'Khác',
    categoryClass: getCategoryBgClass(item.category),
    daysLeft: item.daysRemaining || 0,
    quantity: item.quantity,
    unit: item.unit,
  };
};

// Removed hardcoded TODAY_MEALS

// ─── Dashboard Page ─────────────────────────────────────────────────────────────

export const DashboardFeature: React.FC<DashboardFeatureProps> = ({ role }) => {
  const primaryColor = ROLE_COLORS[role];
  const navigate = useNavigate();

  // Modal open states
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isExpireOpen, setIsExpireOpen] = useState(false);
  const [isCookOpen,   setIsCookOpen]   = useState(false);

  const { user, family } = useAuth();
  const familyId = user?.family_id || null;
  const realInviteCode = family?.invite_code || 'Chưa có mã';

  const { items: fridgeItems, refreshFridge } = useFridgeContext();
  const { items: shoppingItems, setItems: setShoppingItems } = useShoppingListContext();
  const { getTodayPlan } = useMealPlannerContext();

  const { todayMeals, todayIngredients } = React.useMemo(() => getTodayPlan(), [getTodayPlan]);

  const expiringItems = React.useMemo(() => {
    return fridgeItems
      .filter(item => {
        // daysRemaining is already calculated in FridgeContext
        return item.daysRemaining !== undefined && item.daysRemaining <= 3;
      })
      .map(mapFoodItemToExpiringCardProps);
  }, [fridgeItems]);

  // Selected item for ExpireItemModal
  const [selectedItem, setSelectedItem] = useState<IngredientCardProps | null>(null);



  // Toast state
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  // Simulated member purchase notification
  const [purchaseNotification, setPurchaseNotification] = useState<{
    memberName: string;
    action: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastTrigger(prev => prev + 1);
  };

  const hideToast = useCallback(() => {}, []);

  // Handlers
  const handleIngredientClick = (item: IngredientCardProps) => {
    setSelectedItem(item);
    setIsExpireOpen(true);
  };

  const handleCopied = () => {
    setIsInviteOpen(false);
    showToast('Đã sao chép mã nhóm thành công!');
  };

  const handleCookConfirm = async (ingredients: CookIngredient[]) => {
    if (!familyId) return;
    if (ingredients.length === 0) {
      showToast('Không có nguyên liệu mới nào cần trừ kho!');
      return;
    }
    try {
      await fridgeService.deductInventory(familyId, ingredients);
      showToast('Đã trừ kho thành công!');

      // Lưu vết vào LocalStorage
      const todayStr = new Date().toISOString().split('T')[0];
      const storageKey = `deducted_ingredients_${familyId}_${todayStr}`;
      let stored: string[] = [];
      try { stored = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch(e) {}
      const newDeducted = [...stored, ...ingredients.map(i => i.name)];
      localStorage.setItem(storageKey, JSON.stringify(newDeducted));

      // Refresh tủ lạnh
      await refreshFridge();
    } catch (err: unknown) {
      console.error(err);
      showToast('Có lỗi xảy ra khi trừ kho!');
    }
  };

  // Context provides shoppingItems, we just need to handle the toggle

  const handleToggleShoppingItem = async (id: string) => {
    const item = shoppingItems.find(i => i.id === id);
    if (!item || item.isBought) return;

    const originalItems = shoppingItems;

    // Optimistic Update
    setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, isBought: true } : i));
    showToast('Đã mua xong và tự động lưu vào tủ lạnh!');

    try {
      await shoppingService.updateShoppingItem(id, { isBought: true });
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi cập nhật trạng thái đã mua!');
      setShoppingItems(originalItems); // Rollback
    }
  };

  // Tính toán nhiệm vụ mua sắm trong tuần cho Member
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const day = localDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(localDate);
  monday.setDate(localDate.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const startOfWeekStr = monday.toISOString().split('T')[0];
  const endOfWeekStr = sunday.toISOString().split('T')[0];

  const thisWeekMissions = shoppingItems.filter(item => {
    if (item.deadlineDate) {
      return item.deadlineDate >= startOfWeekStr && item.deadlineDate <= endOfWeekStr;
    }
    return false; // Không hiển thị item không có deadline
  });

  return (
    <>
      {/* Toast – hiện ở trên cùng */}
      <Toast
        message={toastMsg}
        trigger={toastTrigger}
        onHide={hideToast}
      />

      {/* Member Purchase Notification */}
      {purchaseNotification && (
        <div className="member-purchase-notification">
          <div className="member-purchase-notification__content">
            <div className="member-purchase-notification__title">✅ {purchaseNotification.memberName} đã hoàn thành</div>
            <div className="member-purchase-notification__action">{purchaseNotification.action}</div>
          </div>
          <button
            className="member-purchase-notification__close"
            onClick={() => setPurchaseNotification(null)}
            title="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Invite Banner - Homemaker only */}
      {role === 'homemaker' && (
        <div className="invite-banner" style={{ '--primary-color': primaryColor } as React.CSSProperties}>
          <p className="invite-banner__text">
            📢 Mời thêm thành viên gia đình để cùng quản lý tủ lạnh và shopping list!
          </p>
          <button
            id="btn-invite-code"
            className="invite-banner__btn"
            style={{ background: primaryColor }}
            onClick={() => setIsInviteOpen(true)}
          >
            Lấy mã mời
          </button>
        </div>
      )}

      {/* Shopping Mission - Member only */}
      {role === 'member' && (
        <ShoppingMission
          items={thisWeekMissions}
          currentUserId={user?.id || ''}
          onToggleCheck={handleToggleShoppingItem}
        />
      )}

      {/* Expiring Warning - Homemaker only */}
      {role === 'homemaker' && (
        <ExpiringWarningList
          items={expiringItems}
          onItemClick={handleIngredientClick}
        />
      )}

      {/* Today Menu */}
      <TodayMenu
        meals={todayMeals}
        role={role}
        onMarkCooked={() => setIsCookOpen(true)}
      />

      {/* ── Modals ── */}
      <InviteCodeModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteCode={realInviteCode}
        onCopied={handleCopied}
      />

      <ExpireItemModal
        isOpen={isExpireOpen}
        onClose={() => setIsExpireOpen(false)}
        item={selectedItem}
        onSuggestRecipe={(item) => {
          navigate(`/${role}/recipes`, { state: { suggestIngredient: item.name } });
          setIsExpireOpen(false);
        }}
      />

      {isCookOpen && (
        <CookConfirmModal
          isOpen={isCookOpen}
          onClose={() => setIsCookOpen(false)}
          onConfirm={handleCookConfirm}
          initialIngredients={todayIngredients}
          fridgeItems={fridgeItems}
        />
      )}


    </>
  );
};

export default DashboardFeature;
