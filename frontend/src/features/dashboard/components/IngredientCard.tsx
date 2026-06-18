import React from 'react';
import '../dashboard.css';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

export type ExpiryStatus = 'critical' | 'warning' | 'ok';

export interface IngredientCardProps {
  emoji: string;
  image?: string;
  name: string;
  category: string;
  categoryColor: string;
  categoryTextColor: string;
  daysLeft: number;
  onClick?: () => void;
}

function getExpiryStatus(daysLeft: number): ExpiryStatus {
  if (daysLeft <= 1) return 'critical';
  if (daysLeft <= 3) return 'warning';
  return 'ok';
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  emoji,
  image,
  name,
  category,
  categoryColor,
  categoryTextColor,
  daysLeft,
  onClick,
}) => {
  const status = getExpiryStatus(daysLeft);

  return (
    <div className="ingredient-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="ingredient-card__header">
        <span
          className="ingredient-card__category-badge"
          style={{ background: categoryColor, color: categoryTextColor }}
        >
          {category}
        </span>
        {image ? (
          <ImageWithFallback src={image} fallbackType="food" alt={name} className="ingredient-card__img" />
        ) : (
          <span className="ingredient-card__emoji">{emoji}</span>
        )}
      </div>

      <p className="ingredient-card__name">{name}</p>

      <div className={`ingredient-card__expiry ingredient-card__expiry--${status}`}>
        Còn {daysLeft} ngày
      </div>
    </div>
  );
};

export default IngredientCard;
