import React from 'react';
import type { FoodItem } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface FoodCardProps {
  item: FoodItem;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSelect: (id: string, selected: boolean) => void;
  selected: boolean;
  role: 'homemaker' | 'member';
  onCardClick: (item: FoodItem) => void;
  onConsumeSpice?: (id: string) => void;
}

import { getCategoryBgClass } from '../../../utils/categoryHelper';

const getDaysBgClass = (days: number) => {
  if (days <= 1) return 'days-bg-danger';
  if (days <= 3) return 'days-bg-warning';
  return 'days-bg-good';
};

const FoodCard: React.FC<FoodCardProps> = ({ item, onUpdateQuantity, onSelect, selected, role, onCardClick, onConsumeSpice }) => {
  const isGiaVi = item.category === 'Gia vị';

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering when clicking checkbox or stepper
    if ((e.target as HTMLElement).closest('.food-card-checkbox') || 
        (e.target as HTMLElement).closest('.food-card-quantity-controls')) {
      return;
    }
    onCardClick(item);
  };

  return (
    <div className={`food-card ${selected ? 'selected' : ''}`} onClick={handleCardClick}>
      <input 
        type="checkbox" 
        className="food-card-checkbox" 
        checked={selected}
        onChange={(e) => onSelect(item.id, e.target.checked)}
        title={`Chọn ${item.name}`}
        onClick={(e) => e.stopPropagation()}
      />
      
      <div className={`food-card-category ${getCategoryBgClass(item.category)}`}>
        {item.category}
      </div>
      
      {item.image ? (
        <ImageWithFallback src={item.image} fallbackType="food" alt={item.name} className="food-card-img" />
      ) : (
        <div className="food-card-emoji">{item.emoji}</div>
      )}
      
      <div className="food-card-name-wrapper">
        <div className="food-card-name">{item.name}</div>
      </div>
      
      {!isGiaVi ? (
        <div className="food-card-quantity-controls" onClick={(e) => e.stopPropagation()}>
          <button 
            className="qty-btn minus" 
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={role === 'member'} // Members may not be able to modify depending on strictness, but we disable for safety or keep enabled if they consume it. Let's let members change qty, but Figma shows stepper. Let's leave it enabled for both, or disabled for members. The instruction says: "role member: chỉ xem chi tiết không chỉnh sửa", so we disable stepper for member.
            style={{ opacity: role === 'member' ? 0.5 : 1, cursor: role === 'member' ? 'default' : 'pointer' }}
          >−</button>
          <div className="qty-value">
            {Math.round(item.quantity * 100) / 100} {item.unit && <span style={{fontSize: '12px'}}>{item.unit}</span>}
          </div>
          <button 
            className="qty-btn plus" 
            onClick={() => onUpdateQuantity(item.id, 1)}
            disabled={role === 'member'}
            style={{ opacity: role === 'member' ? 0.5 : 1, cursor: role === 'member' ? 'default' : 'pointer' }}
          >+</button>
        </div>
      ) : (
        <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onConsumeSpice?.(item.id)}
            disabled={role === 'member'}
            style={{
              flex: 1, height: 32, borderRadius: 8, outline: '0.80px #E0E0E0 solid', outlineOffset: '-0.80px', 
              background: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', 
              cursor: role === 'member' ? 'default' : 'pointer', opacity: role === 'member' ? 0.5 : 1
            }}
          >
            <span style={{ color: '#E65100', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '18px' }}>
              Báo hết
            </span>
          </button>
        </div>
      )}
      
      <div className={`food-card-days ${getDaysBgClass(item.daysRemaining)}`}>
        Còn {item.daysRemaining} ngày
      </div>
    </div>
  );
};

export default FoodCard;

