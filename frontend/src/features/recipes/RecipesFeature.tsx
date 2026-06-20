import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { Recipe, CommunityPost, FilterIngredient, RecipesFeatureProps, PendingPost } from './types';
import { recipesService } from './recipes.service';
import { useRecipesContext } from '../../contexts/RecipesContext';
import { useFridgeContext } from '../../contexts/FridgeContext';

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

export const RecipesFeature: React.FC<RecipesFeatureProps> = ({ role }) => {
  // ── Data state ──────────────────────────────────────────────
  const { 
    recipes, setRecipes, 
    systemRecipes, setSystemRecipes,
    favoriteRecipes, setFavoriteRecipes, 
    communityPosts, setCommunityPosts, 
    refreshRecipes 
  } = useRecipesContext();

  // ── UI state ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('library');
  const [subTab, setSubTab] = useState<'family' | 'system'>('family');
  const [pendingPost, setPendingPost] = useState<PendingPost | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<FilterIngredient[]>([]);
  const location = useLocation();

  const { items: fridgeItems } = useFridgeContext();
  const availableIngredients = Array.from(new Set((fridgeItems || []).map(item => item.name).filter(Boolean)));

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

  // ── Handle suggestion from dashboard/fridge ──────────────────────────
  useEffect(() => {
    const suggestIngredient = location.state?.suggestIngredient;
    const suggestIngredients = location.state?.suggestIngredients;

    let toAdd: string[] = [];
    if (suggestIngredient && typeof suggestIngredient === 'string') {
      toAdd.push(suggestIngredient);
    }
    if (Array.isArray(suggestIngredients)) {
      const validStrings = suggestIngredients.filter(ing => typeof ing === 'string');
      toAdd = [...toAdd, ...validStrings];
    }

    if (toAdd.length > 0) {
      setSelectedIngredients((prev) => {
        const newSet = new Set(prev);
        toAdd.forEach(ing => newSet.add(ing));
        return Array.from(newSet);
      });
      // Xóa state để tránh tự thêm lại khi người dùng navigate
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // ── Handlers ─────────────────────────────────────────────────

  const handleToggleFavorite = useCallback(async (recipeId: string) => {
    try {
      const { isFavorited } = await recipesService.toggleFavorite(recipeId);
      
      // Update family/library recipes
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipeId ? { ...r, isFavorited } : r))
      );

      // Update community posts
      setCommunityPosts((prev) =>
        prev.map((post) =>
          post.recipe.id === recipeId
            ? { ...post, recipe: { ...post.recipe, isFavorited } }
            : post
        )
      );

      // Update detailRecipe if open
      setDetailRecipe((prev) =>
        prev && prev.id === recipeId ? { ...prev, isFavorited } : prev
      );

      // Refresh/update favorite recipes list
      if (isFavorited) {
        refreshRecipes(); // Mới thêm favorited, có thể lấy lại danh sách
      } else {
        setFavoriteRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Không thể cập nhật yêu thích');
    }
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
    async (data: Omit<Recipe, 'id' | 'isFavorited'>) => {
      try {
        if (formMode === 'create') {
          const newRecipe = await recipesService.createRecipe(data);
          setRecipes((prev) => [newRecipe, ...prev]);
        } else if (formMode === 'edit' && formRecipe) {
          const updatedRecipe = await recipesService.updateRecipe(formRecipe.id, data);
          setRecipes((prev) =>
            prev.map((r) =>
              r.id === formRecipe.id ? { ...r, ...updatedRecipe } : r
            )
          );
        }
      } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Lỗi khi lưu công thức');
      }
    },
    [formMode, formRecipe]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteRecipe) {
      try {
        await recipesService.deleteRecipe(deleteRecipe.id);
        setRecipes((prev) => prev.filter((r) => r.id !== deleteRecipe.id));
        setDeleteRecipe(null);
        setIsDeleteOpen(false);
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Lỗi khi xóa công thức');
      }
    }
  }, [deleteRecipe]);

  const handleToggleCommunityLike = useCallback(async (postId: string) => {
    try {
      // Pass recipe id to like (since post ID here is mapped to recipe id)
      const result = await recipesService.toggleLike(postId);
      setCommunityPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: result.isLiked, likes: result.likes }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, []);

  const handleAddToShoppingList = useCallback(async (recipe: Recipe) => {
    try {
      const result = await recipesService.addToShoppingList(recipe.id);
      alert(result.message);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      alert('Lỗi khi kiểm tra nguyên liệu hoặc thêm vào giỏ hàng.');
    }
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
    async (description: string, recipeData: Omit<Recipe, 'id' | 'isFavorited'>) => {
      try {
        // Create recipe first, then share
        const createdRecipe = await recipesService.createRecipe(recipeData);
        await recipesService.shareToCommunity(createdRecipe.id, description);
        
        setIsShareOpen(false);
        // Refresh data to show in community or just show success alert
        alert('Đã gửi công thức lên cộng đồng, vui lòng chờ duyệt!');
      } catch (error) {
        console.error('Error sharing recipe:', error);
        alert('Lỗi khi chia sẻ công thức');
      }
    },
    []
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
        />
      </div>

      {/* Tab content area (scrollable) */}
      <div className="recipes-content">
        {activeTab === 'library' && (
          <TabLibrary
            recipes={recipes}
            systemRecipes={systemRecipes}
            subTab={subTab}
            onChangeSubTab={setSubTab}
            selectedIngredients={selectedIngredients}
            availableIngredients={availableIngredients}
            onChangeIngredients={setSelectedIngredients}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === 'favorites' && (
          <TabFavorites
            recipes={favoriteRecipes}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === 'community' && (
          <TabCommunity
            posts={communityPosts}
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
      {((activeTab === 'library' && subTab === 'family') || activeTab === 'community') && (
        <button
          id="recipe-fab-btn"
          type="button"
          className="recipe-fab"
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
        showEditDelete={!isViewingCommunity && detailRecipe?.authorId !== null}
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
        key={isFormOpen ? `recipe-form-${formRecipe?.id ?? 'new'}` : 'recipe-form-closed'}
        isOpen={isFormOpen}
        mode={formMode}
        recipe={formRecipe}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ShareCommunityModal
        key={isShareOpen ? 'share-modal-open' : 'share-modal-closed'}
        isOpen={isShareOpen}
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
