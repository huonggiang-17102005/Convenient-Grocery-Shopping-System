import React from 'react';
import { Check } from 'lucide-react';
import type { Recipe } from '../../types';

interface RecipeSelectCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const RecipeSelectCard: React.FC<RecipeSelectCardProps> = ({
  recipe,
  isSelected,
  onToggle,
}) => {
  return (
    <label className={`mp-select-card${isSelected ? ' mp-select-card--selected' : ''}`}>
      <input
        type="checkbox"
        className="mp-sr-only"
        checked={isSelected}
        onChange={() => onToggle(recipe.id)}
      />
      <div className="mp-select-card__left">
        <div className="mp-select-card__checkbox" aria-hidden="true">
          {isSelected && <Check size={12} color="white" strokeWidth={3.5} />}
        </div>
        <div className="mp-select-card__emoji" aria-hidden="true">
          {recipe.image ? (
            <img src={recipe.image} alt="" className="mp-select-card__img-el" />
          ) : (
            recipe.emoji
          )}
        </div>
        <div className="mp-select-card__info">
          <span className="mp-select-card__name">{recipe.name}</span>
          <div className="mp-select-card__tags">
            <span className="mp-select-card__tag">{recipe.duration}</span>
          </div>
        </div>
      </div>
    </label>
  );
};

export default RecipeSelectCard;
