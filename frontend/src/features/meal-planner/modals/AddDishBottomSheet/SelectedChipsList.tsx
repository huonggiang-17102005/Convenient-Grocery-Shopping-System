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
    <div className="mp-chips-container">
      <div
        className="mp-chips-scroll"
        role="list"
        aria-label="Các món đã chọn"
      >
        {selectedRecipes.map((recipe) => (
          <div key={recipe.id} className="mp-selected-chip" role="listitem">
            <span className="mp-selected-chip__name">{recipe.name}</span>
            <button
              className="mp-selected-chip__remove"
              onClick={() => onRemove(recipe.id)}
              aria-label={`Bỏ chọn ${recipe.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedChipsList;
