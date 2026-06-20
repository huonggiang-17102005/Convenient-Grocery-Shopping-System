// src/features/recipes/components/TabLibrary.tsx

import React from 'react';
import type { Recipe, FilterIngredient } from '../types';
import SearchAndFilter from './SearchAndFilter';
import RecipeCard from './RecipeCard';

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
}) => {
  const activeRecipes = subTab === 'family' ? recipes : systemRecipes;

  // Filter recipes by selected ingredients
  const displayedRecipes =
    selectedIngredients.length === 0
      ? activeRecipes
      : activeRecipes.filter((r) =>
        r.ingredients.some((ing) =>
          selectedIngredients.some((sel) =>
            typeof ing.name === 'string' && typeof sel === 'string' && ing.name.toLowerCase().includes(sel.toLowerCase())
          )
        )
      );

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

      {/* Ingredient filter dropdown */}
      <SearchAndFilter
        selectedIngredients={selectedIngredients}
        availableIngredients={availableIngredients}
        onChangeIngredients={onChangeIngredients}
      />

      {/* Tip hint */}
      <div className="recipe-library-tip" style={{ display: 'block', lineHeight: '28px' }}>
        <span>💡 Công thức</span>
        <span className="recipe-priority-inline-badge" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', margin: '0 6px', transform: 'translateY(-1px)' }}>Ưu tiên</span>
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
