import React from 'react';
import type { Recipe } from '../types';
import SelectedDishCard from './SelectedDishCard';

interface MealSectionProps {
  title: string;          // 'Bữa Sáng' | 'Bữa Trưa' | 'Bữa Tối'
  mealKey: string;        // 'breakfast' | 'lunch' | 'dinner'
  dishes: Recipe[];
  onAddDish: () => void;
  onRemoveDish: (id: string) => void;
}

const MealSection: React.FC<MealSectionProps> = ({
  title,
  mealKey,
  dishes,
  onAddDish,
  onRemoveDish,
}) => {
  return (
    <section className="mp-meal-section" aria-label={title}>
      <h3 className="mp-meal-section__title">{title}</h3>

      {dishes.length > 0 && (
        <ul className="mp-meal-section__dishes">
          {dishes.map((dish) => (
            <SelectedDishCard
              key={dish.id}
              dish={dish}
              onRemove={() => onRemoveDish(dish.id)}
            />
          ))}
        </ul>
      )}

      <button
        id={`mp-add-dish-${mealKey}`}
        className="mp-add-dish-btn"
        onClick={onAddDish}
        aria-label={`Thêm món vào ${title}`}
      >
        + Thêm món
      </button>
    </section>
  );
};

export default MealSection;
