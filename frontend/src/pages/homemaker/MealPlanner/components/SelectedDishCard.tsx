import React from 'react';
import type { Recipe } from '../types';

interface SelectedDishCardProps {
  dish: Recipe;
  onRemove: () => void;
}

const SelectedDishCard: React.FC<SelectedDishCardProps> = ({ dish, onRemove }) => {
  return (
    <li className="mp-dish-card">
      <div className="mp-dish-card__left">
        <div className="mp-dish-card__emoji-wrap" aria-hidden="true">
          {dish.image ? (
            <img src={dish.image} alt="" className="mp-dish-card__img-el" />
          ) : (
            dish.emoji
          )}
        </div>
        <span className="mp-dish-card__name">{dish.name}</span>
      </div>
      <button
        className="mp-dish-card__remove"
        onClick={onRemove}
        aria-label={`Xóa ${dish.name}`}
        title={`Xóa ${dish.name}`}
      >
        ×
      </button>
    </li>
  );
};

export default SelectedDishCard;
