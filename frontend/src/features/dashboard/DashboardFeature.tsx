import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
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
import ExpiringWarningList from './components/ExpiringWarningList';
import TodayMenu from './components/TodayMenu';
import type { MealItem } from './components/TodayMenu';
import Toast from '@/components/shared/Toast';
import type { IngredientCardProps } from './components/IngredientCard';
import ShoppingMission from './components/ShoppingMission';
import { shoppingService } from '../shopping-list/shopping-list.service';

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

const TODAY_MEALS: MealItem[] = [
  { session: 'morning', dish: 'Bánh mỳ' },
  { session: 'noon',    dish: 'Thịt bò xào' },
  { session: 'evening', dish: 'Canh cà chua' },
];

// ─── Dashboard Page ─────────────────────────────────────────────────────────────

export const DashboardFeature: React.FC<DashboardFeatureProps> = ({ role }) => {
  const primaryColor = ROLE_COLORS[role];

  // Modal open states
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isExpireOpen, setIsExpireOpen] = useState(false);
  const [isCookOpen,   setIsCookOpen]   = useState(false);

  // Real Invite Code state
  const [realInviteCode, setRealInviteCode] = useState('Đang tải...');

  React.useEffect(() => {
    const fetchFamilyInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch('http://localhost:5000/api/families/info', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok && data.family) {
          setRealInviteCode(data.family.invite_code);
        } else {
          setRealInviteCode('Chưa có mã');
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhóm:', error);
        setRealInviteCode('Lỗi lấy mã');
      }
    };
    
    fetchFamilyInfo();
  }, []);

  // Selected item for ExpireItemModal
  const [selectedItem, setSelectedItem] = useState<IngredientCardProps | null>(null);

  // Toast state
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Simulated member purchase notification
  const [purchaseNotification, setPurchaseNotification] = useState<{
    memberName: string;
    action: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  };

  const hideToast = useCallback(() => setToastVisible(false), []);

  // Handlers
  const handleIngredientClick = (item: IngredientCardProps) => {
    setSelectedItem(item);
    setIsExpireOpen(true);
  };

  const handleCopied = () => {
    setIsInviteOpen(false);
    showToast('Đã sao chép mã nhóm thành công!');
  };

  const handleCookConfirm = (ingredients: CookIngredient[]) => {
    console.log('Trừ kho:', ingredients);
    // TODO: Gọi API trừ kho ở đây
    showToast('Đã trừ kho thành công !');
  };

  // Shopping items state for member
  const [shoppingItems, setShoppingItems] = useState(() => shoppingService.getShoppingItems());

  const handleToggleShoppingItem = (id: string) => {
    const updated = shoppingItems.map(item => {
      if (item.id === id) {
        const nextBought = !item.isBought;
        if (nextBought) {
          shoppingService.syncItemToFridge(item);
          showToast('Đã mua thành công! Nguyên liệu đã được tự động cộng vào Tủ lạnh chung.');
        }
        return { ...item, isBought: nextBought };
      }
      return item;
    });
    setShoppingItems(updated);
    shoppingService.saveShoppingItems(updated);
  };

  return (
    <>
      {/* Toast – hiện ở trên cùng */}
      <Toast
        message={toastMsg}
        isVisible={toastVisible}
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
        meals={TODAY_MEALS}
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

      <CookConfirmModal
        isOpen={isCookOpen}
        onClose={() => setIsCookOpen(false)}
        onConfirm={handleCookConfirm}
      />
    </>
  );
};

export default DashboardFeature;
