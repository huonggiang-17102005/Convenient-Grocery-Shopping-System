import React from 'react';
import '../profile.css';

export type ConfirmVariant = 'transfer' | 'delete' | 'logout' | 'export';

interface ConfirmModalProps {
  isOpen: boolean;
  variant: ConfirmVariant;
  memberName?: string;
  onConfirm: (data?: string) => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  variant,
  memberName = '',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const renderContent = () => {
    switch (variant) {
      case 'transfer':
        return (
          <>
            <h3 className="profile-modal-title profile-modal-title--default">
              Xác nhận nhường quyền
            </h3>
            <p className="profile-modal-body profile-modal-body--dark">
              Bạn có chắc chắn muốn nhường quyền Homemaker cho{' '}
              <strong>{memberName}</strong>? Sau khi nhường quyền, bạn sẽ trở thành thành
              viên thường.
            </p>
            <div className="profile-modal-actions">
              <button
                className="profile-modal-btn profile-modal-btn--cancel"
                onClick={onCancel}
              >
                Hủy
              </button>
              <button
                className="profile-modal-btn profile-modal-btn--confirm-orange"
                onClick={() => onConfirm()}
              >
                Xác nhận
              </button>
            </div>
          </>
        );

      case 'delete':
        return (
          <>
            <h3 className="profile-modal-title profile-modal-title--danger">
              Xóa thành viên
            </h3>
            <p className="profile-modal-body profile-modal-body--dark">
              Bạn có chắc chắn muốn xóa <strong>{memberName}</strong> khỏi gia đình không?
              Thao tác này không thể hoàn tác.
            </p>
            <div className="profile-modal-actions">
              <button
                className="profile-modal-btn profile-modal-btn--cancel"
                onClick={onCancel}
              >
                Hủy
              </button>
              <button
                className="profile-modal-btn profile-modal-btn--confirm-red"
                onClick={() => onConfirm()}
              >
                Xóa
              </button>
            </div>
          </>
        );

      case 'logout':
        return (
          <>
            <h3 className="profile-modal-title profile-modal-title--default">
              Đăng xuất
            </h3>
            <p className="profile-modal-body profile-modal-body--dark">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>{memberName || 'Mỹ Anh'}</strong>?
            </p>
            <div className="profile-modal-actions">
              <button
                className="profile-modal-btn profile-modal-btn--cancel"
                onClick={onCancel}
              >
                Hủy
              </button>
              <button
                className="profile-modal-btn profile-modal-btn--confirm-red"
                onClick={() => onConfirm()}
              >
                Đăng xuất
              </button>
            </div>
          </>
        );

      case 'export':
        return (
          <>
            <h3 className="profile-modal-title profile-modal-title--default">
              Chọn định dạng xuất
            </h3>
            <div className="profile-export-options">
              <button
                className="profile-export-option-btn"
                onClick={() => onConfirm('excel')}
              >
                {/* Excel icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Xuất báo cáo định dạng Excel (.xlsx)</span>
              </button>
              <button
                className="profile-export-option-btn"
                onClick={() => onConfirm('pdf')}
              >
                {/* PDF icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span>Xuất báo cáo định dạng PDF (.pdf)</span>
              </button>
            </div>
            <div className="profile-modal-actions" style={{ marginTop: '12px' }}>
              <button
                className="profile-modal-btn profile-modal-btn--cancel"
                onClick={onCancel}
                style={{ width: '100%' }}
              >
                Hủy
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal-card">{renderContent()}</div>
    </div>
  );
};

export default ConfirmModal;
