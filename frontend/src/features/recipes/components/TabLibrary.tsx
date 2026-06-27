// src/features/recipes/components/TabLibrary.tsx

import React, { useState, useRef, useEffect } from 'react';
import type { Recipe, FilterIngredient } from '../types';
import SearchAndFilter from './SearchAndFilter';
import RecipeCard from './RecipeCard';
import { useFamilyContext } from '../../../contexts/FamilyContext';
import { isIngredientMatch } from '../../../utils/ingredientMatcher';

interface SortRule {
  key: string;
  dir: 'asc' | 'desc';
}

interface TabLibraryProps {
  recipes: Recipe[];
  systemRecipes: Recipe[];
  subTab: 'family' | 'system';
  onChangeSubTab: (subTab: 'family' | 'system') => void;
  selectedIngredients: FilterIngredient[];
  availableIngredients: string[];
  onChangeIngredients: (ingredients: FilterIngredient[]) => void;
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  role: 'homemaker' | 'member';
}

const TabLibrary: React.FC<TabLibraryProps> = ({
  recipes,
  systemRecipes,
  subTab,
  onChangeSubTab,
  selectedIngredients,
  availableIngredients,
  onChangeIngredients,
  onRecipeClick,
  onToggleFavorite,
  role,
}) => {
  const { familyMembers } = useFamilyContext();
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [isAuthorOpen, setIsAuthorOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortQueue, setSortQueue] = useState<SortRule[]>([]);

  const authorRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) {
        setIsAuthorOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset author filter when subTab changes
  useEffect(() => {
    setSelectedAuthors([]);
  }, [subTab]);

  const toggleAuthor = (memberId: string) => {
    if (selectedAuthors.includes(memberId)) {
      setSelectedAuthors(selectedAuthors.filter((id) => id !== memberId));
    } else {
      setSelectedAuthors([...selectedAuthors, memberId]);
    }
  };

  const handleToggleSelect = (key: string) => {
    const existingIndex = sortQueue.findIndex((item) => item.key === key);
    if (existingIndex > -1) {
      setSortQueue(sortQueue.filter((item) => item.key !== key));
    } else {
      setSortQueue([...sortQueue, { key, dir: 'desc' }]);
    }
  };

  const handleToggleDirection = (key: string) => {
    const existingIndex = sortQueue.findIndex((item) => item.key === key);
    if (existingIndex > -1) {
      setSortQueue(
        sortQueue.map((item) =>
          item.key === key
            ? { ...item, dir: item.dir === 'desc' ? 'asc' : 'desc' }
            : item
        )
      );
    } else {
      setSortQueue([...sortQueue, { key, dir: 'desc' }]);
    }
  };

  const authorDisplayText =
    selectedAuthors.length === 0
      ? 'Tác giả'
      : selectedAuthors.length === 1
      ? (familyMembers.find((m) => m.id === selectedAuthors[0])?.name || '1 Tác giả')
      : `Tác giả (${selectedAuthors.length})`;

  const sortOptions = [
    { key: 'createdAt', label: 'Thời gian thêm' },
    { key: 'calories', label: 'Lượng calo' },
    { key: 'difficulty', label: 'Độ khó' },
    { key: 'cooktime', label: 'Thời gian nấu' },
  ];

  const getSortTriggerText = () => {
    if (sortQueue.length === 0) return 'Sắp xếp';
    if (sortQueue.length === 1) {
      const rule = sortQueue[0];
      if (rule.key === 'createdAt') return rule.dir === 'desc' ? 'Mới nhất' : 'Cũ nhất';
      if (rule.key === 'calories') return rule.dir === 'desc' ? 'Calo: Cao' : 'Calo: Thấp';
      if (rule.key === 'difficulty') return rule.dir === 'desc' ? 'Khó -> Dễ' : 'Dễ -> Khó';
      if (rule.key === 'cooktime') return rule.dir === 'desc' ? 'Nấu: Lâu' : 'Nấu: Nhanh';
    }
    return `Sắp xếp (${sortQueue.length})`;
  };

  const sortDisplayText = getSortTriggerText();

  const activeRecipes = subTab === 'family' ? recipes : systemRecipes;

  // 1. Author Filter (only in Family tab)
  const authorFiltered =
    subTab === 'family' && selectedAuthors.length > 0
      ? activeRecipes.filter((r) => r.authorId && selectedAuthors.includes(r.authorId))
      : activeRecipes;

  // 2. Ingredient Filter
  const ingredientFiltered =
    selectedIngredients.length === 0
      ? authorFiltered
      : authorFiltered.filter((r) =>
          r.ingredients.some((ing) =>
            selectedIngredients.some((sel) =>
              isIngredientMatch(ing.name, sel)
            )
          )
        );

  // 3. Sorting logic
  const getDifficultyValue = (diff: string) => {
    if (diff === 'Dễ') return 1;
    if (diff === 'Trung bình') return 2;
    if (diff === 'Khó') return 3;
    return 0;
  };

  const displayedRecipes = [...ingredientFiltered].sort((a, b) => {
    for (const rule of sortQueue) {
      let comparison = 0;
      if (rule.key === 'createdAt') {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        comparison = db - da; // default desc (newest first)
      } else if (rule.key === 'calories') {
        comparison = (b.calories || 0) - (a.calories || 0); // default desc (highest first)
      } else if (rule.key === 'difficulty') {
        comparison = getDifficultyValue(b.difficulty) - getDifficultyValue(a.difficulty); // default desc (hardest first)
      } else if (rule.key === 'cooktime') {
        comparison = b.cookTimeMinutes - a.cookTimeMinutes; // default desc (longest first)
      }

      if (comparison !== 0) {
        return rule.dir === 'desc' ? comparison : -comparison;
      }
    }
    return 0; // Default order
  });

  return (
    <div className="recipe-tab-content">
      {/* Sub-tab Toggle */}
      <div className="recipe-sub-tabs">
        <button
          type="button"
          className={`recipe-sub-tab-btn ${subTab === 'family' ? 'active' : 'inactive'}`}
          onClick={() => onChangeSubTab('family')}
        >
          Gia đình
        </button>
        <button
          type="button"
          className={`recipe-sub-tab-btn ${subTab === 'system' ? 'active' : 'inactive'}`}
          onClick={() => onChangeSubTab('system')}
        >
          Hệ thống
        </button>
      </div>

      {/* Row containing all filters */}
      <div className="recipe-filters-row">
        {/* Ingredient Filter (on left, wider) */}
        <div className="recipe-ingredient-filter-container">
          <SearchAndFilter
            selectedIngredients={selectedIngredients}
            availableIngredients={availableIngredients}
            onChangeIngredients={onChangeIngredients}
          />
        </div>

        {/* Author Filter */}
        {subTab === 'family' && (
          <div className="recipe-custom-dropdown" ref={authorRef}>
            <button
              type="button"
              className={`recipe-dropdown-trigger role-${role} ${isAuthorOpen ? 'open' : ''} ${
                selectedAuthors.length > 0 ? 'active' : ''
              }`}
              onClick={() => setIsAuthorOpen((v) => !v)}
            >
              <span className="recipe-dropdown-label">{authorDisplayText}</span>
              <span
                className="recipe-dropdown-arrow"
                style={{ transform: isAuthorOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                ▼
              </span>
            </button>
            {isAuthorOpen && (
              <div className="recipe-dropdown-panel recipe-dropdown-panel--author">
                <div className="recipe-dropdown-list">
                  {familyMembers.map((member) => {
                    const isChecked = selectedAuthors.includes(member.id);
                    return (
                      <label key={member.id} className="recipe-dropdown-item">
                        <span
                          className={`recipe-dropdown-checkbox role-${role} ${
                            isChecked ? 'checked' : ''
                          }`}
                        >
                          {isChecked && <span className="recipe-dropdown-check">✓</span>}
                        </span>
                        <span className="recipe-dropdown-avatar">{member.avatar || '👤'}</span>
                        <span className="recipe-dropdown-item-label">{member.name}</span>
                        <input
                          type="checkbox"
                          hidden
                          checked={isChecked}
                          onChange={() => toggleAuthor(member.id)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort Filter */}
        <div className="recipe-custom-dropdown" ref={sortRef}>
          <button
            type="button"
            className={`recipe-dropdown-trigger role-${role} ${isSortOpen ? 'open' : ''} ${
              sortQueue.length > 0 ? 'active' : ''
            }`}
            onClick={() => setIsSortOpen((v) => !v)}
          >
            <span className="recipe-dropdown-label">{sortDisplayText}</span>
            <span
              className="recipe-dropdown-arrow"
              style={{ transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▼
            </span>
          </button>
          {isSortOpen && (
            <div className="recipe-dropdown-panel recipe-dropdown-panel--sort">
              <div className="recipe-dropdown-list">
                {/* Reset button */}
                <div
                  className="recipe-dropdown-item recipe-dropdown-item--reset"
                  onClick={() => {
                    setSortQueue([]);
                    setIsSortOpen(false);
                  }}
                  style={{
                    fontWeight: 600,
                    borderBottom: '1px solid #EEEEEE',
                    borderRadius: 0,
                    paddingBottom: '8px',
                    marginBottom: '6px',
                    fontSize: '12px',
                    color: '#D32F2F',
                    cursor: 'pointer',
                  }}
                >
                  Xoá sắp xếp
                </div>

                {sortOptions.map((opt) => {
                  const existingIndex = sortQueue.findIndex((item) => item.key === opt.key);
                  const isActive = existingIndex > -1;
                  const rule = isActive ? sortQueue[existingIndex] : null;
                  const rank = existingIndex + 1;

                  return (
                    <div key={opt.key} className="recipe-dropdown-sort-row">
                      {/* Left click area: select/deselect */}
                      <div
                        className="recipe-dropdown-sort-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(opt.key);
                        }}
                      >
                        {isActive ? (
                          <span className={`recipe-sort-rank-badge role-${role}`}>
                            {rank}
                          </span>
                        ) : (
                          <span className="recipe-sort-rank-empty" />
                        )}
                      </div>

                      {/* Right click area: toggle direction */}
                      <div
                        className="recipe-dropdown-sort-right"
                        onClick={() => {
                          handleToggleDirection(opt.key);
                        }}
                      >
                        <span className="recipe-dropdown-item-label">{opt.label}</span>
                        {isActive && rule && (
                          <span className="recipe-sort-arrow-indicator">
                            {rule.dir === 'desc' ? '▼' : '▲'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tip hint */}
      <div className="recipe-library-tip" style={{ display: 'block', lineHeight: '28px' }}>
        <span>💡 Công thức</span>
        <span
          className="recipe-priority-inline-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            verticalAlign: 'middle',
            margin: '0 6px',
            transform: 'translateY(-1px)',
          }}
        >
          Ưu tiên
        </span>
        <span>giúp tiêu thụ thực phẩm sắp hết hạn trong tủ lạnh.</span>
      </div>

      {/* Recipe grid */}
      {displayedRecipes.length === 0 ? (
        <div className="recipe-empty-state">
          <div className="recipe-empty-icon">🍽️</div>
          <p>Không tìm thấy công thức phù hợp</p>
        </div>
      ) : (
        <div className="recipe-grid">
          {displayedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={onRecipeClick}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TabLibrary;


