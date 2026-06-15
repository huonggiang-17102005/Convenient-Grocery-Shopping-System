import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface FridgeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
}

interface MealPlanPayload {
  meal_type?: string;
  people_count?: number;
  recipes?: {
    name?: string;
    servings?: number;
    ingredients?: {
      name: string;
      quantity: string;
      unit: string;
      category?: string;
    }[];
  };
}
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
import Toast from '@/components/shared/Toast';
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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const EXPIRING_ITEMS: IngredientCardProps[] = [
  {
    emoji: '🥛',
    name: 'Sữa tươi',
    category: 'Đồ uống',
    categoryColor: '#BBDEFB',
    categoryTextColor: '#1565C0',
    daysLeft: 1,
  },
  {
    emoji: '🥩',
    name: 'Thịt bò',
    category: 'Thịt cá',
    categoryColor: '#FFCDD2',
    categoryTextColor: '#C62828',
    daysLeft: 2,
  },
  {
    emoji: '🍓',
    name: 'Dâu tây',
    category: 'Trái cây',
    categoryColor: '#F8BBD0',
    categoryTextColor: '#C2185B',
    daysLeft: 3,
  },
];

// Removed hardcoded TODAY_MEALS

// ─── Dashboard Page ─────────────────────────────────────────────────────────────

export const DashboardFeature: React.FC<DashboardFeatureProps> = ({ role }) => {
  const primaryColor = ROLE_COLORS[role];

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
    try {
      await fridgeService.deductInventory(familyId, ingredients);
      showToast('Đã trừ kho thành công!');
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
    if (!item) return;

    const nextBought = !item.isBought;

    try {
      await shoppingService.updateShoppingItem(id, { isBought: nextBought });
      
      setShoppingItems(prev => prev.map(i => i.id === id ? { ...i, isBought: nextBought } : i));

      if (nextBought) {
        showToast('Đã mua thành công!');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi cập nhật mua sắm!');
    }
  };

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
          items={shoppingItems}
          onToggleCheck={handleToggleShoppingItem}
        />
      )}

      {/* Expiring Warning - Homemaker only */}
      {role === 'homemaker' && (
        <ExpiringWarningList
          items={EXPIRING_ITEMS}
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
          console.log('Gợi ý công thức cho:', item.name);
          // TODO: Navigate to recipe page with item filter
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
