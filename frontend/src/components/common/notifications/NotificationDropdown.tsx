import React from 'react';
import { useNotifications, type NotificationCategory } from '../../../contexts/NotificationContext';
import { NotificationTabs } from './NotificationTabs';
import { NotificationList } from './NotificationList';

interface Props {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<Props> = ({ onClose }) => {
  const { unreadCount, markAllAsRead, activeCategory, setActiveCategory } = useNotifications();

  return (
    <div className="notification-dropdown">
      <div className="notif-header">
        <h3 className="notif-title">Thông báo</h3>
        {unreadCount > 0 && (
          <button className="notif-mark-all" onClick={markAllAsRead}>
            Đánh dấu đã đọc
          </button>
        )}
      </div>
      
      <NotificationTabs 
        activeTab={activeCategory} 
        onTabChange={(tab) => setActiveCategory(tab as NotificationCategory)} 
      />
      
      <NotificationList category={activeCategory} onClose={onClose} />
    </div>
  );
};
