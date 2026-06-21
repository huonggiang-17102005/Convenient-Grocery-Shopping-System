import React from 'react';

interface ConsumeConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  role?: 'homemaker' | 'member';
  onClose: () => void;
  onConfirm: () => void;
}

const ConsumeConfirmModal: React.FC<ConsumeConfirmModalProps> = ({ isOpen, itemName, role = 'homemaker', onClose, onConfirm }) => {
  if (!isOpen) return null;

  const primaryColor = role === 'member' ? '#1E88E5' : '#E65100';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: '344px' }}>
        <div className="delete-confirm-container">
          <h3 className="delete-confirm-title" style={{ color: primaryColor }}>Báo hết gia vị</h3>
          <p className="delete-confirm-desc">
            Bạn có chắc chắn đã dùng hết <strong>{itemName}</strong> không? Hành động này sẽ xóa thẻ gia vị khỏi tủ lạnh và ghi lại lịch sử tiêu thụ.
          </p>
          <div className="delete-confirm-actions">
            <button
              type="button"
              className="delete-confirm-btn delete-confirm-btn--cancel"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              className="delete-confirm-btn"
              style={{ background: primaryColor, color: 'white' }}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Đã hết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumeConfirmModal;
