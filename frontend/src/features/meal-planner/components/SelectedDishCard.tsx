import React from 'react';
import type { PlannedMeal } from '../types';
import type { Recipe } from '../../recipes/types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface SelectedDishCardProps {
  plannedMeal: PlannedMeal;
  showRemove?: boolean;
  onRemove: () => void;
  onClickCard: (recipe: Recipe) => void;
}

const SelectedDishCard: React.FC<SelectedDishCardProps> = ({ plannedMeal, showRemove = true, onRemove, onClickCard }) => {
  const dish = plannedMeal.recipe;
  return (
    <li 
      className={`mp-dish-card${!showRemove ? ' mp-dish-card--readonly' : ''}`}
      onClick={() => onClickCard(dish)}
    >
      <div className="mp-dish-card__left">
        <div className="mp-dish-card__emoji-wrap" aria-hidden="true">
          {dish.imageUrl ? (
            <ImageWithFallback src={dish.imageUrl} fallbackType="recipe" alt={dish.name} className="mp-dish-card__img-el" />
          ) : (
            <span className="mp-dish-card__emoji">{dish.emoji || '🍽️'}</span>
          )}
        </div>
        <div className="mp-dish-card__info">
          <h4 className="mp-dish-card__name">{dish.name}</h4>
          <p className="mp-dish-card__time">⏰ {dish.cookTimeMinutes} phút • {dish.calories || 0} kcal/phần</p>
        </div>
      </div>
      {showRemove && (
        <button
          className="mp-dish-card__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Xóa ${dish.name}`}
          title={`Xóa ${dish.name}`}
        >
          ×
        </button>
      )}
    </li>
  );
};

export default SelectedDishCard;
