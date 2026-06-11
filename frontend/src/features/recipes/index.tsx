// src/features/recipes/index.tsx
// Đầu não: Quản lý toàn bộ state và điều phối các tab/modal

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Recipe, CommunityPost, FilterIngredient, RecipesFeatureProps, PendingPost } from './recipes.types';
import { MOCK_RECIPES, MOCK_COMMUNITY_POSTS } from './recipes.data';

import RecipeTabs from './components/RecipeTabs';
import TabLibrary from './components/TabLibrary';
import TabFavorites from './components/TabFavorites';
import TabCommunity from './components/TabCommunity';

import RecipeDetailModal from './modals/RecipeDetailModal';
import RecipeFormModal from './modals/RecipeFormModal';
import ShareCommunityModal from './modals/ShareCommunityModal';
import ConfirmDeleteModal from './modals/ConfirmDeleteModal';

import './recipes.css';

type ActiveTab = 'library' | 'favorites' | 'community';

const matchFoodImageUrl = (nameStr: string): string => {
  const lower = nameStr.toLowerCase();
  if (lower.includes('bò') || lower.includes('beef')) {
    return 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('gà') || lower.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('cá') || lower.includes('fish')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('tôm') || lower.includes('shrimp') || lower.includes('hải sản')) {
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('cà chua') || lower.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('canh') || lower.includes('súp') || lower.includes('soup') || lower.includes('mì') || lower.includes('phở') || lower.includes('noodles')) {
    return 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=600&auto=format&fit=crop&q=80';
  }
  // Generic beautiful food dish
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
};

// Color theme per role
const ROLE_COLORS: Record<'homemaker' | 'member', string> = {
  homemaker: '#FF8A00',
  member: '#1E88E5',
};

