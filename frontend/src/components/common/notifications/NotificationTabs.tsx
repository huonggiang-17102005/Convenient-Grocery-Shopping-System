import React, { useRef } from 'react';
import { useNotifications, type NotificationCategory } from '../../../contexts/NotificationContext';

interface Props {
  activeTab: NotificationCategory;
  onTabChange: (tab: NotificationCategory) => void;
}

const TABS: { id: NotificationCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'family', label: 'Gia đình' },
  { id: 'fridge', label: 'Tủ lạnh' },
  { id: 'expired', label: 'Hết hạn' },
  { id: 'shopping', label: 'Đi chợ' },
  { id: 'recipe', label: 'Công thức' },
  { id: 'meal', label: 'Thực đơn' },
];

export const NotificationTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const { checkCategoryHasUnread } = useNotifications();

  return (
    <div className="notif-tabs" ref={tabsRef}>
      {TABS.map((tab) => {
        const hasUnread = checkCategoryHasUnread(tab.id);
        return (
          <button
            key={tab.id}
            className={`notif-tab ${activeTab === tab.id ? 'active' : ''} ${hasUnread ? 'has-unread' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {hasUnread && <span className="tab-unread-dot"></span>}
          </button>
        );
      })}
    </div>
  );
};
