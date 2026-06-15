import React from 'react';
import type { PlannedMeal } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface SelectedDishCardProps {
  plannedMeal: PlannedMeal;
  showRemove?: boolean;
  onRemove: () => void;
}

const SelectedDishCard: React.FC<SelectedDishCardProps> = ({ plannedMeal, showRemove = true, onRemove }) => {
  const dish = plannedMeal.recipe;
  return (
    <li className={`mp-dish-card${!showRemove ? ' mp-dish-card--readonly' : ''}`}>
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
          <p className="mp-dish-card__time">⏰ {dish.cookTimeMinutes} phút</p>
        </div>
      </div>
      {showRemove && (
        <button
          className="mp-dish-card__remove"
          onClick={onRemove}
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
