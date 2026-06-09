import React from 'react';
import IngredientCard from './IngredientCard';
import type { IngredientCardProps } from './IngredientCard';

interface ExpiringWarningListProps {
  items: IngredientCardProps[];
  onItemClick?: (item: IngredientCardProps) => void;
}

const ExpiringWarningList: React.FC<ExpiringWarningListProps> = ({ items, onItemClick }) => {
  return (
    <section className="expiring-section">
      <div className="expiring-section__header">
        <h2 className="expiring-section__title">Cảnh báo hết hạn</h2>
        <span className="expiring-section__badge">{items.length}</span>
      </div>

      <div className="expiring-section__list">
        {items.map((item, index) => (
          <IngredientCard
            key={index}
            {...item}
            onClick={() => onItemClick?.(item)}
          />
        ))}
      </div>
    </section>
  );
};

export default ExpiringWarningList;
