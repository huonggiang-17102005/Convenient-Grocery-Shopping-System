import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './MemberLayout.css';

const MemberHeader: React.FC = () => {
  const { user, family } = useAuth();
  
  const userName = user?.full_name || 'Thành viên';
  const groupName = family?.name || 'Gia đình của bạn';
  const avatar = user?.avatar || '👤';
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const notifications = [
    { id: 1, text: 'Homemaker đã cập nhật danh sách mua sắm', time: '2 giờ trước' },
    { id: 2, text: 'Hết sữa tươi, vui lòng mua thêm', time: '5 giờ trước' },
  ];

  return (
    <header className="member-header">
      <div className="header-user-info">
        <div className="user-avatar">
          {avatar}
        </div>
        <div className="user-details">
          <h2 className="user-greeting">Chào {userName} 👋</h2>
          <p className="user-group">Nhóm: {groupName}</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="bell-container" onClick={() => setIsNotifOpen(!isNotifOpen)}>
          <Bell size={24} />
          <span className="notification-badge"></span>
        </div>

        {isNotifOpen && (
          <div className="notification-dropdown">
            <h3 className="notif-title">Thông báo</h3>
            <div className="notif-list">
              {notifications.map(notif => (
                <div key={notif.id} className="notif-item">
                  <p className="notif-text">{notif.text}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default MemberHeader;
