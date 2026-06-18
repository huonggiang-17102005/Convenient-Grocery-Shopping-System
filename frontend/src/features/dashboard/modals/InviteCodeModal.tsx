import React from 'react';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  inviteCode?: string;
  onCopied?: () => void;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  isOpen,
  onClose,
  inviteCode = 'FC-9821-AM',
  onCopied,
}) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {});
    onCopied?.();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Mã mời nhóm">
      <div className="modal-card invite-modal">

        {/* Label + Code row */}
        <div className="invite-modal__code-section">
          <p className="invite-modal__label">Mã nhóm của bạn</p>
          <div className="invite-modal__code-row">
            <span className="invite-modal__code">{inviteCode}</span>
            <button
              id="btn-copy-invite"
              className="invite-modal__copy-btn"
              onClick={handleCopy}
              aria-label="Sao chép mã nhóm"
            >
              {/* Copy icon – 2 overlapping squares */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="6.5" y="6.5" width="10" height="10" rx="2" stroke="#FF8A00" strokeWidth="1.67" />
                <rect x="1.5" y="1.5" width="10" height="10" rx="2" stroke="#FF8A00" strokeWidth="1.67" />
              </svg>
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div className="invite-modal__qr-area">
          <div className="invite-modal__qr-box" style={{ background: 'white', padding: '8px', border: '1px solid #E0E0E0', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(inviteCode)}`} 
              alt="QR Code Nhóm" 
              style={{ width: '150px', height: '150px', display: 'block' }} 
            />
          </div>
        </div>

        {/* Close button */}
        <button className="modal-btn modal-btn--gray" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default InviteCodeModal;
