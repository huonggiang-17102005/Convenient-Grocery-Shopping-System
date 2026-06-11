import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ maxWidth: '344px' }}>
        <div className="delete-confirm-container">
          <h3 className="delete-confirm-title">Xác nhận xóa</h3>
          <p className="delete-confirm-desc">
            Bạn có chắc chắn muốn xóa mặt hàng này khỏi danh sách mua sắm?
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
              className="delete-confirm-btn delete-confirm-btn--delete"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
