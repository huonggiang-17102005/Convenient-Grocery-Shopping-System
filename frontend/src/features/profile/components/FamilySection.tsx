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
  onTransfer: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
}

const FamilySection: React.FC<FamilySectionProps> = ({ members, onTransfer, onDelete }) => {
  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Thành viên gia đình</h2>
      <div className="profile-family-list">
        {members.map((member) => (
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
                  {member.role === 'homemaker' ? 'Homemaker' : 'Thành viên'}
                </span>
              </div>
            </div>

            {/* Right: action buttons (only for other members) */}
            {!member.isCurrentUser && (
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
