import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { FoodItem } from '../types';

interface QuantityConfirmModalProps {
  isOpen: boolean;
  mode: 'add' | 'subtract';
  item: FoodItem | null;
  totalOtherLotsQuantity: number;
  onClose: () => void;
  onConfirm: (delta: number) => void;
  onDifferentExpiry?: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Không có hạn';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const QuantityConfirmModal: React.FC<QuantityConfirmModalProps> = ({
  isOpen,
  mode,
  item,
  totalOtherLotsQuantity,
  onClose,
  onConfirm,
  onDifferentExpiry
}) => {
  const [delta, setDelta] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setDelta(1);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const unit = item.unit || 'đơn vị';
  const expiryText = formatDate(item.expiryDate);

  const handleConfirm = () => {
    onConfirm(mode === 'add' ? delta : -delta);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose} role="dialog" aria-modal="true">
      <div 
        style={{ width: '90%', maxWidth: 360, padding: 24, background: 'white', borderRadius: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '28px' }}>
              {mode === 'add' ? 'Thêm số lượng' : 'Sử dụng thực phẩm'}
            </div>
          </div>
        </div>

        <div style={{ alignSelf: 'stretch', paddingTop: 16, paddingBottom: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 16, display: 'flex' }}>
          
          {mode === 'add' ? (
            <div style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '20px' }}>
              Thực phẩm <strong>{item.name}</strong> bạn sắp thêm vào có cùng hạn sử dụng (<strong>{expiryText}</strong>) với số lượng trên thẻ này không?
            </div>
          ) : (
            <div style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '20px' }}>
              Bạn muốn lấy bao nhiêu <strong>{item.name}</strong> để sử dụng?
            </div>
          )}

          <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <button 
              onClick={() => setDelta(Math.max(1, delta - 1))}
              style={{ width: 48, height: 48, background: '#F5F5F5', borderRadius: 12, border: 'none', fontSize: 24, color: '#1A1A1A', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              −
            </button>
            <div style={{ width: 100, height: 48, background: 'white', borderRadius: 12, border: '1.27px solid #E0E0E0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}>
              {delta} <span style={{ fontSize: 14, fontWeight: '400', marginLeft: 4, color: '#757575' }}>{unit}</span>
            </div>
            <button 
              onClick={() => {
                if (mode === 'subtract') {
                  setDelta(Math.min(item.quantity, delta + 1));
                } else {
                  setDelta(delta + 1);
                }
              }}
              style={{ width: 48, height: 48, background: '#FF8A00', borderRadius: 12, border: 'none', fontSize: 24, color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              +
            </button>
          </div>

          <div style={{ alignSelf: 'stretch', padding: 12, background: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mode === 'add' ? (
              <div style={{ color: '#4B5563', fontSize: 13, fontFamily: 'Plus Jakarta Sans', lineHeight: '18px' }}>
                💡 Nếu thêm vào <strong>{delta} {unit}</strong>, lô {item.name} hạn {expiryText} sẽ có tổng cộng là <strong style={{color: '#FF8A00'}}>{item.quantity + delta} {unit}</strong>.
              </div>
            ) : (
              <>
                <div style={{ color: '#4B5563', fontSize: 13, fontFamily: 'Plus Jakarta Sans', lineHeight: '18px' }}>
                  📌 Sử dụng từ lô <strong>{item.name}</strong> hạn {expiryText}. Lô này sẽ còn lại <strong style={{color: '#FF8A00'}}>{item.quantity - delta} {unit}</strong>.
                </div>
              </>
            )}
          </div>

        </div>

        <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex' }}>
          {mode === 'add' ? (
            <>
              <button 
                onClick={handleConfirm}
                style={{ alignSelf: 'stretch', height: 48, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
              >
                Cùng hạn (Cộng dồn)
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onDifferentExpiry?.();
                }}
                style={{ alignSelf: 'stretch', height: 48, background: 'white', borderRadius: 100, border: '1.27px solid #FF8A00', color: '#FF8A00', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
              >
                Khác hạn (Tạo thẻ mới)
              </button>
              <button 
                onClick={onClose}
                style={{ alignSelf: 'stretch', height: 48, background: 'white', borderRadius: 100, border: '1.27px solid #E0E0E0', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
              >
                Hủy
              </button>              
            </>
          ) : (
            <>
              <button 
                onClick={handleConfirm}
                style={{ alignSelf: 'stretch', height: 48, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
              >
                {delta === item.quantity ? 'Dùng hết & Xóa thẻ' : 'Xác nhận dùng'}
              </button>
              <button 
                onClick={onClose}
                style={{ alignSelf: 'stretch', height: 48, background: 'white', borderRadius: 100, border: '1.27px solid #E0E0E0', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
              >
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantityConfirmModal;
