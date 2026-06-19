import React from 'react';
import { Check } from 'lucide-react';
import type { Recipe } from '../../types';
import ImageWithFallback from '../../../../components/common/ImageWithFallback';

interface RecipeSelectCardProps {
  recipe: Recipe;
  isSelected: boolean;
  isAlreadyAdded?: boolean;
  onToggle: (id: string) => void;
}

const RecipeSelectCard: React.FC<RecipeSelectCardProps> = ({
  recipe,
  isSelected,
  isAlreadyAdded = false,
  onToggle,
}) => {
  return (
    <label 
      className={`mp-select-card${isSelected ? ' mp-select-card--selected' : ''}`}
      style={isAlreadyAdded ? { opacity: 0.6, cursor: 'default' } : undefined}
    >
      <input
        type="checkbox"
        className="mp-sr-only"
        checked={isSelected}
        disabled={isAlreadyAdded}
        onChange={() => {
          if (!isAlreadyAdded) onToggle(recipe.id);
        }}
      />
      <div className="mp-select-card__left">
        <div className="mp-select-card__checkbox" aria-hidden="true" style={isAlreadyAdded ? { background: '#E0E0E0', borderColor: '#E0E0E0' } : undefined}>
          {isSelected && <Check size={12} color="white" strokeWidth={3.5} />}
        </div>
        <div className="mp-select-card__emoji" aria-hidden="true">
          {recipe.imageUrl ? (
            <ImageWithFallback src={recipe.imageUrl} fallbackType="recipe" alt={recipe.name} style={{width: 32, height: 32, borderRadius: 6, objectFit: 'cover'}} />
          ) : (
            recipe.emoji || '🍽️'
          )}
        </div>
        <div className="mp-select-card__info">
          <span className="mp-select-card__name">{recipe.name}</span>
          <div className="mp-select-card__tags">
            <span className="mp-select-card__tag">⏰ {recipe.cookTimeMinutes} phút</span>
          </div>
        </div>
      </div>
      {isAlreadyAdded && (
        <span style={{ fontSize: '12px', color: '#FF8A00', fontWeight: 600, background: '#FFF3E0', padding: '4px 8px', borderRadius: '8px' }}>
          Đã thêm
        </span>
      )}
    </label>
  );
};

export default RecipeSelectCard;
