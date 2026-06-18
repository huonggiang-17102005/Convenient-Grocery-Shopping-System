import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Camera, Image as ImageIcon } from 'lucide-react';
import type { FoodItem, FoodCategory, StorageType } from '../types';
import UnitDropdown from '../components/UnitDropdown';
import type { UnitType } from '../components/UnitDropdown';
import { useCategoryContext } from '../../../contexts/CategoryContext';
import { fridgeService } from '../fridge.service';
import './IngredientFormModal.css';

interface IngredientFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | 'detail';
  item: FoodItem | null;
  onClose: () => void;
  onSave: (itemData: Omit<FoodItem, 'id'>) => void;
  onDelete?: (id: string) => void;
}

const STORAGES: StorageType[] = ['Ngăn mát', 'Ngăn đông', 'Khô'];

const EMOJI_MAP: Record<string, string> = {
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
  const { categoriesData } = useCategoryContext();
  
  const DYNAMIC_CATEGORIES = categoriesData.length > 0 ? categoriesData.map(c => c.category as FoodCategory) : ['Thịt cá', 'Rau củ quả', 'Trứng', 'Chất lỏng', 'Đồ khô', 'Gia vị', 'Khác'] as FoodCategory[];
  
  const [storageType, setStorageType] = useState<StorageType>('' as StorageType);
  const [category, setCategory] = useState<FoodCategory>('' as FoodCategory);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<UnitType>('' as UnitType);
  const [expiryDate, setExpiryDate] = useState('');
  const [emoji, setEmoji] = useState('📦');
  const [image, setImage] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);

  const activeCategoryData = categoriesData.find(c => c.category === category);
  const DYNAMIC_UNITS = activeCategoryData?.units && activeCategoryData.units.length > 0 ? activeCategoryData.units : ['g', 'l'];

  // Cập nhật lại unit mặc định nếu unit hiện tại không có trong danh sách của category mới
  useEffect(() => {
    if (category && DYNAMIC_UNITS && !DYNAMIC_UNITS.includes(unit)) {
      setUnit((DYNAMIC_UNITS[0] || '') as UnitType);
    }
  }, [category, DYNAMIC_UNITS, unit]);

  useEffect(() => {
    if (isOpen) {
      if (item && (mode === 'edit' || mode === 'detail')) {
        setStorageType(item.storageType);
        setCategory(item.category);
        setName(item.name);
        setQuantity(item.quantity);
        setUnit((item.unit as UnitType) || '');
        setExpiryDate(item.expiryDate ? item.expiryDate.split('T')[0] : '');
        setEmoji(item.emoji);
        setImage(item.image || '');
        setImagePublicId(item.imagePublicId || '');
      } else if (item && mode === 'add') {
        setStorageType(item.storageType);
        setCategory(item.category);
        setName(item.name);
        setQuantity(1);
        setUnit((item.unit as UnitType) || '');
        setExpiryDate('');
        setEmoji(item.emoji);
        setImage(item.image || '');
        setImagePublicId(item.imagePublicId || '');
      } else {
        setStorageType('' as StorageType);
        setCategory('' as FoodCategory);
        setName('');
        setQuantity(1);
        setUnit('' as UnitType);
        setExpiryDate('');
        setEmoji('📦');
        setImage('');
        setImagePublicId('');
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await fridgeService.uploadImage(file);
      if (data.imageUrl) {
        setImage(data.imageUrl);
        setImagePublicId(data.imagePublicId || '');
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
      image,
      imagePublicId,
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
                <option value="" disabled hidden>Chọn vị trí lưu trữ</option>
                {STORAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ color: storageType ? '#1A1A1A' : '#9E9E9E', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', pointerEvents: 'none' }}>{storageType || 'Chọn vị trí lưu trữ'}</div>
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
                onChange={(e) => {
                  const newCat = e.target.value as FoodCategory;
                  setCategory(newCat);
                  const newCatData = categoriesData.find(c => c.category === newCat);
                  if (newCatData && newCatData.units.length > 0) {
                    setUnit(newCatData.units[0]);
                  }
                }}
                disabled={isReadOnly}
              >
                <option value="" disabled hidden>Chọn danh mục thực phẩm</option>
                {DYNAMIC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ color: category ? '#1A1A1A' : '#9E9E9E', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', pointerEvents: 'none' }}>{category || 'Chọn danh mục thực phẩm'}</div>
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
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />

            {image ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', background: '#F9FAFB', padding: 12, borderRadius: 12, border: '1px solid #E5E7EB' }}>
                <img src={image} alt="Thực phẩm" style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover' }} />
                {!isReadOnly && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ background: 'transparent', border: '1px solid #FF8A00', color: '#FF8A00', borderRadius: 100, padding: '6px 16px', fontSize: 13, fontWeight: '500', cursor: 'pointer' }}>
                    {isUploading ? 'Đang tải...' : 'Đổi ảnh'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isReadOnly || isUploading} style={{ flex: 1, height: 52, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }}>
                  <ImageIcon size={20} color="#FF8A00" />
                  <span style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>
                    {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                  </span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isReadOnly || isUploading} style={{ flex: 1, height: 52, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }}>
                  <Camera size={20} color="#FF8A00" />
                  <span style={{ color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Chụp ảnh</span>
                </button>
              </div>
            )}
          </div>

          {/* Số lượng & Đơn vị */}
          {!isGiaVi && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Số lượng & Đơn vị</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isReadOnly} style={{ width: 48, height: 48, background: '#F5F5F5', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: isReadOnly ? 'default' : 'pointer' }}>
                  <span style={{ color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>−</span>
                </button>
                
                <div style={{ flex: 1, height: 48, borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
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
                
                <div style={{ width: 100, position: 'relative', height: 48, paddingLeft: 12, paddingRight: 12, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: unit ? '#1A1A1A' : '#9E9E9E', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>{unit || 'Đơn vị'}</div>
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
                    options={DYNAMIC_UNITS}
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
                type="date" 
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}
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
                style={{ width: '100%', height: 48, background: '#FF8A00', borderRadius: 100, color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', border: 'none', cursor: (!name.trim() || !category || !storageType) ? 'default' : 'pointer', opacity: (!name.trim() || !category || !storageType) ? 0.6 : 1 }}
                onClick={handleSave}
                disabled={!name.trim() || !category || !storageType}
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
