// src/features/recipes/components/TabFavorites.tsx

import React from 'react';
import type { Recipe } from '../types';
import RecipeCard from './RecipeCard';

interface TabFavoritesProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

const TabFavorites: React.FC<TabFavoritesProps> = ({
  recipes,
  onRecipeClick,
  onToggleFavorite,
}) => {
  const favorited = recipes.filter((r) => r.isFavorited);

  if (favorited.length === 0) {
    return (
      <div className="recipe-tab-content">
        <div className="recipe-empty-state">
          <div className="recipe-empty-icon">🤍</div>
          <p>Chưa có công thức yêu thích nào</p>
          <p className="recipe-empty-sub">Nhấn ❤️ trên thẻ món ăn để thêm vào đây</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-tab-content">
      <div className="recipe-grid">
        {favorited.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={onRecipeClick}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default TabFavorites;
