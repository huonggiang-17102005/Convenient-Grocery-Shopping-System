import React from 'react';
import type { FoodItem } from '../../../../types/homemaker/Fridge';

interface FoodCardProps {
  item: FoodItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
}

const getCategoryBgClass = (category: string) => {
  switch (category) {
    case 'Rau củ': return 'category-bg-rau-cu';
    case 'Thịt cá': return 'category-bg-thit-ca';
    case 'Chất lỏng': return 'category-bg-do-uong';
    default: return 'category-bg-default';
  }
};

const getDaysBgClass = (days: number) => {
  if (days <= 2) return 'days-bg-danger';
  if (days <= 5) return 'days-bg-warning';
  return 'days-bg-good';
};

const FoodCard: React.FC<FoodCardProps> = ({ item, onUpdateQuantity, onSelect, selected }) => {
  return (
    <div className="food-card">
      <input
        type="checkbox"
        className="food-card-checkbox"
        checked={selected}
        onChange={(e) => onSelect(item.id, e.target.checked)}
      />

      <div className={`food-card-category ${getCategoryBgClass(item.category)}`}>
        {item.category}
      </div>

      <div className="food-card-emoji">{item.emoji}</div>
      <div className="food-card-name">{item.name}</div>

      <div className="food-card-quantity-controls">
        <button className="qty-btn minus" onClick={() => onUpdateQuantity(item.id, -1)}>−</button>
        <div className="qty-value">{item.quantity}</div>
        <button className="qty-btn plus" onClick={() => onUpdateQuantity(item.id, 1)}>+</button>
      </div>

      <div className={`food-card-days ${getDaysBgClass(item.daysRemaining)}`}>
        Còn {item.daysRemaining} ngày
      </div>
    </div>
  );
};

export default FoodCard;
