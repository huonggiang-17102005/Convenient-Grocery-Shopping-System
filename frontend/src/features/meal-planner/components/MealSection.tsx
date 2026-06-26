import React from 'react';
import type { PlannedMeal } from '../types';
import type { Recipe } from '../../recipes/types';
import SelectedDishCard from './SelectedDishCard';

interface MealSectionProps {
  title: string;
  mealKey: string;
  dishes: PlannedMeal[];
  showAdd?: boolean;
  showRemove?: boolean;
  onAddDish: () => void;
  onRemoveDish: (id: string) => void;
  onClickCard: (recipe: Recipe) => void;
  onChangeServings?: () => void;
}

const MealSection: React.FC<MealSectionProps> = ({
  title,
  mealKey,
  dishes,
  showAdd = true,
  showRemove = true,
  onAddDish,
  onRemoveDish,
  onClickCard,
  onChangeServings,
}) => {
  // Get people_count from first dish in this meal (all items share the same count)
  const peopleCount = dishes.length > 0 ? (dishes[0].people_count ?? 1) : null;

  return (
    <section className="mp-meal-section" aria-label={title}>
      <div className="mp-meal-section__header">
        <h3 className="mp-meal-section__title">{title}</h3>
        {dishes.length > 0 && peopleCount !== null && showRemove && (
          <button
            id={`mp-servings-badge-${mealKey}`}
            className="mp-servings-badge"
            onClick={(e) => { e.stopPropagation(); onChangeServings?.(); }}
            title="Nhấn để thay đổi khẩu phần"
            aria-label={`Khẩu phần bữa ${title}: ${peopleCount} người`}
          >
            <span className="mp-servings-badge__icon">👥</span>
            <span className="mp-servings-badge__count">{peopleCount} người</span>
          </button>
        )}
      </div>

      {dishes.length > 0 ? (
        <ul className="mp-meal-section__dishes">
          {dishes.map((plannedMeal) => (
            <SelectedDishCard
              key={plannedMeal.id}
              plannedMeal={plannedMeal}
              showRemove={showRemove}
              onRemove={() => onRemoveDish(plannedMeal.id)}
              onClickCard={onClickCard}
            />
          ))}
        </ul>
      ) : (
        <p className="mp-meal-section__empty">Chưa lên kế hoạch</p>
      )}

      {showAdd && (
        <button
          id={`mp-add-dish-${mealKey}`}
          className="mp-add-btn"
          onClick={onAddDish}
          aria-label={`Thêm món vào ${title}`}
        >
          + Thêm món
        </button>
      )}
    </section>
  );
};

export default MealSection;
