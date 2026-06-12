import React, { useState } from 'react';

interface ExpiryDateModalProps {
  isOpen: boolean;
  itemName: string;
  onConfirm: (expirationDate: string) => void;
  onCancel: () => void;
}

// Modal to enter expiration date before adding to fridge
const ExpiryDateModal: React.FC<ExpiryDateModalProps> = ({
  isOpen,
  itemName,
  onConfirm,
  onCancel,
}) => {
  // Mặc định 7 ngày từ hôm nay
  const defaultDate = (() => {
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const offset = d.getTimezoneOffset();
    return new Date(d.getTime() - offset * 60 * 1000).toISOString().split('T')[0];
  })();

  const [expirationDate, setExpirationDate] = useState(defaultDate);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expirationDate) return;
    onConfirm(expirationDate);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="modal-card" style={{ maxWidth: '360px' }}>
        <h2 className="bottom-sheet__title" style={{ paddingBottom: '12px' }}>
          Nhập hạn sử dụng
        </h2>

        <p style={{ fontSize: '14px', color: '#757575', marginBottom: '20px', lineHeight: 1.5 }}>
          <strong style={{ color: '#212121' }}>{itemName}</strong> sẽ được thêm vào tủ lạnh.
          <br />
          Nhập ngày hết hạn từ bao bì sản phẩm:
        </p>

        <form onSubmit={handleConfirm} className="form-modal-container">
          <div className="form-group">
            <label htmlFor="expiry-date-input" className="form-label">
              Ngày hết hạn
            </label>
            <input
              id="expiry-date-input"
              type="date"
              className="form-input"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              required
            />
          </div>

          <div className="bottom-sheet__actions" style={{ paddingTop: '8px', gap: '8px' }}>
            <button type="submit" className="modal-btn modal-btn--primary">
              Thêm vào tủ lạnh
            </button>
            <button
              type="button"
              className="modal-btn modal-btn--outline"
              onClick={onCancel}
            >
              Bỏ qua
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpiryDateModal;
