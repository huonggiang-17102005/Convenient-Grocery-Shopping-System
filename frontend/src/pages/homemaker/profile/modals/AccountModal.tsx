import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import '../ProfileScreen.css';

interface AccountModalProps {
  isOpen: boolean;
  name: string;
  email: string;
  onUpdateProfile: (name: string, email: string) => void;
  onUpdatePassword: (currentPass: string, newPass: string) => void;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  name,
  email,
  onUpdateProfile,
  onUpdatePassword,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile fields state
  const [inputName, setInputName] = useState(name);
  const [inputEmail, setInputEmail] = useState(email);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim() || !inputEmail.trim()) return;
    onUpdateProfile(inputName, inputEmail);
    onClose();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu xác nhận không trùng khớp!');
      return;
    }
    onUpdatePassword(currentPassword, newPassword);
    onClose();
  };

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal-card">
        <h3 className="profile-modal-title profile-modal-title--default">Quản lý tài khoản</h3>

        {/* Tab switcher */}
        <div className="profile-tab-switcher">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'profile' ? 'profile-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Hồ sơ
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'password' ? 'profile-tab-btn--active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Mật khẩu
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' ? (
          <form onSubmit={handleProfileSubmit}>
            {/* Họ và tên */}
            <div className="profile-form-group">
              <label className="profile-form-label">Họ và tên</label>
              <input
                type="text"
                className="profile-form-input"
                placeholder="Nhập họ và tên"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="profile-form-group">
              <label className="profile-form-label">Email</label>
              <input
                type="email"
                className="profile-form-input"
                placeholder="Nhập email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                required
              />
            </div>

            {/* Form actions */}
            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-form-btn profile-form-btn--primary"
              >
                Cập nhật hồ sơ
              </button>
              <button
                type="button"
                className="profile-form-btn profile-form-btn--secondary"
                onClick={onClose}
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            {/* Mật khẩu hiện tại */}
            <div className="profile-form-group">
              <label className="profile-form-label">Mật khẩu hiện tại</label>
              <div className="profile-input-wrapper">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  className="profile-form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="profile-eye-toggle"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  aria-label="Hiển thị mật khẩu"
                >
                  {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="profile-form-group">
              <label className="profile-form-label">Mật khẩu mới</label>
              <div className="profile-input-wrapper">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  className="profile-form-input"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="profile-eye-toggle"
                  onClick={() => setShowNewPass(!showNewPass)}
                  aria-label="Hiển thị mật khẩu mới"
                >
                  {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div className="profile-form-group">
              <label className="profile-form-label">Xác nhận mật khẩu mới</label>
              <div className="profile-input-wrapper">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  className="profile-form-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="profile-eye-toggle"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  aria-label="Xác nhận mật khẩu mới"
                >
                  {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Form actions */}
            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-form-btn profile-form-btn--primary"
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
                className="profile-form-btn profile-form-btn--secondary"
                onClick={onClose}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountModal;
