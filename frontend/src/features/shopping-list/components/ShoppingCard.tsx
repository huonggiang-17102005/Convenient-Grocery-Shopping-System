import React from 'react';
import type { ShoppingItem } from '../types';

interface ShoppingCardProps {
  item: ShoppingItem;
  onToggleCheck: (id: string, e: React.MouseEvent) => void;
  onClickCard: (item: ShoppingItem) => void;
  disabledCheck?: boolean;
}

const getCategoryClass = (category: string): string => {
  switch (category) {
    case 'Rau củ quả': return 'shopping-card__badge--rau-cu';
    case 'Thịt cá': return 'shopping-card__badge--thit-ca';
    case 'Chất lỏng': return 'shopping-card__badge--do-uong';
    case 'Gia vị': return 'shopping-card__badge--gia-vi';
    case 'Đồ khô': return 'shopping-card__badge--do-kho';
    case 'Trứng': return 'shopping-card__badge--trung';
    case 'Khác': return 'shopping-card__badge--khac';
    default: return 'shopping-card__badge--default';
  }
};

const isItemOverdue = (item: ShoppingItem): boolean => {
  if (item.isBought) return false;
  const now = new Date();
  // Get date in YYYY-MM-DD in local time
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

const ShoppingCard: React.FC<ShoppingCardProps> = ({ item, onToggleCheck, onClickCard, disabledCheck = false }) => {
  const overdue = isItemOverdue(item);
  const checked = item.isBought;

  return (
    <div
      className={`shopping-card ${checked ? 'shopping-card--checked' : ''}`}
      onClick={() => onClickCard(item)}
      style={disabledCheck ? { opacity: 0.6, pointerEvents: 'none' } : {}}
    >
      {/* Checkbox */}
      <div
        className={`shopping-card__checkbox ${
          checked ? 'shopping-card__checkbox--checked' : 'shopping-card__checkbox--unchecked'
        }`}
        onClick={(e) => {
          onToggleCheck(item.id, e);
        }}
        title={checked ? 'Đánh dấu chưa mua' : 'Đánh dấu đã mua'}
      >
        {checked && '✓'}
      </div>

      {/* Category Badge */}
      <div className={`shopping-card__badge ${getCategoryClass(item.category)}`}>
        {item.category}
      </div>

      {/* Item Info */}
      <div className="shopping-card__info">
        <span className={`shopping-card__name ${checked ? 'shopping-card__name--checked' : ''}`}>
          {item.category === 'Gia vị' ? item.name : `${item.name} - ${item.quantity} ${item.unit}`}
        </span>
      </div>

      {/* Tags */}
      <div className="shopping-card__tags">
        {overdue && (
          <div className="shopping-card__tag-overdue">Trễ hạn</div>
        )}
        {item.assigneeId && (
          <div className="shopping-card__tag-assignee">Chờ {item.assigneeId} mua</div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCard;
