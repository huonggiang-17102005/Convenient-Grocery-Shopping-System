import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../common/NotificationBell';
import './MemberLayout.css';

const MemberHeader: React.FC = () => {
  const { user, family } = useAuth();
  
  const userName = user?.full_name || 'Thành viên';
  const groupName = family?.name || 'Gia đình của bạn';
  const avatar = user?.avatar || '👤';

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
        <NotificationBell />
      </div>
    </header>
  );
};

export default MemberHeader;