export const RecipesFeature: React.FC<RecipesFeatureProps> = ({ role }) => {
  const primaryColor = ROLE_COLORS[role];

  // ── Data state ──────────────────────────────────────────────
  const [recipes, setRecipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(MOCK_COMMUNITY_POSTS);
  const [pendingPost, setPendingPost] = useState<PendingPost | null>(null);

  // ── UI state ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
  const [selectedIngredients, setSelectedIngredients] = useState<FilterIngredient[]>([]);

  // ── Modal state ──────────────────────────────────────────────
  const [detailRecipe, setDetailRecipe] = useState<Recipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isViewingCommunity, setIsViewingCommunity] = useState(false);

  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formRecipe, setFormRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isShareOpen, setIsShareOpen] = useState(false);

  const [deleteRecipe, setDeleteRecipe] = useState<Recipe | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────
  const pendingTimeoutRef = useRef<any>(null);

  // ── Cleanup on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────

  const handleToggleFavorite = useCallback((recipeId: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFavorited: !r.isFavorited } : r))
    );
  }, []);

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    setIsViewingCommunity(false);
    setDetailRecipe(recipe);
    setIsDetailOpen(true);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setFormMode('create');
    setFormRecipe(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((recipe: Recipe) => {
    setFormMode('edit');
    setFormRecipe(recipe);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleOpenDelete = useCallback((recipe: Recipe) => {
    setDeleteRecipe(recipe);
    setIsDetailOpen(false);
    setIsDeleteOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (data: Omit<Recipe, 'id' | 'isFavorited'>) => {
      if (formMode === 'create') {
        const newRecipe: Recipe = {
          ...data,
          id: 'rec_' + Date.now(),
          isFavorited: false,
          imageUrl: matchFoodImageUrl(data.name),
        };
        setRecipes((prev) => [newRecipe, ...prev]);
      } else if (formMode === 'edit' && formRecipe) {
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === formRecipe.id ? { ...r, ...data } : r
          )
        );
      }
    },
    [formMode, formRecipe]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteRecipe) {
      setRecipes((prev) => prev.filter((r) => r.id !== deleteRecipe.id));
      setDeleteRecipe(null);
      setIsDeleteOpen(false);
    }
  }, [deleteRecipe]);

  const handleToggleCommunityLike = useCallback((postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }, []);

  const handleAddToShoppingList = useCallback((_recipe: Recipe) => {
    // TODO: integrate with shopping list feature
    alert('Đã gom nguyên liệu thiếu vào Shopping List!');
  }, []);

  const handleCommunityPostClick = useCallback((post: CommunityPost) => {
    setIsViewingCommunity(true);
    setDetailRecipe(post.recipe);
    setIsDetailOpen(true);
  }, []);

  const handleCancelPending = useCallback(() => {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current);
      pendingTimeoutRef.current = null;
    }
    setPendingPost(null);
  }, []);

  const handleShareSubmit = useCallback(
    (description: string, recipeData: Omit<Recipe, 'id' | 'isFavorited'>) => {
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }

      const pendingRecipe: Recipe = {
        ...recipeData,
        id: 'rec_' + Date.now(),
        isFavorited: false,
        imageUrl: matchFoodImageUrl(recipeData.name),
      };

      const newPending: PendingPost = {
        id: 'pending_' + Date.now(),
        recipe: pendingRecipe,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        description,
      };

      setPendingPost(newPending);
      setIsShareOpen(false);

      // Simulate admin approval after 6 seconds
      pendingTimeoutRef.current = setTimeout(() => {
        setPendingPost((currentPending) => {
          if (currentPending && currentPending.id === newPending.id) {
            const newPost: CommunityPost = {
              id: 'post_' + Date.now(),
              author: {
                id: 'user_current',
                name: role === 'homemaker' ? 'Anh Tuấn' : 'Lan Hương',
                avatarEmoji: role === 'homemaker' ? '👨' : '👩',
              },
              description: currentPending.description || '',
              recipe: currentPending.recipe,
              postedAt: new Date().toISOString(),
              likes: 0,
              isLiked: false,
            };
            setCommunityPosts((prev) => [newPost, ...prev]);
            return null; // clears pending status
          }
          return currentPending;
        });
      }, 6000);
    },
    [role]
  );

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="recipes-feature" id="recipes-feature">
      {/* Sticky page header */}
      <div className="recipes-page-header">
        <h1 className="recipes-page-title">Công thức nấu ăn</h1>
        <RecipeTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          primaryColor={primaryColor}
        />
      </div>

      {/* Tab content area (scrollable) */}
      <div className="recipes-content">
        {activeTab === 'library' && (
          <TabLibrary
            recipes={recipes}
            selectedIngredients={selectedIngredients}
            onChangeIngredients={setSelectedIngredients}
            primaryColor={primaryColor}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === 'favorites' && (
          <TabFavorites
            recipes={recipes}
            primaryColor={primaryColor}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === 'community' && (
          <TabCommunity
            posts={communityPosts}
            primaryColor={primaryColor}
            pendingPost={pendingPost}
            role={role}
            onPostRecipeClick={handleCommunityPostClick}
            onToggleLike={handleToggleCommunityLike}
            onShareClick={() => setIsShareOpen(true)}
            onCancelPending={handleCancelPending}
          />
        )}
      </div>

      {/* FAB: Thêm công thức (homemaker & member cho cả thư viện và cộng đồng) */}
      {(activeTab === 'library' || activeTab === 'community') && (
        <button
          id="recipe-fab-btn"
          type="button"
          className="recipe-fab"
          style={{ background: primaryColor }}
          onClick={activeTab === 'community' ? () => setIsShareOpen(true) : handleOpenCreate}
          aria-label={activeTab === 'community' ? "Chia sẻ bài viết mới" : "Thêm công thức mới"}
        >
          <span>+</span>
        </button>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      <RecipeDetailModal
        isOpen={isDetailOpen}
        recipe={detailRecipe}
        role={role}
        primaryColor={primaryColor}
        showEditDelete={!isViewingCommunity}
        onClose={() => {
          setIsDetailOpen(false);
          setIsViewingCommunity(false);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleFavorite={handleToggleFavorite}
        onAddToShoppingList={handleAddToShoppingList}
      />

      <RecipeFormModal
        key={isFormOpen ? (formRecipe?.id ?? 'new') : 'closed'}
        isOpen={isFormOpen}
        mode={formMode}
        recipe={formRecipe}
        role={role}
        primaryColor={primaryColor}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ShareCommunityModal
        key={isShareOpen ? 'open' : 'closed'}
        isOpen={isShareOpen}
        role={role}
        primaryColor={primaryColor}
        onClose={() => setIsShareOpen(false)}
        onSubmit={handleShareSubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        recipeName={deleteRecipe?.name}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default RecipesFeature;
