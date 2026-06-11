import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingsMenuProps {
  expirationDays: number;
  onChangeExpirationDays: (days: number) => void;
  onOpenAccount: () => void;
  onLogout: () => void;
  role?: 'homemaker' | 'member';
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  expirationDays,
  onChangeExpirationDays,
  onOpenAccount,
  onLogout,
  role = 'homemaker',
}) => {
  const navigate = useNavigate();

  const handleDecrease = () => {
    if (expirationDays > 1) onChangeExpirationDays(expirationDays - 1);
  };

  const handleIncrease = () => {
    if (expirationDays < 30) onChangeExpirationDays(expirationDays + 1);
  };

  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Cài đặt</h2>
      <div className="profile-settings-list">

        {/* Weekly menu */}
        <button
          id="profile-meal-planner-btn"
          className="profile-settings-item"
          onClick={() => navigate(`/${role}/meal-planner`)}
          style={{ background: 'white' }}
        >
          <p className="profile-settings-item--text">📅 Thực đơn tuần</p>
        </button>

        {/* Account management */}
        <button
          id="profile-account-btn"
          className="profile-settings-item"
          onClick={onOpenAccount}
          style={{ background: 'white' }}
        >
          <p className="profile-settings-item--text">Quản lý tài khoản</p>
        </button>

        {/* Expiration warning stepper */}
        <div className="profile-settings-item" style={{ background: 'white', cursor: 'default' }}>
          <p className="profile-settings-label">Cảnh báo hết hạn trước</p>
          <div className="profile-stepper">
            <button
              id="profile-stepper-minus-btn"
              className="profile-stepper-btn profile-stepper-btn--minus"
              onClick={handleDecrease}
              aria-label="Giảm số ngày"
            >
              −
            </button>
            <span className="profile-stepper-value">{expirationDays} ngày</span>
            <button
              id="profile-stepper-plus-btn"
              className="profile-stepper-btn profile-stepper-btn--plus"
              onClick={handleIncrease}
              aria-label="Tăng số ngày"
            >
              +
            </button>
          </div>
        </div>

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

      </div>
    </div>
  );
};

export default SettingsMenu;
