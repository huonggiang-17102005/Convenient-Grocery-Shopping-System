// src/features/recipes/modals/ConfirmDeleteModal.tsx

import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  recipeName?: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  recipeName,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" id="confirm-delete-modal" onClick={onClose}>
      <div
        className="modal-sheet modal-sheet--compact"
        style={{ position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="delete-modal-close-btn"
          type="button"
          className="recipe-detail-close-btn"
          style={{ position: 'absolute', top: 12, right: 12 }}
          onClick={onClose}
          aria-label="Đóng"
        >
          ✕
        </button>
        <div className="delete-modal-icon">🗑️</div>
        <h3 className="delete-modal-title">Xóa công thức?</h3>
        <p className="delete-modal-body">
          Bạn có chắc chắn muốn xóa{' '}
          <strong>"{recipeName}"</strong>? Hành động này không thể hoàn tác.
        </p>

        <div className="delete-modal-actions">
          <button
            id="delete-modal-cancel-btn"
            type="button"
            className="recipe-detail-outline-btn"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            id="delete-modal-confirm-btn"
            type="button"
            className="delete-modal-confirm-btn"
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
