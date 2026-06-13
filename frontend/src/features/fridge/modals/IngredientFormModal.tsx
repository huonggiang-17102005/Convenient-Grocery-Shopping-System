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
        
        <div className="fridge-sheet-handle-row">
          <div className="fridge-sheet-handle" />
        </div>

        <div className="fridge-sheet-header">
          <h2 className="fridge-sheet-title">
            {mode === 'add' ? 'Thêm thực phẩm' : mode === 'edit' ? 'Chỉnh sửa thực phẩm' : 'Chi tiết thực phẩm'}
          </h2>
          {mode === 'edit' && item && onDelete && (
            <button className="fridge-btn-delete-icon" onClick={() => onDelete(item.id)}>
              <Trash2 size={20} color="#D32F2F" />
            </button>
          )}
        </div>

        <div className="fridge-form-content">
          <div className="form-group">
            <label className="form-label">Vị trí lưu trữ</label>
            <div className="form-select-wrapper">
              <select 
                className="form-input form-select" 
                value={storageType} 
                onChange={(e) => setStorageType(e.target.value as StorageType)}
                disabled={isReadOnly}
              >
                {STORAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="select-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Danh mục thực phẩm<span className="required">*</span></label>
            <div className="form-select-wrapper">
              <select 
                className="form-input form-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                disabled={isReadOnly}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="select-icon" size={20} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tên thực phẩm</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="VD: Cà rốt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isReadOnly}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hình ảnh</label>
            <div className="form-image-buttons">
              <button type="button" className="image-btn" disabled={isReadOnly}>
                <ImageIcon size={20} color="#FF8A00" />
                <span>Chọn ảnh</span>
              </button>
              <button type="button" className="image-btn" disabled={isReadOnly}>
                <Camera size={20} color="#FF8A00" />
                <span>Chụp ảnh</span>
              </button>
            </div>
          </div>

          {!isGiaVi && (
            <div className="form-group">
              <label className="form-label">Số lượng & Đơn vị</label>
              <div className="quantity-unit-row">
                <div className="quantity-stepper">
                  <button type="button" className="qty-stepper-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isReadOnly}>−</button>
                  <input 
                    type="number" 
                    className="qty-stepper-input" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={isReadOnly}
                  />
                  <button type="button" className="qty-stepper-btn plus" onClick={() => setQuantity(quantity + 1)} disabled={isReadOnly}>+</button>
                </div>
                
                <div className="unit-select-wrapper">
                  <button type="button" className="unit-select-btn" onClick={() => !isReadOnly && setIsUnitDropdownOpen(!isUnitDropdownOpen)} disabled={isReadOnly}>
                    {unit}
                    <ChevronDown size={20} color="#757575" />
                  </button>
                  <UnitDropdown 
                    isOpen={isUnitDropdownOpen} 
                    onClose={() => setIsUnitDropdownOpen(false)} 
                    onSelect={setUnit} 
                  />
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Hạn sử dụng</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="dd/mm/yyyy"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="fridge-sheet-footer">
          {mode === 'detail' ? (
            <button type="button" className="modal-btn modal-btn--outline" onClick={onClose}>
              Đóng
            </button>
          ) : (
            <>
              <button 
                type="button" 
                className="modal-btn modal-btn--primary" 
                onClick={handleSave}
                disabled={!name.trim()}
              >
                {mode === 'add' ? 'Lưu vào tủ lạnh' : 'Lưu thay đổi'}
              </button>
              <button type="button" className="modal-btn modal-btn--outline" onClick={onClose}>
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
