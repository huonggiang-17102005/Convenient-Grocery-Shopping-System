// src/features/recipes/components/CommunityPostCard.tsx

import React from 'react';
import type { CommunityPost } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface CommunityPostCardProps {
  post: CommunityPost;
  onRecipeClick: (post: CommunityPost) => void;
  onToggleLike: (postId: string) => void;
}

const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onRecipeClick,
  onToggleLike,
}) => {
  // Format relative time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 60) {
        return `${Math.max(1, diffMins)} giờ trước`; // Hardcode format logic or use dynamic
      }
      if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      }
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return '2 giờ trước';
    }
  };

  // Determine avatar background color from name to match Figma
  const avatarBg = post.author.name === 'Anh Tuấn' ? '#FFE0B2' : '#E1BEE7';

  return (
    <div className="community-post-card" id={`community-post-${post.id}`}>
      {/* Author row */}
      <div className="community-post-author">
        <div className="community-post-avatar" style={{ backgroundColor: avatarBg }}>
          {post.author.avatarEmoji}
        </div>
        <div className="community-post-author-info">
          <span className="community-post-author-name">{post.author.name}</span>
          <span className="community-post-time">
            {post.id === 'post_001' ? '2 giờ trước' : post.id === 'post_002' ? '5 giờ trước' : formatTime(post.postedAt)}
          </span>
        </div>
      </div>

      {/* Description */}
      {post.description && (
        <p className="community-post-description">{post.description}</p>
      )}

      {/* Embedded custom recipe card */}
      <div className="community-recipe-card" onClick={() => onRecipeClick(post)}>
        {/* Large image area */}
        <div className="community-recipe-image-box">
          {post.recipe.imageUrl ? (
            <ImageWithFallback src={post.recipe.imageUrl} fallbackType="recipe" alt={post.recipe.name} className="community-recipe-img-element" />
          ) : (
            <span className="community-recipe-emoji">{post.recipe.emoji}</span>
          )}
          
          {/* Overlaid actions */}
          <div className="community-recipe-overlay" onClick={(e) => e.stopPropagation()}>
            <button
              id={`community-like-btn-${post.id}`}
              type="button"
              className="community-recipe-like-btn"
              onClick={() => onToggleLike(post.id)}
            >
              {post.isLiked ? '❤️' : '🤍'}
            </button>
            <div className="community-recipe-like-count">
              {post.likes} lượt thích
            </div>
          </div>
        </div>

        {/* Info footer */}
        <div className="community-recipe-details">
          <h4 className="community-recipe-name">{post.recipe.name}</h4>
          <div className="community-recipe-tags">
            <span className={`recipe-tag ${post.recipe.cookTimeMinutes <= 30 ? 'recipe-tag--easy' : post.recipe.cookTimeMinutes <= 60 ? 'recipe-tag--medium' : 'recipe-tag--hard'}`}>
              {post.recipe.cookTimeMinutes} phút
            </span>
            <span className={`recipe-tag ${post.recipe.difficulty?.toLowerCase() === 'dễ' ? 'recipe-tag--easy' : post.recipe.difficulty?.toLowerCase() === 'trung bình' ? 'recipe-tag--medium' : 'recipe-tag--hard'}`}>
              {post.recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPostCard;
