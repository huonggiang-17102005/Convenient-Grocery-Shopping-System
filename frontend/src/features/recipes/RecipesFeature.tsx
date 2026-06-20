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
import ShoppingConfirmModal from './modals/ShoppingConfirmModal';
import Toast from '../../components/common/Toast';

import { shoppingService } from '../shopping-list/shopping-list.service';
import './recipes.css';

type ActiveTab = 'library' | 'favorites' | 'community';

export const RecipesFeature: React.FC<RecipesFeatureProps> = ({ role }) => {
  // ── Data state ──────────────────────────────────────────────
  const {
    recipes, setRecipes,
    systemRecipes,
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

  const [isShoppingConfirmOpen, setIsShoppingConfirmOpen] = useState(false);
  const [shoppingConfirmIngredients, setShoppingConfirmIngredients] = useState<any[]>([]);

  // Toast state
  const [toastMsg, setToastMsg] = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastTrigger(prev => prev + 1);
  }, []);

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
      showToast('Không thể cập nhật yêu thích');
    }
  }, [showToast]);

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
        showToast('Lỗi khi lưu công thức');
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
        showToast('Lỗi khi xóa công thức');
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
    const missing: Array<{
      name: string;
      category: string;
      neededText: string;
      defaultBuyAmount: string;
      quantity?: number;
      unit?: string;
    }> = [];

    recipe.ingredients.forEach(ing => {
      const inFridge = (fridgeItems || []).find(f =>
        (f.category || 'Khác').toLowerCase() === (ing.category || 'Khác').toLowerCase() &&
        f.name.toLowerCase() === ing.name.toLowerCase()
      );

      if (ing.category === 'Gia vị') {
        if (!inFridge) {
          const roundedAmount = Math.round(ing.amount * 100) / 100;
          missing.push({
            name: ing.name,
            category: ing.category,
            neededText: 'Gia vị chưa có trong tủ lạnh',
            defaultBuyAmount: ing.amount > 0 ? `${roundedAmount} ${ing.unit}` : '1 gói',
            quantity: ing.amount > 0 ? roundedAmount : 1,
            unit: ing.amount > 0 ? ing.unit : 'gói',
          });
        }
      } else {
        const available = inFridge ? inFridge.quantity : 0;
        if (available < ing.amount) {
          const diff = ing.amount - available;
          const roundedAmount = Math.round(ing.amount * 100) / 100;
          const roundedAvailable = Math.round(available * 100) / 100;
          const roundedDiff = Math.round(diff * 100) / 100;
          missing.push({
            name: ing.name,
            category: ing.category,
            neededText: `Cần ${roundedAmount}${ing.unit} (Trong tủ: ${roundedAvailable}${ing.unit})`,
            defaultBuyAmount: `${roundedDiff} ${ing.unit}`,
            quantity: roundedDiff,
            unit: ing.unit,
          });
        }
      }
    });

    if (missing.length === 0) {
      showToast('Đã đủ nguyên liệu cho món ăn này');
      setIsDetailOpen(false);
      setIsViewingCommunity(false);
      return;
    }

    setShoppingConfirmIngredients(missing);
    setIsShoppingConfirmOpen(true);
  }, [fridgeItems]);

  const handleShoppingConfirmSubmit = useCallback(async (items: Array<{ name: string; category: string; buyAmountStr?: string; quantity?: number; unit?: string }>) => {
    const parseQuantity = (str: string): { amount: number; unit: string } => {
      const trimmed = str.trim();
      const match = trimmed.match(/^([\d.,]+)\s*(.*)$/);
      if (match) {
        const num = parseFloat(match[1].replace(',', '.'));
        return {
          amount: isNaN(num) ? 1 : num,
          unit: match[2] || 'g',
        };
      }
      return {
        amount: 1,
        unit: trimmed || 'g',
      };
    };

    try {
      for (const item of items) {
        let finalQty = 1;
        let finalUnit = 'g';
        if (item.category === 'Gia vị') {
          finalQty = 0;
          finalUnit = (item.buyAmountStr || '').trim();
        } else {
          finalQty = item.quantity ?? 1;
          finalUnit = item.unit || 'g';
        }

        await shoppingService.createShoppingItem({
          name: item.name,
          category: item.category,
          quantity: finalQty,
          unit: finalUnit,
          deadlineDate: '',
          deadlineTime: ''
        });
      }

      setIsShoppingConfirmOpen(false);
      showToast('Đã thêm các nguyên liệu thiếu vào danh sách mua sắm thành công!');
    } catch (error) {
      console.error('Error adding custom items to shopping list:', error);
      alert('Lỗi khi thêm nguyên liệu vào danh sách mua sắm');
    }
  }, []);

  const handleCommunityPostClick = useCallback((post: CommunityPost) => {
    setIsViewingCommunity(true);
    setDetailRecipe(post.recipe);
    setIsDetailOpen(true);
  }, []);

  const handleSaveToFamily = useCallback(async (recipe: Recipe) => {
    try {
      const recipeData = {
        name: recipe.name,
        emoji: recipe.emoji,
        imageUrl: recipe.imageUrl || undefined,
        imagePublicId: recipe.imagePublicId || undefined,
        cookTimeMinutes: recipe.cookTimeMinutes,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        ingredients: recipe.ingredients.map(ing => ({
          id: ing.id || ('ing_' + Date.now() + Math.random()),
          category: ing.category,
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
        })),
        steps: recipe.steps.map(step => ({
          id: step.id || ('step_' + Date.now() + Math.random()),
          description: step.description,
        })),
      };

      const newRecipe = await recipesService.createRecipe(recipeData);
      // Insert after priority recipes so sort stays correct
      setRecipes((prev) => {
        const priorityOnes = prev.filter(r => r.isPriority);
        const rest = prev.filter(r => !r.isPriority);
        return [...priorityOnes, newRecipe, ...rest];
      });
      setIsDetailOpen(false);
      showToast(`Đã lưu "${recipe.name}" vào thư viện Gia đình!`);
    } catch (error) {
      console.error('Error saving recipe to family:', error);
      showToast('Lỗi khi lưu công thức vào thư viện Gia đình');
    }
  }, [setRecipes, showToast]);

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
        showToast('Đã gửi công thức lên cộng đồng, vui lòng chờ duyệt!');
      } catch (error) {
        console.error('Error sharing recipe:', error);
        showToast('Lỗi khi chia sẻ công thức');
      }
    },
    [showToast]
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
        showShoppingAndCook={role !== 'member'}
        role={role}
        onClose={() => {
          setIsDetailOpen(false);
          setIsViewingCommunity(false);
        }}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onToggleFavorite={handleToggleFavorite}
        onAddToShoppingList={handleAddToShoppingList}
        onSaveToFamily={handleSaveToFamily}
      />

      {isShoppingConfirmOpen && (
        <ShoppingConfirmModal
          isOpen={isShoppingConfirmOpen}
          onClose={() => setIsShoppingConfirmOpen(false)}
          onConfirm={handleShoppingConfirmSubmit}
          initialIngredients={shoppingConfirmIngredients}
        />
      )}

      <RecipeFormModal
        key={isFormOpen ? `recipe-form-${formRecipe?.id ?? 'new'}` : 'recipe-form-closed'}
        isOpen={isFormOpen}
        mode={formMode}
        recipe={formRecipe}
        role={role}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <ShareCommunityModal
        key={isShareOpen ? 'share-modal-open' : 'share-modal-closed'}
        isOpen={isShareOpen}
        role={role}
        onClose={() => setIsShareOpen(false)}
        onSubmit={handleShareSubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        recipeName={deleteRecipe?.name}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <Toast message={toastMsg} trigger={toastTrigger} onHide={() => { }} />
    </div>
  );
};

export default RecipesFeature;
