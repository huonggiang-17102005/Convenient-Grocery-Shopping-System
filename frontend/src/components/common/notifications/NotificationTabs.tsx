import React, { useRef } from 'react';
import type { NotificationCategory } from '../../../contexts/NotificationContext';

interface Props {
  activeTab: NotificationCategory;
  onTabChange: (tab: NotificationCategory) => void;
}

const TABS: { id: NotificationCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'family', label: 'Gia đình' },
  { id: 'fridge', label: 'Tủ lạnh' },
  { id: 'shopping', label: 'Đi chợ' },
  { id: 'recipe', label: 'Công thức' },
  { id: 'meal', label: 'Thực đơn' },
];

export const NotificationTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="notif-tabs" ref={tabsRef}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`notif-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
