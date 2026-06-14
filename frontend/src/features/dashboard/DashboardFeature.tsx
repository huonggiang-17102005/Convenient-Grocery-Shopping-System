import React, { useState, useCallback, useEffect } from 'react';
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
import ExpiringWarningList from './components/ExpiringWarningList';
import TodayMenu from './components/TodayMenu';
import type { MealItem } from './components/TodayMenu';
import Toast from '@/components/shared/Toast';
import type { IngredientCardProps } from './components/IngredientCard';
import ShoppingMission from './components/ShoppingMission';
import { shoppingService } from '../shopping-list/shopping-list.service';
import { fridgeService } from '../fridge/fridge.service';
import { mealPlannerService } from '../meal-planner/mealPlanner.service';

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

  // Real Invite Code state
  const [realInviteCode, setRealInviteCode] = useState('Đang tải...');

  // States for CookConfirmModal
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [todayIngredients, setTodayIngredients] = useState<CookIngredient[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealItem[]>([
    { session: 'morning', dish: 'Chưa có kế hoạch' },
    { session: 'noon', dish: 'Chưa có kế hoạch' },
    { session: 'evening', dish: 'Chưa có kế hoạch' }
  ]);

  useEffect(() => {
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
          const famId = data.family.id;
          setFamilyId(famId);

          // Lấy tủ lạnh
          const fRes = await fridgeService.getFamilyFridge(famId);
          setFridgeItems(fRes.data || []);

          // Lấy thực đơn hôm nay
          const today = new Date();
          const y = today.getFullYear();
          const m = String(today.getMonth() + 1).padStart(2, '0');
          const d = String(today.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          
          const plans = await mealPlannerService.getMealPlan(dateStr, dateStr);
          
          const mealMap: Record<string, string[]> = { breakfast: [], lunch: [], dinner: [] };
          const ingMap = new Map<string, CookIngredient>();
          
          plans.forEach((p: MealPlanPayload) => {
            if (p.recipes && p.recipes.name) {
              const mt = p.meal_type || 'breakfast';
              if (mealMap[mt]) mealMap[mt].push(p.recipes.name);
            }
            if (p.recipes && p.recipes.ingredients) {
               const multiplier = (p.people_count || 1) / (p.recipes.servings || 1);
               p.recipes.ingredients.forEach((ing) => {
                 const key = ing.name.toLowerCase();
                 const current = ingMap.get(key);
                 const parsedAmount = parseFloat(ing.quantity) || 0;
                 const addedAmount = parsedAmount * multiplier;
                 if (current) {
                   current.amountValue = String(parseFloat(current.amountValue) + addedAmount);
                 } else {
                   ingMap.set(key, {
                     name: ing.name,
                     category: ing.category || 'Khác',
                     amountValue: String(addedAmount),
                     amountUnit: ing.unit
                   });
                 }
               });
            }
          });
          setTodayIngredients(Array.from(ingMap.values()));

          const newTodayMeals: MealItem[] = [
            { session: 'morning', dish: mealMap.breakfast.length > 0 ? mealMap.breakfast.join(', ') : 'Chưa có kế hoạch' },
            { session: 'noon', dish: mealMap.lunch.length > 0 ? mealMap.lunch.join(', ') : 'Chưa có kế hoạch' },
            { session: 'evening', dish: mealMap.dinner.length > 0 ? mealMap.dinner.join(', ') : 'Chưa có kế hoạch' }
          ];
          
          setTodayMeals(newTodayMeals);

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
      const fRes = await fridgeService.getFamilyFridge(familyId);
      setFridgeItems(fRes.data || []);
    } catch (err: unknown) {
      console.error(err);
      showToast('Có lỗi xảy ra khi trừ kho!');
    }
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
