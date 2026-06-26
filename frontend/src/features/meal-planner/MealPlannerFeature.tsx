import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import './meal-planner.css';
import AiRecipeModal from '../fridge/modals/AiRecipeModal';
import RecipeDetailModal from '../recipes/modals/RecipeDetailModal';
import ShoppingConfirmModal from '../recipes/modals/ShoppingConfirmModal';
import { useFridgeContext } from '../../contexts/FridgeContext';
import { shoppingService } from '../shopping-list/shopping-list.service';

export interface MealPlannerFeatureProps {
  role: 'homemaker' | 'member';
}

import type { Recipe, MealKey, DayMeals, PlannedMeal } from './types';
import WeekDayTabs from './components/WeekDayTabs';
import type { DayTab } from './components/WeekDayTabs';
import MealSection from './components/MealSection';
import AddDishBottomSheet from './modals/AddDishBottomSheet';
import Toast from '@/components/common/Toast';

// ── Helper: build week tabs starting from current Monday ─────────────────────
function buildWeekDays(weekOffset: number = 0): DayTab[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon + (weekOffset * 7));

  const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const keys   = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return keys.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
    return { key, label: labels[i], date: dateStr };
  });
}

// ── Meal meta ─────────────────────────────────────────────────────────────────
const MEALS: { key: MealKey; title: string }[] = [
  { key: 'breakfast', title: 'Bữa Sáng' },
  { key: 'lunch',     title: 'Bữa Trưa' },
  { key: 'dinner',    title: 'Bữa Tối'  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
import { mealPlannerService } from './mealPlanner.service';
import { useMealPlannerContext } from '../../contexts/MealPlannerContext';
import { useAuth } from '../../contexts/AuthContext';

export const MealPlannerFeature: React.FC<MealPlannerFeatureProps> = ({ role }) => {
  const { family } = useAuth();
  const navigate = useNavigate();

  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = React.useMemo(() => buildWeekDays(weekOffset), [weekOffset]);

  const [activeDay, setActiveDay] = useState<string>(() => {
    const dayOfWeek = new Date().getDay();
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const key  = keys[dayOfWeek];
    return ['mon','tue','wed','thu','fri','sat','sun'].includes(key) ? key : 'mon';
  });

  const { plansByWeek, setPlansByWeek, availableRecipes, setAvailableRecipes, fetchWeekPlan } = useMealPlannerContext();

  const getCacheKey = () => {
    const startDateStr = weekDays[0].date;
    const endDateStr = weekDays[6].date;
    const year = new Date().getFullYear();
    const parseDate = (dStr: string) => {
      const [d, m] = dStr.split('/');
      return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    };
    return `${parseDate(startDateStr!)}_${parseDate(endDateStr!)}`;
  };

  const plan = plansByWeek[getCacheKey()] || {
    mon: { breakfast: [], lunch: [], dinner: [] },
    tue: { breakfast: [], lunch: [], dinner: [] },
    wed: { breakfast: [], lunch: [], dinner: [] },
    thu: { breakfast: [], lunch: [], dinner: [] },
    fri: { breakfast: [], lunch: [], dinner: [] },
    sat: { breakfast: [], lunch: [], dinner: [] },
    sun: { breakfast: [], lunch: [], dinner: [] },
  };

  useEffect(() => {
    const startDateStr = weekDays[0].date;
    const endDateStr = weekDays[6].date;
    const year = new Date().getFullYear();
    const parseDate = (dStr: string) => {
      const [d, m] = dStr.split('/');
      return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    };
    fetchWeekPlan(parseDate(startDateStr!), parseDate(endDateStr!));
  }, [weekDays, fetchWeekPlan]);

  const { items: fridgeItems } = useFridgeContext();

  // Bottom sheet state
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [activeMealKey, setActiveMealKey] = useState<MealKey>('breakfast');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Recipe detail modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedPlannedMeal, setSelectedPlannedMeal] = useState<PlannedMeal | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // Shopping confirm modal state
  const [isShoppingConfirmOpen, setIsShoppingConfirmOpen] = useState(false);
  const [shoppingConfirmIngredients, setShoppingConfirmIngredients] = useState<any[]>([]);

  // Servings change modal state
  const [isServingsModalOpen, setIsServingsModalOpen] = useState(false);
  const [servingsModalMealKey, setServingsModalMealKey] = useState<MealKey>('breakfast');
  const [servingsModalCount, setServingsModalCount] = useState(1);

  // Toast
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);
  const hideToast = useCallback(() => {}, []);

  const handleCardClick = useCallback((pm: PlannedMeal) => {
    setSelectedPlannedMeal(pm);
    setSelectedRecipe(pm.recipe);
    setIsRecipeModalOpen(true);
  }, []);

  const openSheet = (mealKey: MealKey) => {
    setActiveMealKey(mealKey);
    setSheetOpen(true);
  };

  // Open the servings-change modal for a given meal
  const handleChangeServings = (mealKey: MealKey) => {
    const existing = currentDay[mealKey]?.[0]?.people_count ?? 1;
    setServingsModalMealKey(mealKey);
    setServingsModalCount(existing);
    setIsServingsModalOpen(true);
  };

  // Confirm servings change from the modal
  const handleServingsConfirm = async () => {
    const activeDayTab = weekDays.find(d => d.key === activeDay);
    if (!activeDayTab) return;
    const year = new Date().getFullYear();
    const [d, m] = activeDayTab.date!.split('/');
    const dateStr = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

    const cacheKey = getCacheKey();

    // Optimistic: update people_count locally
    setPlansByWeek(prev => {
      const currentWeek = prev[cacheKey];
      if (!currentWeek) return prev;
      const updatedDay = { ...currentWeek[activeDay] };
      updatedDay[servingsModalMealKey] = (updatedDay[servingsModalMealKey] || []).map(pm => ({
        ...pm,
        people_count: servingsModalCount
      }));
      return { ...prev, [cacheKey]: { ...currentWeek, [activeDay]: updatedDay } };
    });

    setIsServingsModalOpen(false);

    try {
      await mealPlannerService.updateServings(dateStr, servingsModalMealKey, servingsModalCount);
    } catch (err) {
      console.error('Lỗi cập nhật khẩu phần:', err);
      setToastMsg('Có lỗi xảy ra khi cập nhật khẩu phần');
      setToastTrigger(prev => prev + 1);
    }
  };

  const handleConfirm = async (selected: Recipe[], peopleCount: number) => {
    // Add recipes to backend
    const activeDayTab = weekDays.find(d => d.key === activeDay);
    if (!activeDayTab) return;
    
    const year = new Date().getFullYear();
    const [d, m] = activeDayTab.date!.split('/');
    const dateStr = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

    const cacheKey = getCacheKey();
    const originalPlans = plansByWeek;

    // 1. Optimistic Update (add to local state immediately with temporary IDs)
    const tempPlannedMeals = selected.map((recipe, idx) => ({
      id: `temp_${Date.now()}_${idx}`,
      people_count: peopleCount,
      recipe: recipe
    }));

    setPlansByWeek(prev => {
      const currentWeek = prev[cacheKey];
      if (!currentWeek) return prev;

      const updatedDayMeals = { ...currentWeek[activeDay] };
      updatedDayMeals[activeMealKey] = [
        ...(updatedDayMeals[activeMealKey] || []),
        ...tempPlannedMeals
      ];

      return {
        ...prev,
        [cacheKey]: {
          ...currentWeek,
          [activeDay]: updatedDayMeals
        }
      };
    });

    const mealLabel = MEALS.find((m) => m.key === activeMealKey)?.title ?? '';
    const count     = selected.length;
    if (count > 0) {
      setToastMsg(`Đã thêm ${count} món ăn vào ${mealLabel.toLowerCase()}`);
      setToastTrigger(prev => prev + 1);
    }

    try {
      const recipeIds = selected.map(r => r.id);
      if (recipeIds.length > 0) {
        await mealPlannerService.addMealPlan(recipeIds, dateStr, activeMealKey, peopleCount);
      }
      
      // Reload plans via context (force reload)
      const startDateStr = weekDays[0].date;
      const endDateStr = weekDays[6].date;
      const parseDate = (dStr: string) => {
        const [d, m] = dStr.split('/');
        return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      };
      await fetchWeekPlan(parseDate(startDateStr!), parseDate(endDateStr!), true);
    } catch (err) {
      console.error('Lỗi thêm món:', err);
      setToastMsg('Có lỗi xảy ra khi thêm món');
      setToastTrigger(prev => prev + 1);
      // Rollback on error
      setPlansByWeek(originalPlans);
    }
  };

  const handleRemoveDish = async (mealKey: MealKey, plannedMealId: string) => {
    const cacheKey = getCacheKey();
    const originalPlans = plansByWeek;

    // 1. Optimistic Update (remove from local state immediately)
    setPlansByWeek(prev => {
      const currentWeek = prev[cacheKey];
      if (!currentWeek) return prev;

      const updatedDayMeals = { ...currentWeek[activeDay] };
      updatedDayMeals[mealKey] = (updatedDayMeals[mealKey] || []).filter(pm => pm.id !== plannedMealId);

      return {
        ...prev,
        [cacheKey]: {
          ...currentWeek,
          [activeDay]: updatedDayMeals
        }
      };
    });

    try {
      await mealPlannerService.removeMealPlan(plannedMealId);
      // Reload plans via context (force reload)
      const startDateStr = weekDays[0].date;
      const endDateStr = weekDays[6].date;
      const year = new Date().getFullYear();
      const parseDate = (dStr: string) => {
        const [d, m] = dStr.split('/');
        return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      };
      await fetchWeekPlan(parseDate(startDateStr!), parseDate(endDateStr!), true);
    } catch (err) {
      console.error('Lỗi xóa món:', err);
      setToastMsg('Có lỗi xảy ra khi xóa món');
      setToastTrigger(prev => prev + 1);
      // Rollback on error
      setPlansByWeek(originalPlans);
    }
  };

  const currentDay: DayMeals = plan[activeDay] ?? { breakfast: [], lunch: [], dinner: [] };
  const activeMealTitle = MEALS.find((m) => m.key === activeMealKey)?.title ?? '';

  const hasDishes = React.useMemo(() => {
    return MEALS.some(({ key }) => currentDay[key] && currentDay[key].length > 0);
  }, [currentDay]);

  const handleAddToShoppingList = useCallback(async (recipe: Recipe) => {
    const missing: Array<{
      name: string;
      category: string;
      neededText: string;
      defaultBuyAmount: string;
      quantity?: number;
      unit?: string;
    }> = [];

    recipe.ingredients.forEach(ing => {
      const inFridge = (fridgeItems || []).find(f =>
        (f.category || 'Khác').toLowerCase().trim() === (ing.category || 'Khác').toLowerCase().trim() &&
        f.name.toLowerCase().trim() === ing.name.toLowerCase().trim()
      );

      if (ing.category === 'Gia vị') {
        if (!inFridge) {
          const roundedAmount = Math.round(ing.amount * 100) / 100;
          missing.push({
            name: ing.name,
            category: ing.category,
            neededText: 'Gia vị chưa có trong tủ lạnh',
            defaultBuyAmount: ing.amount > 0 ? `${roundedAmount} ${ing.unit}` : '1 gói',
            quantity: ing.amount > 0 ? roundedAmount : 1,
            unit: ing.amount > 0 ? ing.unit : 'gói',
          });
        }
      } else {
        const available = inFridge ? inFridge.quantity : 0;
        if (available < ing.amount) {
          const diff = ing.amount - available;
          const roundedAmount = Math.round(ing.amount * 100) / 100;
          const roundedAvailable = Math.round(available * 100) / 100;
          const roundedDiff = Math.round(diff * 100) / 100;
          missing.push({
            name: ing.name,
            category: ing.category,
            neededText: `Cần ${roundedAmount} ${ing.unit} (Trong tủ: ${roundedAvailable} ${ing.unit})`,
            defaultBuyAmount: `${roundedDiff} ${ing.unit}`,
            quantity: roundedDiff,
            unit: ing.unit,
          });
        }
      }
    });

    if (missing.length === 0) {
      setToastMsg('Gia đình đã có đầy đủ nguyên liệu trong tủ lạnh cho món ăn này!');
      setToastTrigger(prev => prev + 1);
      setIsRecipeModalOpen(false);
      return;
    }

    setShoppingConfirmIngredients(missing);
    setIsShoppingConfirmOpen(true);
    setIsRecipeModalOpen(false);
  }, [fridgeItems]);

  const handleConsolidateMissing = useCallback(() => {
    const missing: Array<{
      name: string;
      category: string;
      neededText: string;
      defaultBuyAmount: string;
      quantity?: number;
      unit?: string;
    }> = [];

    const neededMap = new Map<string, { name: string; category: string; amount: number; unit: string }>();

    MEALS.forEach(({ key }) => {
      const plannedMeals = currentDay[key] || [];
      plannedMeals.forEach(pm => {
        if (pm.isCooked || pm.isShopped) return; // Skip cooked or already gathered items!
        const recipe = pm.recipe;
        if (!recipe || !recipe.ingredients) return;
        const multiplier = (pm.people_count || 1) / (recipe.servings || 1);
        recipe.ingredients.forEach(ing => {
          const nameLower = ing.name.toLowerCase().trim();
          const catLower = (ing.category || 'Khác').toLowerCase().trim();
          const mapKey = `${nameLower}_${catLower}`;
          const current = neededMap.get(mapKey);
          const parsedAmount = ing.amount || 0;
          const scaledAmount = parsedAmount * multiplier;
          if (current) {
            current.amount += scaledAmount;
          } else {
            neededMap.set(mapKey, {
              name: ing.name,
              category: ing.category || 'Khác',
              amount: scaledAmount,
              unit: ing.unit || '',
            });
          }
        });
      });
    });

    neededMap.forEach((neededItem) => {
      const inFridge = (fridgeItems || []).find(f =>
        (f.category || 'Khác').toLowerCase().trim() === (neededItem.category || 'Khác').toLowerCase().trim() &&
        f.name.toLowerCase().trim() === neededItem.name.toLowerCase().trim()
      );

      if (neededItem.category === 'Gia vị') {
        if (!inFridge) {
          const roundedAmount = Math.round(neededItem.amount * 100) / 100;
          missing.push({
            name: neededItem.name,
            category: neededItem.category,
            neededText: 'Gia vị chưa có trong tủ lạnh',
            defaultBuyAmount: neededItem.amount > 0 ? `${roundedAmount} ${neededItem.unit}` : '1 gói',
            quantity: neededItem.amount > 0 ? roundedAmount : 1,
            unit: neededItem.amount > 0 ? neededItem.unit : 'gói',
          });
        }
      } else {
        const available = inFridge ? inFridge.quantity : 0;
        if (available < neededItem.amount) {
          const diff = neededItem.amount - available;
          const roundedAmount = Math.round(neededItem.amount * 100) / 100;
          const roundedAvailable = Math.round(available * 100) / 100;
          const roundedDiff = Math.round(diff * 100) / 100;
          missing.push({
            name: neededItem.name,
            category: neededItem.category,
            neededText: `Cần ${roundedAmount} ${neededItem.unit} (Trong tủ: ${roundedAvailable} ${neededItem.unit})`,
            defaultBuyAmount: `${roundedDiff} ${neededItem.unit}`,
            quantity: roundedDiff,
            unit: neededItem.unit,
          });
        }
      }
    });

    if (missing.length === 0) {
      setToastMsg('Gia đình đã có đầy đủ nguyên liệu trong tủ lạnh cho các món ăn ngày hôm nay!');
      setToastTrigger(prev => prev + 1);
      return;
    }

    setShoppingConfirmIngredients(missing);
    setIsShoppingConfirmOpen(true);
  }, [currentDay, fridgeItems]);

  const handleShoppingConfirmSubmit = useCallback(async (items: Array<{ name: string; category: string; buyAmountStr?: string; quantity?: number; unit?: string }>) => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const date = String(today.getDate()).padStart(2, '0');
      const localTodayDateStr = `${year}-${month}-${date}`;

      for (const item of items) {
        let finalQty = 1;
        let finalUnit = 'g';
        if (item.category === 'Gia vị') {
          finalQty = 0;
          finalUnit = (item.buyAmountStr || '').trim();
        } else {
          finalQty = item.quantity ?? 1;
          finalUnit = item.unit || 'g';
        }

        await shoppingService.createShoppingItem({
          name: item.name,
          category: item.category,
          quantity: finalQty,
          unit: finalUnit,
          deadlineDate: localTodayDateStr,
          deadlineTime: '23:59'
        });
      }

      // Mark planned items as shopped
      if (selectedPlannedMeal) {
        await mealPlannerService.markSingleItemShopped(selectedPlannedMeal.id);
      } else {
        const activeDayTab = weekDays.find(d => d.key === activeDay);
        if (activeDayTab) {
          const [d, m] = activeDayTab.date!.split('/');
          const dateStr = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          await mealPlannerService.markShopped(dateStr);
        }
      }

      setIsShoppingConfirmOpen(false);
      setToastMsg('Đã thêm các nguyên liệu thiếu vào danh sách mua sắm thành công!');
      setToastTrigger(prev => prev + 1);

      // Force reload weekly plan to update badge labels instantly
      const startDateStr = weekDays[0].date;
      const endDateStr = weekDays[6].date;
      const parseDate = (dStr: string) => {
        const [dVal, mVal] = dStr.split('/');
        return `${year}-${mVal.padStart(2, '0')}-${dVal.padStart(2, '0')}`;
      };
      await fetchWeekPlan(parseDate(startDateStr!), parseDate(endDateStr!), true);

      navigate(`/${role}/shopping-list`);
    } catch (error) {
      console.error('Error adding custom items to shopping list:', error);
      setToastMsg('Lỗi khi thêm nguyên liệu vào danh sách mua sắm');
      setToastTrigger(prev => prev + 1);
    }
  }, [role, navigate, selectedPlannedMeal, weekDays, activeDay, fetchWeekPlan]);

  const totalCalories = React.useMemo(() => {
    let sum = 0;
    const mealKeys: MealKey[] = ['breakfast', 'lunch', 'dinner'];
    mealKeys.forEach(m => {
      const plannedMeals = currentDay[m] || [];
      plannedMeals.forEach(pm => {
        if (pm.recipe && pm.recipe.calories) {
          sum += pm.recipe.calories;
        }
      });
    });
    return sum;
  }, [currentDay]);

  const calorieTarget = family?.daily_calorie_target || 2000;
  const isOverCalorie = totalCalories > calorieTarget;

  return (
    <>
      {/* Toast */}
      <Toast message={toastMsg} trigger={toastTrigger} onHide={hideToast} />

      <div className={`meal-planner-page ${role}-theme`}>
        {/* ── Sub-header ── */}
        <header className="mp-header">
          <button
            id="mp-back-btn"
            className="mp-header__back"
            onClick={() => navigate(-1)}
            aria-label="Quay lại"
          >
            <ArrowLeft size={22} color="#1A1A1A" />
          </button>
          <h1 className="mp-header__title">Thực đơn tuần</h1>
        </header>

        {/* ── Day tabs ── */}
        <WeekDayTabs
          days={weekDays}
          activeDay={activeDay}
          onSelectDay={setActiveDay}
          onPrevWeek={() => setWeekOffset(prev => prev - 1)}
          onNextWeek={() => setWeekOffset(prev => prev + 1)}
        />

        {/* ── Scrollable content ── */}
        <div className="mp-content">
          {/* Calorie Progress Bar */}
          <div className="calorie-summary-box" style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            border: '1.27px solid #E0E0E0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A1A1A', fontFamily: 'Plus Jakarta Sans', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔥 Năng lượng dự kiến hôm nay
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: isOverCalorie ? '#D32F2F' : '#1A1A1A', fontFamily: 'Plus Jakarta Sans' }}>
                {totalCalories} / {calorieTarget} kcal/người
              </span>
            </div>

            {/* Progress bar container */}
            <div style={{
              width: '100%',
              height: '10px',
              background: '#F1F5F9',
              borderRadius: '100px',
              overflow: 'hidden',
              position: 'relative',
              marginBottom: isOverCalorie ? '12px' : '0'
            }}>
              <div style={{
                width: `${Math.min(100, (totalCalories / calorieTarget) * 100)}%`,
                height: '100%',
                background: isOverCalorie ? '#EF5350' : '#4CAF50',
                borderRadius: '100px',
                transition: 'width 0.3s ease'
              }} />
            </div>

            {isOverCalorie && (
              <div style={{
                display: 'flex',
                gap: '8px',
                background: '#FFEBEE',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                color: '#C62828',
                fontWeight: '500',
                lineHeight: '16px',
                fontFamily: 'Plus Jakarta Sans'
              }}>
                <span>⚠️</span>
                <span>Tổng lượng calo lên kế hoạch cho hôm nay đã vượt quá ngưỡng mục tiêu của gia đình (+{totalCalories - calorieTarget} kcal). Hãy cân nhắc điều chỉnh thực đơn để cân bằng dinh dưỡng.</span>
              </div>
            )}

            {role === 'homemaker' && hasDishes && (
              <button
                id="mp-consolidate-missing-btn"
                type="button"
                className="mp-consolidate-btn"
                onClick={handleConsolidateMissing}
              >
                Gom tất cả đồ thiếu vào Shopping list
              </button>
            )}
          </div>

          {MEALS.map(({ key, title }) => (
            <MealSection
              key={key}
              title={title}
              mealKey={key}
              dishes={currentDay[key]}
              showAdd={role !== 'member'}
              showRemove={role !== 'member'}
              onAddDish={() => openSheet(key)}
              onRemoveDish={(dishId) => handleRemoveDish(key, dishId)}
              onClickCard={handleCardClick}
              onChangeServings={() => handleChangeServings(key)}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      {sheetOpen && (
        <AddDishBottomSheet
          isOpen={sheetOpen}
          mealTitle={activeMealTitle}
          mealKey={activeMealKey}
          availableRecipes={availableRecipes}
          existingDishes={currentDay[activeMealKey].map(pm => pm.recipe)}
          skipServings={currentDay[activeMealKey].length > 0}
          initialPeopleCount={currentDay[activeMealKey]?.[0]?.people_count ?? 1}
          onClose={() => setSheetOpen(false)}
          onConfirm={handleConfirm}
        />
      )}

      {/* ── Servings change modal ── */}
      {isServingsModalOpen && (
        <div className="mp-overlay" onClick={() => setIsServingsModalOpen(false)} aria-modal="true" role="dialog">
          <div className="mp-bottom-sheet" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
            <div style={{ width: '100%', paddingTop: 20, paddingBottom: 32, paddingLeft: 20, paddingRight: 20, background: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <div onClick={() => setIsServingsModalOpen(false)} style={{ width: '100%', justifyContent: 'center', alignItems: 'flex-start', display: 'flex', cursor: 'pointer', paddingBottom: 8 }}>
                <div style={{ width: 40, height: 4, background: '#E0E0E0', borderRadius: 4 }} />
              </div>
              <div style={{ paddingTop: 16, flexDirection: 'column', display: 'flex' }}>
                <div style={{ color: '#1A1A1A', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '24px' }}>Thay đổi khẩu phần</div>
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '20px' }}>Cập nhật số người ăn cho bữa {MEALS.find(m => m.key === servingsModalMealKey)?.title?.toLowerCase()}.</div>
              </div>
              <div style={{ width: '100%', paddingTop: 24, flexDirection: 'column', alignItems: 'center', display: 'flex' }}>
                <div style={{ width: '100%', paddingLeft: 8, paddingRight: 8, justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                  <button onClick={() => setServingsModalCount(prev => Math.max(1, prev - 1))} disabled={servingsModalCount <= 1} style={{ width: 44, height: 44, background: 'white', borderRadius: '50%', border: '1.27px solid #E0E0E0', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', padding: 0 }}>
                    <span style={{ color: servingsModalCount > 1 ? '#1A1A1A' : '#E0E0E0', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>−</span>
                  </button>
                  <div style={{ flexDirection: 'column', alignItems: 'center', gap: 4, display: 'flex' }}>
                    <div style={{ color: '#FF8A00', fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '40px' }}>{servingsModalCount}</div>
                    <div style={{ color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400' }}>người ăn</div>
                  </div>
                  <button onClick={() => setServingsModalCount(prev => prev + 1)} style={{ width: 44, height: 44, background: 'white', borderRadius: '50%', border: '1.27px solid #FF8A00', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', padding: 0 }}>
                    <span style={{ color: '#FF8A00', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>+</span>
                  </button>
                </div>
              </div>
              <div style={{ width: '100%', paddingTop: 24, flexDirection: 'column', display: 'flex' }}>
                <button id="mp-servings-confirm-btn" onClick={handleServingsConfirm} style={{ width: '100%', height: 48, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', cursor: 'pointer' }}>
                  Xác nhận {servingsModalCount} người
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AiRecipeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRecipeSaved={(newRecipe) => {
          setAvailableRecipes(prev => [newRecipe, ...prev]);
        }}
      />

      {isRecipeModalOpen && selectedRecipe && (
        <RecipeDetailModal
          isOpen={isRecipeModalOpen}
          recipe={selectedRecipe}
          showEditDelete={false}
          showShoppingAndCook={true}
          onClose={() => {
            setIsRecipeModalOpen(false);
            setSelectedRecipe(null);
            setSelectedPlannedMeal(null);
          }}
          onEdit={() => {}}
          onDelete={() => {}}
          onToggleFavorite={() => {}}
          onAddToShoppingList={handleAddToShoppingList}
        />
      )}

      {isShoppingConfirmOpen && (
        <ShoppingConfirmModal
          isOpen={isShoppingConfirmOpen}
          onClose={() => setIsShoppingConfirmOpen(false)}
          onConfirm={handleShoppingConfirmSubmit}
          initialIngredients={shoppingConfirmIngredients}
        />
      )}

      {role === 'homemaker' && (
        <button
          id="mp-ai-fab-btn"
          type="button"
          className="mp-ai-fab"
          onClick={() => setIsAiModalOpen(true)}
          aria-label="AI Gợi ý nấu ăn"
          title="AI Gợi ý nấu ăn"
        >
          <Sparkles size={24} />
        </button>
      )}
    </>
  );
};

export default MealPlannerFeature;
