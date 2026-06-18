import React from 'react';
import type { IngredientCardProps } from '../components/IngredientCard';
import { useCategoryContext } from '../../../contexts/CategoryContext';

interface ExpireItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: IngredientCardProps | null;
  onSuggestRecipe?: (item: IngredientCardProps) => void;
}

const defaultTip = 'Nên sử dụng hoặc cấp đông ngay để tránh lãng phí thực phẩm. Kiểm tra bao bì sản phẩm để biết thêm hướng dẫn bảo quản.';

const ExpireItemModal: React.FC<ExpireItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuggestRecipe,
}) => {
  const { categoriesData } = useCategoryContext();

  if (!isOpen || !item) return null;

  const categoryData = categoriesData.find(c => c.category === item.category);
  const tip = categoryData?.default_storage_tip || defaultTip;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Chi tiết ${item.name}`}>
      <div className="modal-card expire-modal">

        {/* Title: item name centered */}
        <h3 className="expire-modal__title">{item.name}</h3>

        {/* Tip section */}
        <div className="expire-modal__tip-section">
          <p className="expire-modal__tip-heading">💡 Mẹo bảo quản tối ưu</p>
          <p className="expire-modal__tip-body">{tip}</p>
        </div>

        {/* Actions */}
        <div className="expire-modal__actions">
          <button
            id={`btn-suggest-recipe-${item.name}`}
            className="modal-btn modal-btn--primary"
            onClick={() => { onSuggestRecipe?.(item); onClose(); }}
          >
            Gợi ý công thức nấu
          </button>
          <button className="modal-btn modal-btn--gray" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpireItemModal;
