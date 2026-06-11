import React from 'react';
import type { Recipe } from '../../types';

interface SelectedChipsListProps {
  selectedRecipes: Recipe[];
  onRemove: (id: string) => void;
}

/**
 * Horizontally scrollable list of orange chips for currently-selected recipes.
 * Hidden when selectedRecipes is empty.
 */
const SelectedChipsList: React.FC<SelectedChipsListProps> = ({
  selectedRecipes,
  onRemove,
}) => {
  if (selectedRecipes.length === 0) return null;

  return (
    <div
      className="mp-chips-row"
      role="list"
      aria-label="Các món đã chọn"
    >
      {selectedRecipes.map((recipe) => (
        <div key={recipe.id} className="mp-chip" role="listitem">
          <span className="mp-chip__name">{recipe.name}</span>
          <button
            className="mp-chip__remove"
            onClick={() => onRemove(recipe.id)}
            aria-label={`Bỏ chọn ${recipe.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default SelectedChipsList;
