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
    <label className="mp-recipe-card">
      <input
        type="checkbox"
        className="mp-recipe-card__input mp-sr-only"
        checked={isSelected}
        onChange={() => onToggle(recipe.id)}
      />
      {/* Image or Emoji thumbnail */}
      <div className="mp-recipe-card__img" aria-hidden="true">
        {recipe.image ? (
          <img src={recipe.image} alt="" className="mp-recipe-card__img-el" />
        ) : (
          recipe.emoji
        )}
      </div>

      {/* Info */}
      <div className="mp-recipe-card__info">
        <span className="mp-recipe-card__name">{recipe.name}</span>
        <span className="mp-recipe-card__duration">{recipe.duration}</span>
      </div>

      {/* Checkbox */}
      <div
        className={`mp-recipe-card__checkbox${isSelected ? ' mp-recipe-card__checkbox--checked' : ''}`}
        aria-hidden="true"
      >
        {isSelected && <Check size={12} color="white" strokeWidth={3.5} />}
      </div>
    </label>
  );
};

export default RecipeSelectCard;
