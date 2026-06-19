import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ShoppingItem } from '../types';
import { useFamilyContext } from '../../../contexts/FamilyContext';

interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  onAssign: (itemId: string, assigneeId: string | null) => void;
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
  const { familyMembers } = useFamilyContext();

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
            {familyMembers.map((member) => (
              <div key={member.id} className="bottom-sheet__member-row">
                <div className="bottom-sheet__member-left">
                  <div className="bottom-sheet__member-avatar" style={{ backgroundColor: member.role === 'homemaker' ? '#FFE0B2' : '#E1BEE7', color: member.role === 'homemaker' ? '#FF8A00' : '#8E24AA' }}>
                    {member.avatar && member.avatar !== '👤' ? member.avatar : (member.name ? member.name[0].toUpperCase() : 'M')}
                  </div>
                  <span className="bottom-sheet__member-name">{member.name} {member.isCurrentUser ? '(Bạn)' : ''}</span>
                </div>
                <button
                  type="button"
                  className={`bottom-sheet__assign-btn ${
                    item.assigneeId === member.id ? 'bottom-sheet__assign-btn--active' : ''
                  }`}
                  onClick={() => onAssign(item.id, item.assigneeId === member.id ? null : member.id)}
                >
                  {item.assigneeId === member.id ? 'Hủy giao' : 'Giao việc'}
                </button>
              </div>
            ))}
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
