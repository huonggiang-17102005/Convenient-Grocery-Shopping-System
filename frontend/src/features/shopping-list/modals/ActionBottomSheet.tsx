import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ShoppingItem } from '../types';

export interface FamilyMember {
  id: string;       // UUID của user
  full_name: string;
  avatar_initial: string;
  avatar_color: string;
  text_color: string;
}

interface ActionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  members: FamilyMember[];
  onAssign: (itemId: string, assigneeId: string | null) => void;
  onEdit: (item: ShoppingItem) => void;
  onDelete: (item: ShoppingItem) => void;
}

const AVATAR_PALETTE = [
  { avatar_color: '#FFE0B2', text_color: '#FF8A00' },
  { avatar_color: '#E1BEE7', text_color: '#8E24AA' },
  { avatar_color: '#B3E5FC', text_color: '#0288D1' },
  { avatar_color: '#C8E6C9', text_color: '#388E3C' },
  { avatar_color: '#FFCCBC', text_color: '#E64A19' },
];

const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  isOpen,
  onClose,
  item,
  members,
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
        {members.length > 0 && (
          <div className="bottom-sheet__section">
            <p className="bottom-sheet__section-title">Giao việc mua hộ</p>
            <div className="bottom-sheet__members">
              {members.map((member, idx) => {
                const palette = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
                const isAssigned = item.assignee_id === member.id;
                return (
                  <div key={member.id} className="bottom-sheet__member-row">
                    <div className="bottom-sheet__member-left">
                      <div
                        className="bottom-sheet__member-avatar"
                        style={{ backgroundColor: palette.avatar_color, color: palette.text_color }}
                      >
                        {member.avatar_initial}
                      </div>
                      <span className="bottom-sheet__member-name">{member.full_name}</span>
                    </div>
                    <button
                      type="button"
                      className={`bottom-sheet__assign-btn ${isAssigned ? 'bottom-sheet__assign-btn--active' : ''}`}
                      onClick={() => onAssign(item.id, isAssigned ? null : member.id)}
                    >
                      {isAssigned ? 'Hủy giao' : 'Giao việc'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
