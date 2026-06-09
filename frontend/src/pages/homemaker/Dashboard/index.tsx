import React, { useState, useCallback } from 'react';
import './Dashboard.css';

// Components
import ExpiringWarningList from './components/ExpiringWarningList';
import TodayMenu from './components/TodayMenu';
import type { MealItem } from './components/TodayMenu';
import Toast from './components/Toast';
import type { IngredientCardProps } from './components/IngredientCard';

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

const Dashboard: React.FC = () => {
  // Modal open states
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isExpireOpen, setIsExpireOpen] = useState(false);
  const [isCookOpen,   setIsCookOpen]   = useState(false);

  // Selected item for ExpireItemModal
  const [selectedItem, setSelectedItem] = useState<IngredientCardProps | null>(null);

  // Toast state
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);

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

  return (
    <>
      {/* Toast – hiện ở trên cùng */}
      <Toast
        message={toastMsg}
        isVisible={toastVisible}
        onHide={hideToast}
      />

      {/* Invite Banner */}
      <div className="invite-banner">
        <p className="invite-banner__text">
          📢 Mời thêm thành viên gia đình để cùng quản lý tủ lạnh và shopping list!
        </p>
        <button
          id="btn-invite-code"
          className="invite-banner__btn"
          onClick={() => setIsInviteOpen(true)}
        >
          Lấy mã mời
        </button>
      </div>

      {/* Expiring Warning */}
      <ExpiringWarningList
        items={EXPIRING_ITEMS}
        onItemClick={handleIngredientClick}
      />

      {/* Today Menu */}
      <TodayMenu
        meals={TODAY_MEALS}
        onMarkCooked={() => setIsCookOpen(true)}
      />

      {/* ── Modals ── */}
      <InviteCodeModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        inviteCode="FC-9821-AM"
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

export default Dashboard;
