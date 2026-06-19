import React, { useState, useEffect } from 'react';
import type { ShoppingItem, FoodCategory } from '../types';
import { useCategoryContext } from '../../../contexts/CategoryContext';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: Omit<ShoppingItem, 'id' | 'isBought' | 'assigneeId'>) => void;
  item: ShoppingItem | null;
  mode: 'create' | 'edit';
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSubmit, item, mode }) => {
  const { categoriesData } = useCategoryContext();

  const [category, setCategory] = useState<FoodCategory>(() => {
    if (mode === 'edit' && item) return item.category;
    return '';
  });

  const [name, setName] = useState(() => {
    if (mode === 'edit' && item) return item.name;
    return '';
  });

  const [quantity, setQuantity] = useState<number>(() => {
    if (mode === 'edit' && item) return item.quantity;
    return 1;
  });

  const [unit, setUnit] = useState(() => {
    if (mode === 'edit' && item) return item.unit;
    return '';
  });

  // Calculate available categories and units
  const availableCategories = categoriesData.map(c => c.category);
  const currentCategoryData = categoriesData.find(c => c.category === category);
  const availableUnits = currentCategoryData?.units || [];

  // Auto update unit when category changes
  useEffect(() => {
    if (isOpen && mode === 'create') {
      const newAvailableUnits = categoriesData.find(c => c.category === category)?.units;
      if (newAvailableUnits && newAvailableUnits.length > 0 && !newAvailableUnits.includes(unit)) {
        setUnit(newAvailableUnits[0]);
      }
    }
  }, [category, isOpen, mode, categoriesData]);

  const [deadlineDate, setDeadlineDate] = useState(() => {
    if (mode === 'edit' && item) return item.deadlineDate;
    return '';
  });

  const [deadlineTime, setDeadlineTime] = useState(() => {
    if (mode === 'edit' && item) return item.deadlineTime;
    return '';
  });

  // Cập nhật lại mặc định khi load xong API categories
  useEffect(() => {
    // We no longer set a default category/unit to force users to choose
  }, [categoriesData, mode]);

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
    if (!name.trim() || !category || !unit) {
      alert('Vui lòng điền đầy đủ Tên, Phân loại và Đơn vị!');
      return;
    }
    onSubmit({
      name: name.trim(),
      category,
      quantity,
      unit,
      deadlineDate,
      deadlineTime,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <h2 className="bottom-sheet__title" style={{ paddingBottom: '16px' }}>
          {mode === 'create' ? 'Thêm mặt hàng mới' : 'Chỉnh sửa mặt hàng'}
        </h2>

        <form onSubmit={handleSave} className="form-modal-container">
          {/* Category */}
          <div className="form-group">
            <label htmlFor="category-select" className="form-label">Danh mục thực phẩm</label>
            <select
              id="category-select"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodCategory)}
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
            />
          </div>

          {/* Quantity & Unit */}
          <div className="form-group">
            <label htmlFor="quantity-input" className="form-label">Số lượng & Đơn vị</label>
            <div className="form-qty-row">
              <button
                type="button"
                className="form-qty-btn form-qty-btn--minus"
                onClick={handleDecrease}
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <input
                id="quantity-input"
                type="number"
                className="form-qty-value"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
              />
              <button
                type="button"
                className="form-qty-btn form-qty-btn--plus"
                onClick={handleIncrease}
                aria-label="Tăng số lượng"
              >
                +
              </button>
              <select
                id="unit-select"
                className="form-unit-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                aria-label="Đơn vị đo lường"
              >
                <option value="" disabled hidden>-</option>
                {availableUnits.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

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
              />
            </div>
          </div>

          {/* Actions */}
          <div className="bottom-sheet__actions" style={{ paddingTop: '8px' }}>
            <button type="submit" className="modal-btn modal-btn--primary">
              {mode === 'create' ? 'Thêm mặt hàng' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              className="modal-btn modal-btn--outline"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
