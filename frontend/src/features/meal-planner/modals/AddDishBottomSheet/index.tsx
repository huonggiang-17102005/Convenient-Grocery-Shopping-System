import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Recipe, MealKey } from '../../types';
import SearchAndFilter from './SearchAndFilter';
import SelectedChipsList from './SelectedChipsList';
import RecipeSelectCard from './RecipeSelectCard';

// ── Mock recipe catalogue ────────────────────────────────────────────────────
const ALL_RECIPES: Recipe[] = [
  { id: 'r1',  name: 'Thịt bò xào cà chua',  emoji: '🥩', duration: '25 phút' },
  { id: 'r2',  name: 'Canh cà chua trứng',    emoji: '🍅', duration: '15 phút' },
  { id: 'r3',  name: 'Gà xào hành tây',       emoji: '🍗', duration: '30 phút' },
  { id: 'r4',  name: 'Cá kho tộ',             emoji: '🐟', duration: '45 phút' },
  { id: 'r5',  name: 'Tôm rang me',           emoji: '🦐', duration: '20 phút' },
  { id: 'r6',  name: 'Rau muống xào tỏi',     emoji: '🥬', duration: '10 phút' },
  { id: 'r7',  name: 'Canh bí đỏ thịt băm',   emoji: '🎃', duration: '20 phút' },
  { id: 'r8',  name: 'Trứng chiên cà chua',   emoji: '🍳', duration: '12 phút' },
  { id: 'r9',  name: 'Sườn ram mặn',          emoji: '🍖', duration: '35 phút' },
  { id: 'r10', name: 'Bún bò Huế',            emoji: '🍜', duration: '60 phút' },
  { id: 'r11', name: 'Phở gà',                emoji: '🍲', duration: '40 phút' },
  { id: 'r12', name: 'Đậu hũ sốt cà chua',   emoji: '🧆', duration: '15 phút' },
];

interface AddDishBottomSheetProps {
  isOpen: boolean;
  mealTitle: string;   // e.g. 'Bữa Sáng'
  mealKey: MealKey;
  /** Dishes already added to this meal (to pre-check them) */
  existingDishes: Recipe[];
  onClose: () => void;
  onConfirm: (selected: Recipe[]) => void;
}

const AddDishBottomSheet: React.FC<AddDishBottomSheetProps> = ({
  isOpen,
  existingDishes,
  onClose,
  onConfirm,
}) => {
  const [query, setQuery]             = useState('');
  const [filterMode, setFilterMode]   = useState<'name' | 'ingredient'>('name');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(existingDishes.map((d) => d.id)));

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Filtered recipe list
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_RECIPES;
    return ALL_RECIPES.filter((r) => r.name.toLowerCase().includes(q));
  }, [query]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectedRecipes = useMemo(
    () => ALL_RECIPES.filter((r) => selectedIds.has(r.id)),
    [selectedIds]
  );

  const handleConfirm = () => {
    onConfirm(selectedRecipes);
    onClose();
  };

  // Click outside to close
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const count = selectedIds.size;

  return (
    <div className="mp-overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="mp-bottom-sheet" ref={sheetRef}>

        {/* Drag handle */}
        <div className="mp-sheet-handle-row" aria-hidden="true">
          <div className="mp-sheet-handle" />
        </div>

        {/* Search + Filter */}
        <SearchAndFilter
          query={query}
          onQueryChange={setQuery}
          filterMode={filterMode}
          onFilterChange={setFilterMode}
        />

        {/* Selected chips — hidden when nothing selected */}
        <SelectedChipsList
          selectedRecipes={selectedRecipes}
          onRemove={toggle}
        />

        {/* Recipe list */}
        <div className="mp-recipe-list">
          {filtered.length === 0 ? (
            <div className="mp-recipe-empty">
              <div className="mp-recipe-empty__icon">🔍</div>
              <p>Không tìm thấy công thức nào</p>
            </div>
          ) : (
            filtered.map((recipe) => (
              <RecipeSelectCard
                key={recipe.id}
                recipe={recipe}
                isSelected={selectedIds.has(recipe.id)}
                onToggle={toggle}
              />
            ))
          )}
        </div>

        {/* Confirm button */}
        <div className="mp-confirm-area">
          <button
            id="mp-confirm-add"
            className={`mp-confirm-btn${count > 0 ? ' mp-confirm-btn--active' : ' mp-confirm-btn--disabled'}`}
            onClick={count > 0 ? handleConfirm : undefined}
            disabled={count === 0}
            aria-label={count > 0 ? `Xác nhận thêm ${count} món vào bữa` : 'Chưa chọn món nào'}
          >
            {count > 0
              ? `Xác nhận thêm ${count} món vào bữa`
              : 'Xác nhận thêm 0 món vào bữa'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddDishBottomSheet;
