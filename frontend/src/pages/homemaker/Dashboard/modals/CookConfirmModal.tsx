import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface CookIngredient {
  name: string;
  amount: string;
}

interface CookConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (ingredients: CookIngredient[]) => void;
}

const INITIAL_INGREDIENTS: CookIngredient[] = [
  { name: 'Thịt bò',   amount: '500g' },
  { name: 'Hành tây',  amount: '1 củ' },
  { name: 'Gia vị',    amount: '1 gói' },
  { name: 'Cà chua',   amount: '2 quả' },
  { name: 'Trứng gà',  amount: '3 quả' },
];

const CookConfirmModal: React.FC<CookConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [ingredients, setIngredients] = useState<CookIngredient[]>(INITIAL_INGREDIENTS);
  const [newName, setNewName]     = useState('');
  const [newAmount, setNewAmount] = useState('');

  if (!isOpen) return null;

  const updateField = (index: number, field: keyof CookIngredient, value: string) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    if (!newName.trim()) return;
    setIngredients((prev) => [...prev, { name: newName.trim(), amount: newAmount.trim() }]);
    setNewName('');
    setNewAmount('');
  };

  const handleConfirm = () => {
    onConfirm?.(ingredients);
    // Reset về mặc định cho lần mở tiếp theo
    setIngredients(INITIAL_INGREDIENTS);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Xác nhận nguyên liệu đã nấu">
      <div className="modal-card cook-modal">

        {/* Header */}
        <h3 className="cook-modal__title">Xác nhận nguyên liệu dùng thực tế</h3>
        <p className="cook-modal__subtitle">Điều chỉnh số lượng thực tế đã dùng</p>

        {/* Ingredient rows */}
        <div className="cook-modal__list">
          {ingredients.map((item, index) => (
            <div key={index} className="cook-modal__row">
              <input
                className="cook-modal__input cook-modal__input--name"
                value={item.name}
                onChange={(e) => updateField(index, 'name', e.target.value)}
                aria-label={`Tên nguyên liệu ${index + 1}`}
              />
              <input
                className="cook-modal__input cook-modal__input--amount"
                value={item.amount}
                onChange={(e) => updateField(index, 'amount', e.target.value)}
                aria-label={`Số lượng ${item.name}`}
              />
              <button
                className="cook-modal__remove-btn"
                onClick={() => removeRow(index)}
                aria-label={`Xoá ${item.name}`}
              >
                <X size={14} color="#757575" strokeWidth={2.5} />
              </button>
            </div>
          ))}

          {/* New ingredient row (placeholder style) */}
          <div className="cook-modal__row cook-modal__row--new">
            <input
              className="cook-modal__input cook-modal__input--name cook-modal__input--placeholder"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Thịt bò..."
              aria-label="Tên nguyên liệu mới"
            />
            <input
              className="cook-modal__input cook-modal__input--amount cook-modal__input--placeholder"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="500g"
              aria-label="Số lượng nguyên liệu mới"
            />
            <button
              className="cook-modal__remove-btn"
              onClick={() => { setNewName(''); setNewAmount(''); }}
              aria-label="Xoá dòng mới"
            >
              <X size={14} color="#757575" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Add new link */}
        <button className="cook-modal__add-link" onClick={addIngredient}>
          + Thêm nguyên liệu mới
        </button>

        {/* Action buttons */}
        <div className="cook-modal__actions">
          <button
            id="btn-cook-confirm"
            className="modal-btn modal-btn--primary"
            onClick={handleConfirm}
          >
            Xác nhận nấu &amp; Trừ kho
          </button>
          <button className="modal-btn modal-btn--outline" onClick={onClose}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookConfirmModal;
