import React from 'react';
import type { ShoppingItem } from '../types';

interface ShoppingCardProps {
  item: ShoppingItem;
  memberMap: Record<string, string>; // userId -> full_name
  onToggleCheck: (id: string, e: React.MouseEvent) => void;
  onClickCard: (item: ShoppingItem) => void;
}

const getCategoryClass = (category: string): string => {
  switch (category) {
    case 'Rau củ': return 'shopping-card__badge--rau-cu';
    case 'Thịt cá': return 'shopping-card__badge--thit-ca';
    case 'Đồ uống': return 'shopping-card__badge--do-uong';
    case 'Gia vị': return 'shopping-card__badge--gia-vi';
    case 'Đồ khô': return 'shopping-card__badge--do-kho';
    default: return 'shopping-card__badge--default';
  }
};

const isItemOverdue = (item: ShoppingItem): boolean => {
  if (item.is_bought) return false;
  if (!item.deadline_date) return false;

  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const todayStr = localDate.toISOString().split('T')[0];

  if (item.deadline_date < todayStr) return true;

  if (item.deadline_date === todayStr && item.deadline_time) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [dlHour, dlMin] = item.deadline_time.split(':').map(Number);
    if (currentHour > dlHour || (currentHour === dlHour && currentMinute >= dlMin)) {
      return true;
    }
  }
  return false;
};

const ShoppingCard: React.FC<ShoppingCardProps> = ({ item, memberMap, onToggleCheck, onClickCard }) => {
  const overdue = isItemOverdue(item);
  const checked = item.is_bought;

  // Lấy tên thật của assignee từ memberMap
  const assigneeName = item.assignee_id
    ? (memberMap[item.assignee_id] ?? 'Thành viên')
    : null;

  return (
    <div
      className={`shopping-card ${checked ? 'shopping-card--checked' : ''}`}
      onClick={() => onClickCard(item)}
    >
      {/* Checkbox */}
      <div
        className={`shopping-card__checkbox ${
          checked ? 'shopping-card__checkbox--checked' : 'shopping-card__checkbox--unchecked'
        }`}
        onClick={(e) => onToggleCheck(item.id, e)}
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
          {item.name} — {item.quantity} {item.unit}
        </span>
        {item.deadline_date && (
          <span className="shopping-card__deadline">
            Hạn: {item.deadline_date}{item.deadline_time ? ` ${item.deadline_time}` : ''}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="shopping-card__tags">
        {overdue && (
          <div className="shopping-card__tag-overdue">Trễ hạn</div>
        )}
        {assigneeName && (
          <div className="shopping-card__tag-assignee">Chờ {assigneeName} mua</div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCard;
