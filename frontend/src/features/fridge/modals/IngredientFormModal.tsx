import React, { useState, useEffect, useRef } from 'react';
import { Trash2, ChevronDown, Camera, Image as ImageIcon } from 'lucide-react';
import type { FoodItem, FoodCategory, StorageType } from '../types';
import UnitDropdown from '../components/UnitDropdown';
import type { UnitType } from '../components/UnitDropdown';
import './IngredientFormModal.css';

interface IngredientFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'detail';
  item: FoodItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<FoodItem, 'id'>) => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES: FoodCategory[] = ['Thịt cá', 'Rau củ quả', 'Trứng', 'Chất lỏng', 'Đồ khô', 'Gia vị', 'Khác'];
const STORAGES: StorageType[] = ['Ngăn mát', 'Ngăn đông', 'Khô'];

const EMOJI_MAP: Record<FoodCategory, string> = {
  'Thịt cá': '🥩',
  'Rau củ quả': '🥕',
  'Trứng': '🥚',
  'Chất lỏng': '🥛',
  'Đồ khô': '🌾',
  'Gia vị': '🧂',
  'Khác': '📦',
  'Tất cả': '🛒',
};

const IngredientFormModal: React.FC<IngredientFormModalProps> = ({ isOpen, mode, item, onClose, onSave, onDelete }) => {
  const isReadOnly = mode === 'detail';
  
  const [storageType, setStorageType] = useState<StorageType>('Ngăn mát');
  const [category, setCategory] = useState<FoodCategory>('Rau củ quả');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('Kg');
  const [expiryDate, setExpiryDate] = useState('');
  const [emoji, setEmoji] = useState('🥕');

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (item && (mode === 'edit' || mode === 'detail')) {
        setStorageType(item.storageType);
        setCategory(item.category);
        setName(item.name);
        setQuantity(item.quantity);
        setUnit((item.unit as UnitType) || 'Kg');
        setExpiryDate(item.expiryDate || '');
        setEmoji(item.emoji);
      } else {
        setStorageType('Ngăn mát');
        setCategory('Rau củ quả');
        setName('');
        setQuantity(1);
        setUnit('Kg');
        setExpiryDate('');
        setEmoji('🥕');
      }
    }
  }, [isOpen, item, mode]);

  useEffect(() => {
    if (mode === 'add') {
      setEmoji(EMOJI_MAP[category] || '📦');
    }
  }, [category, mode]);

  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSave = () => {
    // Generate daysRemaining based on expiryDate if needed, else mock it
    const daysRemaining = 5; 
    onSave({
      storageType,
      category,
      name,
      quantity: category === 'Gia vị' ? 0 : quantity,
      unit: category === 'Gia vị' ? undefined : unit,
      expiryDate,
      emoji,
      daysRemaining
    });
  };

  if (!isOpen) return null;

  const isGiaVi = category === 'Gia vị';

  return (
    <div className="fridge-modal-overlay" onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className="fridge-bottom-sheet" ref={sheetRef}>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, background: '#E0E0E0', borderRadius: 4 }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}>
            {mode === 'add' ? 'Thêm thực phẩm' : mode === 'edit' ? 'Chỉnh sửa thực phẩm' : 'Chi tiết thực phẩm'}
          </div>
          {mode === 'edit' && item && onDelete && (
            <div 
              style={{ width: 40, height: 40, background: '#FFEBEE', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => onDelete(item.id)}
            >
              <Trash2 size={20} color="#D32F2F" />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Vị trí lưu trữ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Vị trí lưu trữ</label>
            <div style={{ position: 'relative', width: '100%', height: 52, paddingLeft: 16, paddingRight: 16, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select 
                style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: isReadOnly ? 'default' : 'pointer' }}
                value={storageType}
                onChange={(e) => setStorageType(e.target.value as StorageType)}
                disabled={isReadOnly}
              >
                {STORAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', pointerEvents: 'none' }}>{storageType}</div>
              <div style={{ color: '#757575', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', pointerEvents: 'none' }}>▼</div>
            </div>
          </div>

          {/* Danh mục thực phẩm */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <div style={{ display: 'flex' }}>
              <span style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Danh mục thực phẩm</span>
              <span style={{ color: '#D32F2F', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px', marginLeft: 4 }}>*</span>
            </div>
            <div style={{ position: 'relative', width: '100%', height: 52, paddingLeft: 16, paddingRight: 16, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select 
                style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: isReadOnly ? 'default' : 'pointer' }}
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                disabled={isReadOnly}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', pointerEvents: 'none' }}>{category}</div>
              <div style={{ color: '#757575', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', pointerEvents: 'none' }}>▼</div>
            </div>
          </div>

          {/* Tên thực phẩm */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Tên thực phẩm</label>
            <div style={{ position: 'relative', width: '100%', height: 52, paddingLeft: 16, paddingRight: 16, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400' }}
                placeholder="VD: Cà rốt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Hình ảnh */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Hình ảnh</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" style={{ flex: 1, height: 52, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }} disabled={isReadOnly}>
                <ImageIcon size={20} color="#FF8A00" />
                <span style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Chọn ảnh</span>
              </button>
              <button type="button" style={{ flex: 1, height: 52, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }} disabled={isReadOnly}>
                <Camera size={20} color="#FF8A00" />
                <span style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Chụp ảnh</span>
              </button>
            </div>
          </div>

          {/* Số lượng & Đơn vị */}
          {!isGiaVi && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Số lượng & Đơn vị</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isReadOnly} style={{ width: 48, height: 48, background: '#F5F5F5', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }}>
                  <span style={{ color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>−</span>
                </button>
                
                <div style={{ width: 80, height: 48, borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  <input 
                    type="number" 
                    style={{ width: '100%', height: '100%', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isReadOnly}
                  />
                </div>
                
                <button type="button" onClick={() => setQuantity(quantity + 1)} disabled={isReadOnly} style={{ width: 48, height: 48, background: '#FF8A00', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }}>
                  <span style={{ color: 'white', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>+</span>
                </button>
                
                <div style={{ flex: 1, position: 'relative', height: 48, paddingLeft: 12, paddingRight: 12, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>{unit}</div>
                  <div style={{ color: '#757575', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>▼</div>
                  
                  {/* Click area for unit */}
                  <div 
                    style={{ position: 'absolute', inset: 0, cursor: isReadOnly ? 'default' : 'pointer' }}
                    onClick={() => !isReadOnly && setIsUnitDropdownOpen(!isUnitDropdownOpen)}
                  />
                  <UnitDropdown 
                    isOpen={isUnitDropdownOpen} 
                    onClose={() => setIsUnitDropdownOpen(false)} 
                    onSelect={setUnit} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hạn sử dụng */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Hạn sử dụng</label>
            <div style={{ position: 'relative', width: '100%', height: 52, paddingLeft: 16, paddingRight: 16, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}
                placeholder="dd/mm/yyyy"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, paddingBottom: 16 }}>
          {mode === 'detail' ? (
            <button type="button" style={{ width: '100%', height: 48, background: 'white', borderRadius: 100, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', border: 'none', cursor: 'pointer' }} onClick={onClose}>
              Đóng
            </button>
          ) : (
            <>
              <button 
                type="button" 
                style={{ width: '100%', height: 48, background: '#FF8A00', borderRadius: 100, color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', border: 'none', cursor: !name.trim() ? 'default' : 'pointer', opacity: !name.trim() ? 0.6 : 1 }}
                onClick={handleSave}
                disabled={!name.trim()}
              >
                {mode === 'add' ? 'Lưu vào tủ lạnh' : 'Lưu thay đổi'}
              </button>
              <button type="button" style={{ width: '100%', height: 48, background: 'white', borderRadius: 100, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', border: 'none', cursor: 'pointer' }} onClick={onClose}>
                Hủy
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default IngredientFormModal;
