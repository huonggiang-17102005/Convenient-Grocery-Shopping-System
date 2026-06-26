// src/features/recipes/components/RecipeCard.tsx

import React from 'react';
import type { Recipe } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onClick,
  onToggleFavorite,
}) => {
  return (
    <div
      className="recipe-card"
      id={`recipe-card-${recipe.id}`}
      onClick={() => onClick(recipe)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(recipe)}
    >
      {/* Image area */}
      <div className="recipe-card-image">
        {recipe.imageUrl ? (
          <ImageWithFallback src={recipe.imageUrl} fallbackType="recipe" alt={recipe.name} className="recipe-card-img-element" />
        ) : (
          <div className="recipe-card-emoji">{recipe.emoji}</div>
        )}

        {/* Priority badge */}
        {recipe.isPriority && (
          <span className="recipe-card-priority-badge">Ưu tiên</span>
        )}

        {/* Favorite button */}
        <button
          id={`recipe-fav-btn-${recipe.id}`}
          type="button"
          className="recipe-card-fav-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          aria-label={recipe.isFavorited ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        >
          {recipe.isFavorited ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info area */}
      <div className="recipe-card-info">
        <h3 className="recipe-card-name">{recipe.name}</h3>

        {(recipe.authorName || recipe.visibility === 'Public' || recipe.visibility === 'Pending' || recipe.authorId === null) && (
          <div className="recipe-card-author" style={{ fontSize: '11.5px', color: '#1A1A1A', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>👤</span>
            <span>
              {recipe.visibility === 'Public'
                ? 'Đã duyệt (Cộng đồng)'
                : recipe.visibility === 'Pending'
                ? 'Đang chờ duyệt'
                : (recipe.authorName || (recipe.authorId === null ? 'Hệ thống' : 'Gia đình'))}
            </span>
          </div>
        )}

        <div className="recipe-card-tags">
          {/* Expiring soon badge */}
          {recipe.expiringCount && recipe.expiringCount > 0 ? (
            <span className="recipe-tag recipe-tag--expiring">
              {recipe.expiringCount} đồ sắp hết hạn
            </span>
          ) : null}

          <div className="recipe-card-tags-row">
            <span className={`recipe-tag ${recipe.cookTimeMinutes <= 30 ? 'recipe-tag--easy' : recipe.cookTimeMinutes <= 60 ? 'recipe-tag--medium' : 'recipe-tag--hard'}`}>
              {recipe.cookTimeMinutes} phút
            </span>
            <span className={`recipe-tag ${recipe.difficulty?.toLowerCase() === 'dễ' ? 'recipe-tag--easy' : recipe.difficulty?.toLowerCase() === 'trung bình' ? 'recipe-tag--medium' : 'recipe-tag--hard'}`}>
              {recipe.difficulty}
            </span>
            {recipe.calories !== undefined && recipe.calories > 0 && (
              <span className="recipe-tag recipe-tag--calories">
                🔥 {recipe.calories} kcal/phần
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
