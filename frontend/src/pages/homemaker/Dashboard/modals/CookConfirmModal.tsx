import React, { useState } from 'react';
import { X } from 'lucide-react';

export interface CookIngredient {
  name: string;
  amountValue: string;
  amountUnit: string;
}

interface CookConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (ingredients: CookIngredient[]) => void;
}

const INITIAL_INGREDIENTS: CookIngredient[] = [
  { name: 'Thịt bò',   amountValue: '500', amountUnit: 'g' },
  { name: 'Hành tây',  amountValue: '1',   amountUnit: 'củ' },
  { name: 'Gia vị',    amountValue: '1',   amountUnit: 'gói' },
  { name: 'Cà chua',   amountValue: '2',   amountUnit: 'quả' },
  { name: 'Trứng gà',  amountValue: '3',   amountUnit: 'quả' },
];

const CookConfirmModal: React.FC<CookConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [ingredients, setIngredients] = useState<CookIngredient[]>(INITIAL_INGREDIENTS);

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
    setIngredients((prev) => [...prev, { name: '', amountValue: '', amountUnit: '' }]);
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
                placeholder="Thịt bò..."
                aria-label={`Tên nguyên liệu ${index + 1}`}
              />
              <input
                className="cook-modal__input cook-modal__input--value"
                value={item.amountValue}
                onChange={(e) => updateField(index, 'amountValue', e.target.value)}
                placeholder="500"
                aria-label={`Số lượng ${item.name || index + 1}`}
              />
              <input
                className="cook-modal__input cook-modal__input--unit"
                value={item.amountUnit}
                onChange={(e) => updateField(index, 'amountUnit', e.target.value)}
                placeholder="g"
                aria-label={`Đơn vị ${item.name || index + 1}`}
              />
              <button
                className="cook-modal__remove-btn"
                onClick={() => removeRow(index)}
                aria-label={`Xoá ${item.name || `dòng ${index + 1}`}`}
              >
                <X size={14} color="#757575" strokeWidth={2.5} />
              </button>
            </div>
          ))}
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
