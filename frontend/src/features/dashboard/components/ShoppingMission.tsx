import React from 'react';
import type { ShoppingItem } from '../../shopping-list/types';

interface ShoppingMissionProps {
  items: ShoppingItem[];
  currentUserId: string;
  onToggleCheck: (id: string) => void;
}

const isItemOverdue = (item: ShoppingItem): boolean => {
  if (item.isBought) return false;
  if (!item.deadlineDate || !item.deadlineTime) return false;
  
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const todayStr = localDate.toISOString().split('T')[0];

  if (item.deadlineDate < todayStr) {
    return true;
  }
  if (item.deadlineDate === todayStr) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [dlHour, dlMin] = item.deadlineTime.split(':').map(Number);
    if (currentHour > dlHour || (currentHour === dlHour && currentMinute >= dlMin)) {
      return true;
    }
  }
  return false;
};

import { getCategoryBgClass } from '../../../utils/categoryHelper';

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
              onClick={() => { if (!item.isBought) onToggleCheck(item.id); }}
              aria-label={item.isBought ? `Đã mua ${item.name}` : `Đánh dấu đã mua ${item.name}`}
              style={item.isBought ? { cursor: 'default' } : undefined}
            >
              {item.isBought && <span className="shopping-mission__check-icon">✓</span>}
            </button>

            {/* Category badge */}
            <div className={`shopping-mission__badge ${getCategoryBgClass(item.category)}`}>
              {item.category}
            </div>

            {/* Item details */}
            <div className={`shopping-mission__name ${item.isBought ? 'shopping-mission__name--checked' : ''}`}>
              {item.category === 'Gia vị' ? (item.unit ? `${item.name} - ${item.unit}` : item.name) : `${item.name} - ${Math.round(item.quantity * 100) / 100} ${item.unit}`}
            </div>
            
            {/* Overdue badge */}
            {isItemOverdue(item) && (
              <div className="shopping-card__tag-overdue" style={{ marginLeft: '8px' }}>Trễ hạn</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShoppingMission;
