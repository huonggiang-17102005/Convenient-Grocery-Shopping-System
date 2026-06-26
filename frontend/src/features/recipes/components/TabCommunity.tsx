// src/features/recipes/components/TabCommunity.tsx

import React from 'react';
import type { CommunityPost, PendingPost } from '../types';
import CommunityPostCard from './CommunityPostCard';
import PendingPostCard from './PendingPostCard';

interface TabCommunityProps {
  posts: CommunityPost[];
  pendingPost?: PendingPost | null;
  role?: 'homemaker' | 'member';
  onPostRecipeClick: (post: CommunityPost) => void;
  onToggleLike: (postId: string) => void;
  onShareClick: () => void;
  onCancelPending?: () => void;
  subTab: 'all' | 'mine';
  onChangeSubTab: (subTab: 'all' | 'mine') => void;
}

const TabCommunity: React.FC<TabCommunityProps> = ({
  posts,
  pendingPost,
  role,
  onPostRecipeClick,
  onToggleLike,
  onCancelPending,
  subTab,
  onChangeSubTab,
}) => {
  return (
    <div className="recipe-tab-content">
      {/* Sub-tab Toggle */}
      <div className="recipe-sub-tabs">
        <button
          type="button"
          className={`recipe-sub-tab-btn ${subTab === 'all' ? 'active' : 'inactive'}`}
          onClick={() => onChangeSubTab('all')}
        >
          Tất cả
        </button>
        <button
          type="button"
          className={`recipe-sub-tab-btn ${subTab === 'mine' ? 'active' : 'inactive'}`}
          onClick={() => onChangeSubTab('mine')}
        >
          Bài viết của tôi
        </button>
      </div>

      {/* Pending post notice */}
      {pendingPost && (
        <PendingPostCard
          recipeEmoji={pendingPost.recipe.emoji}
          recipeName={pendingPost.recipe.name}
          recipeImageUrl={pendingPost.recipe.imageUrl}
          role={role}
          onCancel={onCancelPending || (() => {})}
        />
      )}

      {/* Posts list */}
      {posts.length === 0 ? (
        <div className="recipe-empty-state">
          <div className="recipe-empty-icon">👨‍🍳</div>
          <p>Chưa có bài chia sẻ nào</p>
        </div>
      ) : (
        <div className="community-posts-list">
          {posts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onRecipeClick={onPostRecipeClick}
              onToggleLike={onToggleLike}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TabCommunity;

