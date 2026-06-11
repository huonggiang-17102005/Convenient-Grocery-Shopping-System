import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ShoppingItem } from '../types';

interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  onAssign: (itemId: string, assigneeId: 'Kat' | 'Shin' | null) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (item: ShoppingItem) => void;
}

const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  isOpen,
  onClose,
  item,
  onAssign,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !item) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="bottom-sheet-overlay" onClick={handleOverlayClick}>
      <div className="bottom-sheet">
        {/* Drag Bar */}
        <div className="bottom-sheet__drag-bar" />

        {/* Title */}
        <h2 className="bottom-sheet__title">Chọn hành động</h2>

        {/* Section: Assign task */}
        <div className="bottom-sheet__section">
          <p className="bottom-sheet__section-title">Giao việc mua hộ</p>
          <div className="bottom-sheet__members">
            {/* Kat */}
            <div className="bottom-sheet__member-row">
              <div className="bottom-sheet__member-left">
                <div className="bottom-sheet__member-avatar" style={{ backgroundColor: '#FFE0B2', color: '#FF8A00' }}>
                  K
                </div>
                <span className="bottom-sheet__member-name">Kat</span>
              </div>
              <button
                type="button"
                className={`bottom-sheet__assign-btn ${
                  item.assigneeId === 'Kat' ? 'bottom-sheet__assign-btn--active' : ''
                }`}
                onClick={() => onAssign(item.id, item.assigneeId === 'Kat' ? null : 'Kat')}
              >
                {item.assigneeId === 'Kat' ? 'Hủy giao' : 'Giao việc'}
              </button>
            </div>

            {/* Shin */}
            <div className="bottom-sheet__member-row">
              <div className="bottom-sheet__member-left">
                <div className="bottom-sheet__member-avatar" style={{ backgroundColor: '#E1BEE7', color: '#8E24AA' }}>
                  S
                </div>
                <span className="bottom-sheet__member-name">Shin</span>
              </div>
              <button
                type="button"
                className={`bottom-sheet__assign-btn ${
                  item.assigneeId === 'Shin' ? 'bottom-sheet__assign-btn--active' : ''
                }`}
                onClick={() => onAssign(item.id, item.assigneeId === 'Shin' ? null : 'Shin')}
              >
                {item.assigneeId === 'Shin' ? 'Hủy giao' : 'Giao việc'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bottom-sheet__actions">
          <button
            type="button"
            className="bottom-sheet__btn bottom-sheet__btn--edit"
            onClick={() => {
              onEdit(item);
              onClose();
            }}
          >
            Sửa thông tin
          </button>
          <button
            type="button"
            className="bottom-sheet__btn bottom-sheet__btn--delete"
            onClick={() => {
              onDelete(item);
              onClose();
            }}
          >
            <Trash2 size={18} />
            Xóa mặt hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBottomSheet;
