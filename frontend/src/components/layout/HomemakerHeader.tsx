import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import './HomemakerLayout.css';

const HomemakerHeader: React.FC = () => {
  // TODO: Thay thế bằng dữ liệu thật từ Context/Redux hoặc API sau khi có tính năng đăng nhập
  const [userName, setUserName] = useState('Bạn');
  const [groupName, setGroupName] = useState('Gia đình của bạn');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Fake data thông báo
  const notifications = [
    { id: 1, text: 'Thịt bò sắp hết hạn trong 2 ngày', time: '1 giờ trước' },
    { id: 2, text: 'Đã thêm Sữa tươi vào danh sách mua sắm', time: '3 giờ trước' },
  ];

  return (
    <header className="homemaker-header">
      <div className="header-user-info">
        <div className="user-avatar">
          👤
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

export default HomemakerHeader;
