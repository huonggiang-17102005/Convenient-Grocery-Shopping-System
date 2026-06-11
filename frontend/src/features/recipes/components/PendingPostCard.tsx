// src/features/recipes/components/PendingPostCard.tsx

import React from 'react';

interface PendingPostCardProps {
  recipeEmoji?: string;
  recipeName?: string;
  recipeImageUrl?: string;
  role?: 'homemaker' | 'member';
  onCancel: () => void;
}

const PendingPostCard: React.FC<PendingPostCardProps> = ({
  recipeEmoji = '🍜',
  recipeName = 'Món ăn mới',
  recipeImageUrl,
  role = 'homemaker',
  onCancel,
}) => {
  const isMember = role === 'member';

  return (
    <div className={`pending-post-card ${isMember ? 'pending-post-card--member' : ''}`} id="pending-post-card">
      <div className="pending-post-left">
        <div className="pending-post-avatar-box">
          {recipeImageUrl ? (
            <img src={recipeImageUrl} alt={recipeName} className="pending-post-img-element" />
          ) : (
            <span className="pending-post-emoji">{recipeEmoji}</span>
          )}
        </div>
        <div className="pending-post-info">
          <span className="pending-post-title">{recipeName}</span>
          <span className="pending-post-status">Đang chờ Admin duyệt</span>
        </div>
      </div>
      <div className="pending-post-right">
        <span className={`pending-post-badge ${isMember ? 'pending-post-badge--member' : ''}`}>
          Chờ duyệt
        </span>
        <button
          id="pending-post-cancel-btn"
          type="button"
          className="pending-post-cancel-btn"
          onClick={onCancel}
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default PendingPostCard;
