import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { Recipe, MealKey } from '../../types';
import SearchAndFilter from './SearchAndFilter';
import SelectedChipsList from './SelectedChipsList';
import RecipeSelectCard from './RecipeSelectCard';

interface AddDishBottomSheetProps {
  isOpen: boolean;
  mealTitle: string;   // e.g. 'Bữa Sáng'
  mealKey: MealKey;
  /** Dishes available to be added (from Library and Favorites) */
  availableRecipes: Recipe[];
  /** Dishes already added to this meal (to pre-check them) */
  existingDishes: Recipe[];
  onClose: () => void;
  onConfirm: (selected: Recipe[]) => void;
}

const AddDishBottomSheet: React.FC<AddDishBottomSheetProps> = ({
  isOpen,
  availableRecipes,
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
    if (!q) return availableRecipes;
    
    return availableRecipes.filter((r) => {
      if (filterMode === 'name') {
        return r.name.toLowerCase().includes(q);
      } else {
        // filterMode === 'ingredient'
        return r.ingredients?.some(ing => ing.name.toLowerCase().includes(q));
      }
    });
  }, [query, availableRecipes, filterMode]);

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
    () => availableRecipes.filter((r) => selectedIds.has(r.id)),
    [availableRecipes, selectedIds]
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
