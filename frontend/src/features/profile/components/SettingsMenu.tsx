import React from 'react';

interface SettingsMenuProps {
  onOpenAccount: () => void;
  onLogout: () => void;
  onLeaveGroup?: () => void;
  role?: 'homemaker' | 'member';
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  onOpenAccount,
  onLogout,
  onLeaveGroup,
  role = 'homemaker',
}) => {
  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Cài đặt</h2>
      <div className="profile-settings-list">

        {/* Account management */}
        <button
          id="profile-account-btn"
          className="profile-settings-item"
          onClick={onOpenAccount}
          style={{ background: 'white' }}
        >
          <p className="profile-settings-item--text">Quản lý tài khoản</p>
        </button>

        {/* Logout */}
        <button
          id="profile-logout-btn"
          className="profile-settings-item"
          onClick={onLogout}
          style={{ background: 'white' }}
        >
          <p className="profile-settings-item--logout">Đăng xuất</p>
          <span className="profile-settings-chevron">›</span>
        </button>

        {/* Leave Group - Member only */}
        {role === 'member' && onLeaveGroup && (
          <button
            id="profile-leave-group-btn"
            className="profile-settings-item"
            onClick={onLeaveGroup}
            style={{ background: 'white' }}
          >
            <p className="profile-settings-item--logout" style={{ color: '#D32F2F' }}>Rời khỏi nhóm</p>
            <span className="profile-settings-chevron" style={{ color: '#D32F2F' }}>›</span>
          </button>
        )}

      </div>
    </div>
  );
};

export default SettingsMenu;
