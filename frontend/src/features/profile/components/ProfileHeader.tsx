import React from 'react';
import '../profile.css';

interface ProfileHeaderProps {
  avatar: string;
  name: string;
  role: string;
  onAvatarClick: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ avatar, name, role, onAvatarClick }) => {
  return (
    <div className="profile-header">
      <div className="profile-avatar-wrapper">
        <div
          className="profile-avatar-circle"
          onClick={onAvatarClick}
          title="Chọn avatar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onAvatarClick()}
        >
          {avatar}
        </div>
        <button
          className="profile-camera-btn"
          onClick={onAvatarClick}
          aria-label="Thay đổi ảnh đại diện"
          title="Thay đổi ảnh đại diện"
        >
          📷
        </button>
      </div>
      <p className="profile-user-name">{name}</p>
      <p className="profile-user-role">{role}</p>
    </div>
  );
};

export default ProfileHeader;
