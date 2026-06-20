import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.',
  confirmText = 'Xóa',
  cancelText = 'Hủy'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={onClose}>
      <div 
        style={{ 
          background: 'white', 
          borderRadius: 16, 
          padding: 24, 
          width: '90%', 
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 48, height: 48, background: '#FFEBEE', borderRadius: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <AlertTriangle color="#D32F2F" size={24} />
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#1A1A1A', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '700' }}>
            {title}
          </h3>
          <p style={{ margin: '8px 0 0 0', color: '#757575', fontSize: 14, fontFamily: 'Plus Jakarta Sans', lineHeight: '20px' }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', width: '100%', gap: 12, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 44, borderRadius: 100, border: '1px solid #E0E0E0', background: 'white', color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', cursor: 'pointer' }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ flex: 1, height: 44, borderRadius: 100, border: 'none', background: '#D32F2F', color: 'white', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', cursor: 'pointer' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
