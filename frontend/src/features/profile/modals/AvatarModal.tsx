import React from 'react';
import '../profile.css';

interface AvatarModalProps {
  isOpen: boolean;
  currentAvatar: string;
  onSelectAvatar: (avatar: string) => void;
  onClose: () => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  currentAvatar,
  onSelectAvatar,
  onClose,
}) => {
  if (!isOpen) return null;

  const avatars = ['👤', '👨', '👩', '🧑', '👴', '👵', '🙂', '😊'];

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal-card">
        <h3 className="profile-modal-title profile-modal-title--default">Chọn avatar</h3>
        
        <div className="profile-avatar-grid">
          {avatars.map((emoji) => {
            const isSelected = emoji === currentAvatar;
            return (
              <button
                key={emoji}
                className={`profile-avatar-option ${
                  isSelected ? 'profile-avatar-option--selected' : ''
                }`}
                onClick={() => {
                  onSelectAvatar(emoji);
                  onClose();
                }}
                aria-label={`Chọn avatar ${emoji}`}
              >
                {emoji}
              </button>
            );
          })}
        </div>

        <div className="profile-modal-actions">
          <button className="profile-modal-btn profile-modal-btn--close" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
