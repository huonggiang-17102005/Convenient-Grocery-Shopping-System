import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import './MealPlanner.css';

// Color theme per role
const ROLE_COLORS: Record<'homemaker' | 'member', string> = {
  homemaker: '#FF8A00',
  member: '#1E88E5',
};

export interface MealPlannerFeatureProps {
  role: 'homemaker' | 'member';
}

import type { Recipe, MealKey, DayMeals, WeekPlan } from './types';
import WeekDayTabs from './components/WeekDayTabs';
import type { DayTab } from './components/WeekDayTabs';
import MealSection from './components/MealSection';
import AddDishBottomSheet from './modals/AddDishBottomSheet';

// ── Helper: build week tabs starting from current Monday ─────────────────────
function buildWeekDays(): DayTab[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMon);

  const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const keys   = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  return keys.map((key, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
    return { key, label: labels[i], date: dateStr };
  });
}

// ── Initial empty plan ────────────────────────────────────────────────────────
function createEmptyPlan(days: DayTab[]): WeekPlan {
  const plan: WeekPlan = {};
  days.forEach(({ key }) => {
    plan[key] = { breakfast: [], lunch: [], dinner: [] };
  });
  return plan;
}

// ── Meal meta ─────────────────────────────────────────────────────────────────
const MEALS: { key: MealKey; title: string }[] = [
  { key: 'breakfast', title: 'Bữa Sáng' },
  { key: 'lunch',     title: 'Bữa Trưa' },
  { key: 'dinner',    title: 'Bữa Tối'  },
];

// ── Toast component (inline — scoped to this page) ────────────────────────────
interface MpToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}
const MpToast: React.FC<MpToastProps> = ({ message, isVisible, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(onHide, 2600);
      return () => clearTimeout(t);
    }
  }, [isVisible, onHide]);

  return (
    <div className={`mp-toast ${isVisible ? 'mp-toast--visible' : 'mp-toast--hidden'}`} role="status" aria-live="polite">
      <div className="mp-toast__icon">
        <Check size={16} color="white" strokeWidth={3} />
      </div>
      <span className="mp-toast__text">{message}</span>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export const MealPlannerFeature: React.FC<MealPlannerFeatureProps> = ({ role }) => {
  const navigate = useNavigate();
  const primaryColor = ROLE_COLORS[role];

  const [weekDays]  = useState<DayTab[]>(buildWeekDays);
  const [activeDay, setActiveDay] = useState<string>(() => {
    // Default to today's key
    const dayOfWeek = new Date().getDay();
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const key  = keys[dayOfWeek];
    // If not in the week array fall back to 'mon'
    return ['mon','tue','wed','thu','fri','sat','sun'].includes(key) ? key : 'mon';
  });

  const [plan, setPlan] = useState<WeekPlan>(() => createEmptyPlan(buildWeekDays()));

  // Bottom sheet state
  const [sheetOpen,     setSheetOpen]     = useState(false);
  const [activeMealKey, setActiveMealKey] = useState<MealKey>('breakfast');

  // Toast
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const hideToast = useCallback(() => setToastVisible(false), []);

  const openSheet = (mealKey: MealKey) => {
    setActiveMealKey(mealKey);
    setSheetOpen(true);
  };

  const handleConfirm = (selected: Recipe[]) => {
    setPlan((prev) => {
      const dayPlan: DayMeals = { ...prev[activeDay] };
      dayPlan[activeMealKey] = selected;
      return { ...prev, [activeDay]: dayPlan };
    });

    const mealLabel = MEALS.find((m) => m.key === activeMealKey)?.title ?? '';
    const count     = selected.length;
    if (count > 0) {
      setToastMsg(`Đã thêm ${count} món ăn vào ${mealLabel.toLowerCase()}`);
      setToastVisible(true);
    }
  };

  const handleRemoveDish = (mealKey: MealKey, dishId: string) => {
    setPlan((prev) => {
      const dayPlan: DayMeals = { ...prev[activeDay] };
      dayPlan[mealKey] = dayPlan[mealKey].filter((d) => d.id !== dishId);
      return { ...prev, [activeDay]: dayPlan };
    });
  };

  const currentDay: DayMeals = plan[activeDay] ?? { breakfast: [], lunch: [], dinner: [] };
  const activeMealTitle = MEALS.find((m) => m.key === activeMealKey)?.title ?? '';

  return (
    <>
      {/* Toast */}
      <MpToast message={toastMsg} isVisible={toastVisible} onHide={hideToast} />

      <div className="meal-planner-page">
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
          primaryColor={primaryColor}
        />

        {/* ── Scrollable content ── */}
        <div className="mp-content">
          {MEALS.map(({ key, title }) => (
            <MealSection
              key={key}
              title={title}
              mealKey={key}
              dishes={currentDay[key]}
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
          existingDishes={currentDay[activeMealKey]}
          onClose={() => setSheetOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default MealPlannerFeature;
