// src/features/recipes/components/TabLibrary.tsx

import React from 'react';
import type { Recipe, FilterIngredient } from '../types';
import SearchAndFilter from './SearchAndFilter';
import RecipeCard from './RecipeCard';

interface TabLibraryProps {
  recipes: Recipe[];
  selectedIngredients: FilterIngredient[];
  availableIngredients: string[];
  onChangeIngredients: (ingredients: FilterIngredient[]) => void;
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

const TabLibrary: React.FC<TabLibraryProps> = ({
  recipes,
  selectedIngredients,
  availableIngredients,
  onChangeIngredients,
  onRecipeClick,
  onToggleFavorite,
}) => {
  // Filter recipes by selected ingredients
  const displayedRecipes =
    selectedIngredients.length === 0
      ? recipes
      : recipes.filter((r) =>
        r.ingredients.some((ing) =>
          selectedIngredients.some((sel) =>
            typeof ing.name === 'string' && typeof sel === 'string' && ing.name.toLowerCase().includes(sel.toLowerCase())
          )
        )
      );

  return (
    <div className="recipe-tab-content">
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
