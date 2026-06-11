import React from 'react';
import type { IngredientCardProps } from '../components/IngredientCard';

interface ExpireItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: IngredientCardProps | null;
  onSuggestRecipe?: (item: IngredientCardProps) => void;
}

const preservationTips: Record<string, string> = {
  'Sữa tươi':
    'Để sữa tươi được lâu hơn, bạn nên để ngăn mát nhiệt độ 1–4°C và tránh để gần cửa tủ lạnh. Nên bảo quản ở vị trí sâu trong ngăn mát.',
  'Thịt bò':
    'Bảo quản thịt bò trong ngăn đông (-18°C) nếu không dùng trong 1–2 ngày. Rã đông trong ngăn lạnh, không để ngoài nhiệt độ phòng.',
  'Dâu tây':
    'Không rửa trước khi bảo quản. Để trên đĩa có lót giấy thấm, bảo quản ngăn lạnh 0–4°C. Dùng trong 2–3 ngày để giữ độ tươi.',
};

const defaultTip = 'Nên sử dụng hoặc cấp đông ngay để tránh lãng phí thực phẩm. Kiểm tra bao bì sản phẩm để biết thêm hướng dẫn bảo quản.';

const ExpireItemModal: React.FC<ExpireItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSuggestRecipe,
}) => {
  if (!isOpen || !item) return null;

  const tip = preservationTips[item.name] ?? defaultTip;

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
