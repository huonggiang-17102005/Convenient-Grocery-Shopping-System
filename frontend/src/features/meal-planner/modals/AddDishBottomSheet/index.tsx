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
  onConfirm: (selected: Recipe[], peopleCount: number) => void;
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

  const [servingsModalOpen, setServingsModalOpen] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);

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
    const removeDiacritics = (str: string) => {
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd');
    };

    const q = removeDiacritics(query.trim().toLowerCase());
    if (!q) return availableRecipes;
    
    return availableRecipes.filter((r) => {
      if (filterMode === 'name') {
        return removeDiacritics(r.name.toLowerCase()).includes(q);
      } else {
        // filterMode === 'ingredient'
        return r.ingredients?.some(ing => removeDiacritics(ing.name.toLowerCase()).includes(q));
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

  const newlySelectedRecipes = useMemo(
    () => selectedRecipes.filter(r => !existingDishes.some(d => d.id === r.id)),
    [selectedRecipes, existingDishes]
  );

  const handleNextStep = () => {
    setServingsModalOpen(true);
  };

  const handleFinalConfirm = () => {
    onConfirm(newlySelectedRecipes, peopleCount);
    setServingsModalOpen(false);
    onClose();
  };

  const decreasePeople = () => setPeopleCount(prev => Math.max(1, prev - 1));
  const increasePeople = () => setPeopleCount(prev => prev + 1);

  // Click outside to close
  const sheetRef = useRef<HTMLDivElement>(null);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const count = newlySelectedRecipes.length;

  if (servingsModalOpen) {
    return (
      <div className="mp-overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog">
        <div className="mp-bottom-sheet" ref={sheetRef} style={{ padding: 0 }}>
          <div style={{ width: '100%', paddingTop: 20, paddingBottom: 32, paddingLeft: 20, paddingRight: 20, background: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
            <div onClick={onClose} style={{ width: '100%', justifyContent: 'center', alignItems: 'flex-start', display: 'flex', cursor: 'pointer', paddingBottom: 8 }}>
              <div style={{ width: 40, height: 4, position: 'relative', background: '#E0E0E0', borderRadius: 4 }} />
            </div>
            <div style={{ paddingTop: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <div style={{ width: '100%', height: 24, position: 'relative' }}>
                <div style={{ color: '#1A1A1A', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '24px', wordWrap: 'break-word' }}>Khẩu phần bữa ăn</div>
              </div>
            </div>
            <div style={{ paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <div style={{ width: '100%', position: 'relative' }}>
                <div style={{ color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word' }}>Nhập số người ăn để hệ thống tính nguyên liệu phù hợp.</div>
              </div>
            </div>
            <div style={{ width: '100%', paddingTop: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
              <div style={{ width: '100%', paddingLeft: 8, paddingRight: 8, justifyContent: 'space-between', alignItems: 'center', display: 'flex' }}>
                <button onClick={decreasePeople} disabled={peopleCount <= 1} style={{ width: 44, height: 44, background: 'white', borderRadius: '50%', border: '1.27px solid #E0E0E0', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', padding: 0 }}>
                  <span style={{ color: peopleCount > 1 ? '#1A1A1A' : '#E0E0E0', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>−</span>
                </button>
                <div style={{ flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', gap: 4, display: 'flex' }}>
                  <div style={{ color: '#FF8A00', fontSize: 40, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', lineHeight: '40px' }}>{peopleCount}</div>
                  <div style={{ color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '19.5px' }}>người ăn</div>
                </div>
                <button onClick={increasePeople} style={{ width: 44, height: 44, background: 'white', borderRadius: '50%', border: '1.27px solid #FF8A00', justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer', padding: 0 }}>
                  <span style={{ color: '#FF8A00', fontSize: 22, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>+</span>
                </button>
              </div>
            </div>
            <div style={{ width: '100%', paddingTop: 24, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
              <button onClick={handleFinalConfirm} style={{ width: '100%', height: 48, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700', cursor: 'pointer' }}>
                Xác nhận {peopleCount} người
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mp-overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="mp-bottom-sheet" ref={sheetRef}>

        {/* Drag handle */}
        <div className="mp-sheet-handle-row" aria-hidden="true" onClick={onClose} style={{ cursor: 'pointer' }}>
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
            filtered.map((recipe) => {
              const isAlreadyAdded = existingDishes.some(d => d.id === recipe.id);
              return (
                <RecipeSelectCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={selectedIds.has(recipe.id)}
                  isAlreadyAdded={isAlreadyAdded}
                  onToggle={toggle}
                />
              );
            })
          )}
        </div>

        {/* Confirm button */}
        <div className="mp-confirm-area">
          <button
            id="mp-confirm-add"
            className={`mp-confirm-btn${count > 0 ? ' mp-confirm-btn--active' : ' mp-confirm-btn--disabled'}`}
            onClick={count > 0 ? handleNextStep : undefined}
            disabled={count === 0}
            aria-label={count > 0 ? `Tiếp tục (${count} món)` : 'Chưa chọn món nào'}
          >
            {count > 0
              ? `Tiếp tục (${count} món)`
              : 'Xác nhận thêm 0 món vào bữa'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddDishBottomSheet;
