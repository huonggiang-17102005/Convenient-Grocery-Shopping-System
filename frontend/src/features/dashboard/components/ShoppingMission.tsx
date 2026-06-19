import React from 'react';
import type { ShoppingItem } from '../../shopping-list/types';

interface ShoppingMissionProps {
  items: ShoppingItem[];
  currentUserId: string;
  onToggleCheck: (id: string) => void;
}

export const ShoppingMission: React.FC<ShoppingMissionProps> = ({ items, currentUserId, onToggleCheck }) => {
  const myItems = items.filter(item => item.assigneeId === currentUserId);

  if (myItems.length === 0) {
    return (
      <section className="shopping-mission">
        <h2 className="shopping-mission__title">Nhiệm vụ mua sắm của bạn</h2>
        <div className="shopping-mission__empty">
          🎉 Bạn không có nhiệm vụ mua sắm nào được giao!
        </div>
      </section>
    );
  }

  return (
    <section className="shopping-mission">
      <h2 className="shopping-mission__title">Nhiệm vụ mua sắm của bạn</h2>
      <div className="shopping-mission__list">
        {myItems.map(item => (
          <div key={item.id} className="shopping-mission__item-row">
            {/* Checkbox */}
            <button
              type="button"
              className={`shopping-mission__checkbox ${item.isBought ? 'shopping-mission__checkbox--checked' : ''}`}
              onClick={() => onToggleCheck(item.id)}
              aria-label={item.isBought ? `Đánh dấu chưa mua ${item.name}` : `Đánh dấu đã mua ${item.name}`}
            >
              {item.isBought && <span className="shopping-mission__check-icon">✓</span>}
            </button>

            {/* Category badge */}
            <div className="shopping-mission__badge">
              {item.category}
            </div>

            {/* Item details */}
            <div className={`shopping-mission__name ${item.isBought ? 'shopping-mission__name--checked' : ''}`}>
              {item.name} - {item.quantity} {item.unit}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShoppingMission;
