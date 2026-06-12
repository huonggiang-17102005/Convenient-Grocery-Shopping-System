import React, { useState } from 'react';
import type { ShoppingItem, FoodCategory, CreateItemPayload } from '../types';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateItemPayload) => void;
  item: ShoppingItem | null;
  mode: 'create' | 'edit';
}

const CATEGORIES: FoodCategory[] = ['Rau củ', 'Thịt cá', 'Đồ khô', 'Gia vị', 'Đồ uống', 'Khác'];
const UNITS = ['g', 'kg', 'cái', 'hộp', 'bó', 'túi', 'lít', 'ml', 'quả', 'con'];

const ItemFormModal: React.FC<ItemFormModalProps> = ({ isOpen, onClose, onSubmit, item, mode }) => {
  const [category, setCategory] = useState<FoodCategory>(() => {
    if (mode === 'edit' && item) return item.category;
    return 'Rau củ';
  });

  const [name, setName] = useState(() => {
    if (mode === 'edit' && item) return item.name;
    return '';
  });

  const [quantity, setQuantity] = useState<number>(() => {
    if (mode === 'edit' && item) return item.quantity;
    return 500;
  });

  const [unit, setUnit] = useState(() => {
    if (mode === 'edit' && item) return item.unit;
    return 'g';
  });

  const [deadlineDate, setDeadlineDate] = useState(() => {
    if (mode === 'edit' && item) return item.deadline_date ?? '';
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });

  const [deadlineTime, setDeadlineTime] = useState(() => {
    if (mode === 'edit' && item) return item.deadline_time ?? '18:00';
    return '18:00';
  });

  if (!isOpen) return null;

  const handleDecrease = () => {
    setQuantity(prev => Math.max(1, prev - (prev > 100 ? 100 : 1)));
  };

  const handleIncrease = () => {
    setQuantity(prev => prev + (prev >= 100 ? 100 : 1));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQuantity(Math.max(1, val));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên mặt hàng.');
      return;
    }
    onSubmit({
      name: name.trim(),
      category,
      quantity,
      unit,
      deadline_date: deadlineDate || null,
      deadline_time: deadlineTime || null,
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
              {CATEGORIES.map(cat => (
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
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline Date */}
          <div className="form-group">
            <label htmlFor="deadline-date-input" className="form-label">Hạn chót mua (ngày)</label>
            <input
              id="deadline-date-input"
              type="date"
              className="form-input"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
            />
          </div>

          {/* Deadline Time */}
          <div className="form-group">
            <label htmlFor="deadline-time-input" className="form-label">Hạn chót mua (giờ)</label>
            <input
              id="deadline-time-input"
              type="time"
              className="form-input"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
            />
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
