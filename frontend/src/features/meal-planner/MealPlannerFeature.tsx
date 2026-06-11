import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './meal-planner.css';


export interface MealPlannerFeatureProps {
  role: 'homemaker' | 'member';
}

import type { Recipe, MealKey, DayMeals, WeekPlan } from './types';
import WeekDayTabs from './components/WeekDayTabs';
import type { DayTab } from './components/WeekDayTabs';
import MealSection from './components/MealSection';
import AddDishBottomSheet from './modals/AddDishBottomSheet';
import Toast from '@/components/shared/Toast';

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

// ── Mock Recipes ──────────────────────────────────────────────────────────────
const MOCK_RECIPES: Record<string, Recipe> = {
  caKhoTo: { id: 'r4', name: 'Cá kho tộ', emoji: '🐟', duration: '45 phút' },
  thitBoXao: { id: 'r1', name: 'Thịt bò xào cà chua', emoji: '🥩', duration: '25 phút' },
  gaXaoHanhTay: { id: 'r3', name: 'Gà xào hành tây', emoji: '🍗', duration: '30 phút' },
  trungChien: { id: 'r8', name: 'Trứng chiên cà chua', emoji: '🍳', duration: '12 phút' },
  canhCaChua: { id: 'r2', name: 'Canh cà chua trứng', emoji: '🍅', duration: '15 phút' },
  tomRangMe: { id: 'r5', name: 'Tôm rang me', emoji: '🦐', duration: '20 phút' },
  rauMuong: { id: 'r6', name: 'Rau muống xào tỏi', emoji: '🥬', duration: '10 phút' },
  canhBiDo: { id: 'r7', name: 'Canh bí đỏ thịt băm', emoji: '🎃', duration: '20 phút' },
  suonRam: { id: 'r9', name: 'Sườn ram mặn', emoji: '🍖', duration: '35 phút' },
  bunBoHue: { id: 'r10', name: 'Bún bò Huế', emoji: '🍜', duration: '60 phút' },
  phoGa: { id: 'r11', name: 'Phở gà', emoji: '🍲', duration: '40 phút' },
};

// ── Initial default plan with mockup data ──────────────────────────────────────
function createDefaultPlan(days: DayTab[]): WeekPlan {
  const plan: WeekPlan = {};
  days.forEach(({ key }) => {
    if (key === 'mon') {
      plan[key] = {
        breakfast: [MOCK_RECIPES.caKhoTo, MOCK_RECIPES.thitBoXao, MOCK_RECIPES.gaXaoHanhTay],
        lunch: [MOCK_RECIPES.caKhoTo, MOCK_RECIPES.thitBoXao, MOCK_RECIPES.gaXaoHanhTay],
        dinner: [],
      };
    } else if (key === 'tue') {
      plan[key] = {
        breakfast: [MOCK_RECIPES.trungChien, MOCK_RECIPES.canhCaChua],
        lunch: [MOCK_RECIPES.tomRangMe, MOCK_RECIPES.rauMuong],
        dinner: [MOCK_RECIPES.canhBiDo],
      };
    } else if (key === 'wed') {
      plan[key] = {
        breakfast: [MOCK_RECIPES.suonRam, MOCK_RECIPES.rauMuong],
        lunch: [MOCK_RECIPES.bunBoHue],
        dinner: [MOCK_RECIPES.phoGa],
      };
    } else if (key === 'thu') {
      plan[key] = {
        breakfast: [MOCK_RECIPES.caKhoTo, MOCK_RECIPES.rauMuong],
        lunch: [MOCK_RECIPES.thitBoXao],
        dinner: [MOCK_RECIPES.gaXaoHanhTay],
      };
    } else if (key === 'fri') {
      plan[key] = {
        breakfast: [MOCK_RECIPES.canhBiDo, MOCK_RECIPES.trungChien],
        lunch: [MOCK_RECIPES.suonRam],
        dinner: [MOCK_RECIPES.tomRangMe],
      };
    } else if (key === 'sat') {
      plan[key] = {
        breakfast: [MOCK_RECIPES.bunBoHue],
        lunch: [MOCK_RECIPES.phoGa],
        dinner: [],
      };
    } else {
      plan[key] = { breakfast: [], lunch: [], dinner: [] };
    }
  });
  return plan;
}

// ── Meal meta ─────────────────────────────────────────────────────────────────
const MEALS: { key: MealKey; title: string }[] = [
  { key: 'breakfast', title: 'Bữa Sáng' },
  { key: 'lunch',     title: 'Bữa Trưa' },
  { key: 'dinner',    title: 'Bữa Tối'  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export const MealPlannerFeature: React.FC<MealPlannerFeatureProps> = ({ role }) => {
  const navigate = useNavigate();

  const [weekDays]  = useState<DayTab[]>(buildWeekDays);
  const [activeDay, setActiveDay] = useState<string>(() => {
    // Default to today's key
    const dayOfWeek = new Date().getDay();
    const keys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const key  = keys[dayOfWeek];
    // If not in the week array fall back to 'mon'
    return ['mon','tue','wed','thu','fri','sat','sun'].includes(key) ? key : 'mon';
  });

  const [plan, setPlan] = useState<WeekPlan>(() => {
    const saved = localStorage.getItem('meal_planner_week_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved week plan:', e);
      }
    }
    const defaultPlan = createDefaultPlan(buildWeekDays());
    localStorage.setItem('meal_planner_week_plan', JSON.stringify(defaultPlan));
    return defaultPlan;
  });

  // Persist plan changes to localStorage
  useEffect(() => {
    localStorage.setItem('meal_planner_week_plan', JSON.stringify(plan));
  }, [plan]);

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
      <Toast message={toastMsg} isVisible={toastVisible} onHide={hideToast} />

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
        />

        {/* ── Scrollable content ── */}
        <div className="mp-content">
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
          existingDishes={currentDay[activeMealKey]}
          onClose={() => setSheetOpen(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default MealPlannerFeature;
