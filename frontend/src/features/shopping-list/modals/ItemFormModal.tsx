import React, { useState, useEffect } from 'react';
import type { ShoppingItem, FoodCategory } from '../types';
import { useCategoryContext } from '../../../contexts/CategoryContext';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: Omit<ShoppingItem, 'id' | 'isBought' | 'assigneeId'>) => void;
  item: ShoppingItem | null;
  mode: 'create' | 'edit' | 'view';
  readOnly?: boolean;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSubmit, item, mode, readOnly = false }) => {
  const { categoriesData } = useCategoryContext();

  const [category, setCategory] = useState<FoodCategory>(() => {
    if ((mode === 'edit' || mode === 'view') && item) return item.category;
    return '';
  });

  const [name, setName] = useState(() => {
    if ((mode === 'edit' || mode === 'view') && item) return item.name;
    return '';
  });

  const [quantity, setQuantity] = useState<number>(() => {
    if ((mode === 'edit' || mode === 'view') && item) return item.quantity;
    return 1;
  });

  const [unit, setUnit] = useState(() => {
    if ((mode === 'edit' || mode === 'view') && item) return item.unit;
    return '';
  });

  // Calculate available categories and units
  const availableCategories = categoriesData.map(c => c.category);
  const currentCategoryData = categoriesData.find(c => c.category === category);
  const availableUnits = currentCategoryData?.units || [];

  // Auto update unit when category changes
  useEffect(() => {
    if (isOpen) {
      if (category === 'Gia vị') return;
      const newAvailableUnits = categoriesData.find(c => c.category === category)?.units;
      if (newAvailableUnits && newAvailableUnits.length > 0) {
        if (category !== 'Khác' || !unit || !newAvailableUnits.includes(unit)) {
          setUnit(newAvailableUnits[0]);
        }
      }
    }
  }, [category, isOpen, categoriesData]);

  const [deadlineDate, setDeadlineDate] = useState(() => {
    if ((mode === 'edit' || mode === 'view') && item) return item.deadlineDate;
    return '';
  });

  const [deadlineTime, setDeadlineTime] = useState(() => {
    if ((mode === 'edit' || mode === 'view') && item) return item.deadlineTime;
    return '';
  });

  // Cập nhật lại mặc định khi load xong API categories
  useEffect(() => {
    // We no longer set a default category/unit to force users to choose
  }, [categoriesData, mode]);

  const isGiaVi = category === 'Gia vị';

  if (!isOpen) return null;

  const handleDecrease = () => {
    setQuantity(prev => Math.max(1, prev - 100));
  };

  const handleIncrease = () => {
    setQuantity(prev => prev + 100);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQuantity(Math.max(1, val));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) {
      alert('Vui lòng điền đầy đủ Tên và Phân loại!');
      return;
    }
    if (!isGiaVi && !unit) {
      alert('Vui lòng điền Đơn vị!');
      return;
    }
    onSubmit({
      name: name.trim(),
      category,
      quantity: isGiaVi ? 0 : quantity,
      unit: isGiaVi ? unit.trim() : unit,
      deadlineDate,
      deadlineTime,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="bottom-sheet__title" style={{ paddingBottom: '16px' }}>
          {readOnly ? 'Xem chi tiết nhiệm vụ' : mode === 'create' ? 'Thêm mặt hàng mới' : 'Chỉnh sửa mặt hàng'}
        </h2>

        <form onSubmit={handleSave} className="form-modal-container">
          {/* Category */}
          <div className="form-group">
            <label htmlFor="category-select" className="form-label">Danh mục thực phẩm</label>
            <select
              id="category-select"
              className="form-select"
              value={category}
              onChange={(e) => {
                const newCat = e.target.value as FoodCategory;
                setCategory(newCat);
                if (newCat === 'Gia vị') {
                  setUnit('');
                }
              }}
              disabled={readOnly}
            >
              <option value="" disabled hidden>- Chọn -</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="form-group">
            <label htmlFor="name-input" className="form-label">Tên mặt hàng</label>
            <input
              id="name-input"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Cà chua, Thịt bò..."
              disabled={readOnly}
            />
          </div>

          {/* Spice Amount Input */}
          {isGiaVi && (
            <div className="form-group" style={{ paddingTop: '8px' }}>
              <label htmlFor="spice-amount-input" className="form-label">Lượng cần mua (tùy chọn)</label>
              <input
                id="spice-amount-input"
                type="text"
                className="form-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ví dụ: 1 gói, 2 chai, ..."
                disabled={readOnly}
              />
            </div>
          )}

          {/* Số lượng & Đơn vị */}
          {!isGiaVi && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Số lượng & Đơn vị</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button type="button" onClick={handleDecrease} disabled={readOnly} style={{ width: 48, height: 48, background: '#F5F5F5', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: readOnly ? 'not-allowed' : 'pointer' }}>
                  <span style={{ color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>−</span>
                </button>

                <div style={{ flex: 1, height: 48, borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                <input
                  type="number"
                  style={{ width: '100%', height: '100%', textAlign: 'center', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={readOnly}
                  />
                </div>

                <button type="button" onClick={handleIncrease} disabled={readOnly} style={{ width: 48, height: 48, background: readOnly ? '#F5F5F5' : '#FF8A00', borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: readOnly ? 'not-allowed' : 'pointer' }}>
                  <span style={{ color: readOnly ? '#9E9E9E' : 'white', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>+</span>
                </button>

                <div style={{ width: 76, position: 'relative', height: 48, paddingLeft: 12, paddingRight: 12, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: unit ? '#1A1A1A' : '#9E9E9E', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>{unit || '-'}</div>
                  <div style={{ color: '#757575', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', display: category === 'Khác' ? 'block' : 'none' }}>▼</div>
                <select
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: (readOnly || category !== 'Khác') ? 'not-allowed' : 'pointer' }}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={readOnly || category !== 'Khác'}
                >
                    <option value="" disabled hidden>-</option>
                  {availableUnits.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                </div>
              </div>
            </div>
          )}

          {/* Deadline Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Hạn chót mua</label>
            <div style={{ position: 'relative', width: '100%', height: 52, paddingLeft: 16, paddingRight: 16, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', alignItems: 'center' }}>
              <input
                id="deadline-date-input"
                type="date"
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Deadline Time */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <label style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>Giờ chót mua</label>
            <div style={{ position: 'relative', width: '100%', height: 52, paddingLeft: 16, paddingRight: 16, background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', display: 'flex', alignItems: 'center' }}>
              <input
                id="deadline-time-input"
                type="time"
                style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bottom-sheet__actions" style={{ paddingTop: '8px' }}>
            {!readOnly && (
              <button type="submit" className="modal-btn modal-btn--primary">
                {mode === 'create' ? 'Thêm mặt hàng' : 'Lưu thay đổi'}
              </button>
            )}
            <button
              type="button"
              className={readOnly ? "modal-btn modal-btn--primary" : "modal-btn modal-btn--outline"}
              onClick={onClose}
              style={readOnly ? { width: '100%' } : {}}
            >
              {readOnly ? 'Đóng' : 'Hủy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
