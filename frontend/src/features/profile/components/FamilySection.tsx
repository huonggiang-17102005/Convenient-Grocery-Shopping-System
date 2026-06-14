import React from 'react';

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'homemaker' | 'member';
  isCurrentUser: boolean;
}

interface FamilySectionProps {
  members: FamilyMember[];
  role?: 'homemaker' | 'member';
  onTransfer: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

const FamilySection: React.FC<FamilySectionProps> = ({ members, role = 'homemaker', onTransfer, onDelete }) => {
  // Sắp xếp: User hiện tại đứng đầu → Nội trợ → Thành viên
  const sortedMembers = [...members].sort((a, b) => {
    // 1. User hiện tại luôn đứng đầu
    if (a.isCurrentUser) return -1;
    if (b.isCurrentUser) return 1;
    // 2. Nội trợ đứng sau user hiện tại
    if (a.role === 'homemaker' && b.role !== 'homemaker') return -1;
    if (b.role === 'homemaker' && a.role !== 'homemaker') return 1;
    // 3. Còn lại giữ nguyên thứ tự
    return 0;
  });

  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Thành viên gia đình</h2>
      <div className="profile-family-list">
        {sortedMembers.map((member) => (
          <div key={member.id} className="profile-member-card">
            {/* Left: avatar + info */}
            <div className="profile-member-left">
              <div className="profile-member-avatar">{member.avatar}</div>
              <div className="profile-member-info">
                <p className="profile-member-name">
                  {member.name}{member.isCurrentUser ? ' (Bạn)' : ''}
                </p>
                <span
                  className={`profile-member-badge ${
                    member.role === 'homemaker'
                      ? 'profile-member-badge--homemaker'
                      : 'profile-member-badge--member'
                  }`}
                >
                  {member.role === 'homemaker' ? 'Nội trợ' : 'Thành viên'}
                </span>
              </div>
            </div>

            {/* Right: action buttons (only for other members, only if user is homemaker) */}
            {role === 'homemaker' && !member.isCurrentUser && (
              <div className="profile-member-actions">
                <button
                  className="profile-member-btn profile-member-btn--transfer"
                  onClick={() => onTransfer(member)}
                >
                  Nhường quyền
                </button>
                <button
                  className="profile-member-btn profile-member-btn--delete"
                  onClick={() => onDelete(member)}
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilySection;
