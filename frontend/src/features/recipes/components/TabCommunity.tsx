// src/features/recipes/components/TabCommunity.tsx

import React from 'react';
import type { CommunityPost, PendingPost } from '../types';
import CommunityPostCard from './CommunityPostCard';
import PendingPostCard from './PendingPostCard';

interface TabCommunityProps {
  posts: CommunityPost[];
  pendingPosts?: PendingPost[];
  role?: 'homemaker' | 'member';
  onPostRecipeClick: (post: CommunityPost) => void;
  onToggleLike: (postId: string) => void;
  onShareClick: () => void;
  onCancelPending?: (postId: string) => void;
  subTab: 'all' | 'mine';
  onChangeSubTab: (subTab: 'all' | 'mine') => void;
}

const TabCommunity: React.FC<TabCommunityProps> = ({
  posts,
  pendingPosts = [],
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
      {pendingPosts.map(post => (
        <PendingPostCard
          key={post.id}
          recipeEmoji={post.recipe.emoji}
          recipeName={post.recipe.name}
          recipeImageUrl={post.recipe.imageUrl}
          role={role}
          onCancel={onCancelPending ? () => onCancelPending(post.id) : () => {}}
        />
      ))}

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

