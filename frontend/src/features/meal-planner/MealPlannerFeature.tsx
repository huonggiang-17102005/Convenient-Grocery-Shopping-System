import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import './meal-planner.css';
import AiRecipeModal from '../fridge/modals/AiRecipeModal';


export interface MealPlannerFeatureProps {
  role: 'homemaker' | 'member';
}

import type { Recipe, MealKey, DayMeals } from './types';
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

  const { plansByWeek, availableRecipes, fetchWeekPlan } = useMealPlannerContext();

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

  // Bottom sheet state
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [activeMealKey, setActiveMealKey] = useState<MealKey>('breakfast');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Toast
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);
  const hideToast = useCallback(() => {}, []);

  const openSheet = (mealKey: MealKey) => {
    setActiveMealKey(mealKey);
    setSheetOpen(true);
  };

  const handleConfirm = async (selected: Recipe[], peopleCount: number) => {
    // Add recipes to backend
    const activeDayTab = weekDays.find(d => d.key === activeDay);
    if (!activeDayTab) return;
    
    const year = new Date().getFullYear();
    const [d, m] = activeDayTab.date!.split('/');
    const dateStr = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

    try {
      for (const recipe of selected) {
        await mealPlannerService.addMealPlan(recipe.id, dateStr, activeMealKey, peopleCount);
      }
      
      const mealLabel = MEALS.find((m) => m.key === activeMealKey)?.title ?? '';
      const count     = selected.length;
      if (count > 0) {
        setToastMsg(`Đã thêm ${count} món ăn vào ${mealLabel.toLowerCase()}`);
        setToastTrigger(prev => prev + 1);
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
    }
  };

  const handleRemoveDish = async (_mealKey: MealKey, plannedMealId: string) => {
    try {
      await mealPlannerService.removeMealPlan(plannedMealId);
      // Force update context cache
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
    }
  };

  const currentDay: DayMeals = plan[activeDay] ?? { breakfast: [], lunch: [], dinner: [] };
  const activeMealTitle = MEALS.find((m) => m.key === activeMealKey)?.title ?? '';

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
          {role === 'homemaker' && (
            <button
              id="mp-ai-suggest-btn"
              type="button"
              className="mp-header__ai"
              onClick={() => setIsAiModalOpen(true)}
              aria-label="AI Gợi ý nấu ăn"
              title="AI Gợi ý nấu ăn"
            >
              <Sparkles size={22} color="var(--primary-color)" />
            </button>
          )}
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
          onClose={() => setSheetOpen(false)}
          onConfirm={handleConfirm}
        />
      )}

      <AiRecipeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
};

export default MealPlannerFeature;
