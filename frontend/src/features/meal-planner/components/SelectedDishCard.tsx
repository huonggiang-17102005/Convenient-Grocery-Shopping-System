import React from 'react';
import type { PlannedMeal } from '../types';
import type { Recipe } from '../../recipes/types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface SelectedDishCardProps {
  plannedMeal: PlannedMeal;
  showRemove?: boolean;
  onRemove: () => void;
  onClickCard: (pm: PlannedMeal) => void;
}

const SelectedDishCard: React.FC<SelectedDishCardProps> = ({ plannedMeal, showRemove = true, onRemove, onClickCard }) => {
  const dish = plannedMeal.recipe;
  return (
    <li 
      className={`mp-dish-card${(!showRemove || plannedMeal.isCooked) ? ' mp-dish-card--readonly' : ''}`}
      onClick={() => onClickCard(plannedMeal)}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {plannedMeal.isShopped && (
          <span className="mp-dish-card__shopped-label" style={{
            fontSize: '11px',
            color: '#FF8A00',
            fontWeight: '600',
            background: '#FFF3E0',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'Plus Jakarta Sans',
            whiteSpace: 'nowrap'
          }}>
            Đã gom
          </span>
        )}
        {plannedMeal.isCooked ? (
          <span className="mp-dish-card__cooked-label" style={{
            fontSize: '11px',
            color: '#4CAF50',
            fontWeight: '600',
            background: '#E8F5E9',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'Plus Jakarta Sans',
            whiteSpace: 'nowrap'
          }}>
            Đã nấu
          </span>
        ) : (
          showRemove && (
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
          )
        )}
      </div>
    </li>
  );
};

export default SelectedDishCard;
