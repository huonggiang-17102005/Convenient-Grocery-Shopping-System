// src/features/recipes/components/TabCommunity.tsx

import React from 'react';
import type { CommunityPost, PendingPost } from '../recipes.types';
import CommunityPostCard from './CommunityPostCard';
import PendingPostCard from './PendingPostCard';

interface TabCommunityProps {
  posts: CommunityPost[];
  primaryColor: string;
  pendingPost?: PendingPost | null;
  role?: 'homemaker' | 'member';
  onPostRecipeClick: (post: CommunityPost) => void;
  onToggleLike: (postId: string) => void;
  onShareClick: () => void;
  onCancelPending?: () => void;
}

const TabCommunity: React.FC<TabCommunityProps> = ({
  posts,
  primaryColor,
  pendingPost,
  role,
  onPostRecipeClick,
  onToggleLike,
  onCancelPending,
}) => {
  return (
    <div className="recipe-tab-content">
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
              primaryColor={primaryColor}
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
