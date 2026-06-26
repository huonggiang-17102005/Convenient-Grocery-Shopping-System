import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Recipe, CommunityPost, FilterIngredient, RecipesFeatureProps, PendingPost } from './types';
import { recipesService } from './recipes.service';
import { Sparkles } from 'lucide-react';
import AiRecipeModal from '../fridge/modals/AiRecipeModal';
import { useRecipesContext } from '../../contexts/RecipesContext';
import { useFridgeContext } from '../../contexts/FridgeContext';
import { useAuth } from '../../contexts/AuthContext';

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
import { mealPlannerService } from '../meal-planner/mealPlanner.service';
import './recipes.css';

type ActiveTab = 'library' | 'favorites' | 'community';

export const RecipesFeature: React.FC<RecipesFeatureProps> = ({ role }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [communitySubTab, setCommunitySubTab] = useState<'all' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
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
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null);

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
    const originalRecipes = recipes;
    const originalFavs = favoriteRecipes;
    const originalCommunity = communityPosts;
    const originalDetail = detailRecipe;

    // Find current state
    const currentItem = recipes.find(r => r.id === recipeId) || 
                        favoriteRecipes.find(r => r.id === recipeId) || 
                        communityPosts.find(p => p.recipe.id === recipeId)?.recipe ||
                        (detailRecipe?.id === recipeId ? detailRecipe : null);
    if (!currentItem) return;
    const newFavState = !currentItem.isFavorited;

    // Optimistic Update
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFavorited: newFavState } : r))
    );
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post.recipe.id === recipeId
          ? { ...post, recipe: { ...post.recipe, isFavorited: newFavState } }
          : post
      )
    );
    setDetailRecipe((prev) =>
      prev && prev.id === recipeId ? { ...prev, isFavorited: newFavState } : prev
    );

    if (newFavState) {
      const added = recipes.find(r => r.id === recipeId) || currentItem;
      setFavoriteRecipes(prev => {
        if (prev.some(r => r.id === recipeId)) return prev;
        return [...prev, { ...added, isFavorited: true }];
      });
    } else {
      setFavoriteRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }

    try {
      await recipesService.toggleFavorite(recipeId);
      refreshRecipes(); // Sync in background
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Không thể cập nhật yêu thích');
      // Rollback
      setRecipes(originalRecipes);
      setFavoriteRecipes(originalFavs);
      setCommunityPosts(originalCommunity);
      setDetailRecipe(originalDetail);
    }
  }, [recipes, favoriteRecipes, communityPosts, detailRecipe, refreshRecipes, showToast]);

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

  const handleOpenShare = useCallback((recipe: Recipe) => {
    setShareRecipe(recipe);
    setIsDetailOpen(false);
    setIsShareOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: Omit<Recipe, 'id' | 'isFavorited'>) => {
      const originalRecipes = recipes;
      setIsFormOpen(false);

      if (formMode === 'create') {
        const tempId = `temp_${Date.now()}`;
        const tempRecipe: Recipe = {
          id: tempId,
          isFavorited: false,
          ...data
        } as Recipe;
        setRecipes((prev) => [tempRecipe, ...prev]);
        showToast(`Đã lưu công thức "${data.name}" thành công!`);

        try {
          const newRecipe = await recipesService.createRecipe(data);
          setRecipes((prev) => prev.map(r => r.id === tempId ? newRecipe : r));
        } catch (error) {
          console.error('Error saving recipe:', error);
          showToast('Lỗi khi lưu công thức');
          setRecipes(originalRecipes); // Rollback
        }
      } else if (formMode === 'edit' && formRecipe) {
        setRecipes((prev) =>
          prev.map((r) =>
            r.id === formRecipe.id ? { ...r, ...data } : r
          )
        );
        showToast(`Đã cập nhật công thức "${data.name}" thành công!`);

        try {
          const updatedRecipe = await recipesService.updateRecipe(formRecipe.id, data);
          setRecipes((prev) =>
            prev.map((r) =>
              r.id === formRecipe.id ? { ...r, ...updatedRecipe } : r
            )
          );
        } catch (error) {
          console.error('Error saving recipe:', error);
          showToast('Lỗi khi lưu công thức');
          setRecipes(originalRecipes); // Rollback
        }
      }
    },
    [formMode, formRecipe, showToast, recipes]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteRecipe) {
      const originalRecipes = recipes;
      
      // Optimistic Update
      setRecipes((prev) => prev.filter((r) => r.id !== deleteRecipe.id));
      setIsDeleteOpen(false);
      const toDelete = deleteRecipe;
      setDeleteRecipe(null);

      try {
        await recipesService.deleteRecipe(toDelete.id);
      } catch (error) {
        console.error('Error deleting recipe:', error);
        showToast('Lỗi khi xóa công thức');
        setRecipes(originalRecipes); // Rollback
      }
    }
  }, [deleteRecipe, recipes, showToast]);

  const handleToggleCommunityLike = useCallback(async (postId: string) => {
    const originalCommunity = communityPosts;
    const currentPost = communityPosts.find(p => p.id === postId);
    if (!currentPost) return;

    // Optimistic Update
    const nextIsLiked = !currentPost.isLiked;
    const nextLikes = nextIsLiked ? currentPost.likes + 1 : Math.max(0, currentPost.likes - 1);
    
    setCommunityPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: nextIsLiked, likes: nextLikes }
          : p
      )
    );

    // Sync favorite state with like state
    if (!!currentPost.recipe.isFavorited !== nextIsLiked) {
      handleToggleFavorite(postId);
    }

    try {
      await recipesService.toggleLike(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
      setCommunityPosts(originalCommunity); // Rollback
    }
  }, [communityPosts, handleToggleFavorite]);

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
            neededText: `Cần ${roundedAmount} ${ing.unit} (Trong tủ: ${roundedAvailable} ${ing.unit})`,
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
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const date = String(today.getDate()).padStart(2, '0');
      const localTodayDateStr = `${year}-${month}-${date}`;

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
          deadlineDate: localTodayDateStr,
          deadlineTime: '23:59'
        });
      }

      setIsShoppingConfirmOpen(false);
      setIsDetailOpen(false);
      showToast('Đã thêm các nguyên liệu thiếu vào danh sách mua sắm thành công!');
      navigate(`/${role}/shopping-list`);
    } catch (error) {
      console.error('Error adding custom items to shopping list:', error);
      showToast('Lỗi khi thêm nguyên liệu vào danh sách mua sắm');
    }
  }, [showToast, role, navigate]);

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

  const handleAddToMenu = useCallback(async (recipe: Recipe, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    try {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dd}`;

      let peopleCount = recipe.servings || 1;
      const data = await mealPlannerService.getMealPlan(dateStr, dateStr);
      if (data && data[dateStr] && data[dateStr][mealType] && data[dateStr][mealType].length > 0) {
        peopleCount = data[dateStr][mealType][0].people_count;
      }

      await mealPlannerService.addMealPlan(recipe.id, dateStr, mealType, peopleCount);
      setIsDetailOpen(false);
      showToast(`Đã thêm "${recipe.name}" vào bữa ${mealType === 'breakfast' ? 'sáng' : mealType === 'lunch' ? 'trưa' : 'tối'} hôm nay!`);
    } catch (error) {
      console.error('Error adding to menu:', error);
      showToast('Lỗi khi thêm vào thực đơn hôm nay');
    }
  }, [showToast]);

  const fetchPendingPost = useCallback(async () => {
    try {
      const pendingRecipes = await recipesService.getUserPendingRecipes();
      if (pendingRecipes.length > 0) {
        // Sort newest first
        const sortedRecipes = [...pendingRecipes].sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        const mappedPosts: PendingPost[] = sortedRecipes.map(recipe => ({
          id: recipe.id,
          recipe: recipe,
          submittedAt: recipe.createdAt || new Date().toISOString(),
          status: 'pending',
          description: recipe.description || '',
        }));
        setPendingPosts(mappedPosts);
      } else {
        setPendingPosts([]);
      }
    } catch (error) {
      console.error('Error fetching pending recipes:', error);
    }
  }, []);

  useEffect(() => {
    fetchPendingPost();
  }, [fetchPendingPost, activeTab]);

  const handleCancelPending = useCallback(async (postId: string) => {
    try {
      await recipesService.deleteRecipe(postId);
      showToast('Đã hủy chia sẻ công thức thành công!');
      setPendingPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting pending recipe:', error);
    }
  }, [showToast]);

  const handleShareSubmit = useCallback(
    async (description: string, recipeData: Omit<Recipe, 'id' | 'isFavorited'>) => {
      try {
        let recipeIdToShare;
        
        if (shareRecipe) {
          // Update the existing recipe
          const updatedRecipe = await recipesService.updateRecipe(shareRecipe.id, recipeData);
          recipeIdToShare = updatedRecipe.id;
        } else {
          // Create new recipe
          const createdRecipe = await recipesService.createRecipe(recipeData);
          recipeIdToShare = createdRecipe.id;
        }
        
        // Share to community (this sets visibility to 'Pending')
        await recipesService.shareToCommunity(recipeIdToShare, description);

        setIsShareOpen(false);
        setShareRecipe(null);
        showToast('Đã gửi công thức lên cộng đồng, vui lòng chờ duyệt!');
        
        // Refresh family recipes so the updated visibility reflects immediately
        refreshRecipes();
        await fetchPendingPost();
      } catch (error) {
        console.error('Error sharing recipe:', error);
        showToast('Lỗi khi chia sẻ công thức');
      }
    },
    [shareRecipe, showToast, fetchPendingPost, refreshRecipes]
  );

  // Remove diacritics utility
  const removeDiacritics = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (char) => (char === 'đ' ? 'd' : 'D'));
  };

  // Filter lists by search query
  const query = removeDiacritics(searchQuery.trim().toLowerCase());
  const filteredRecipes = query
    ? recipes.filter(r => removeDiacritics(r.name.toLowerCase()).includes(query))
    : recipes;
  const filteredSystemRecipes = query
    ? systemRecipes.filter(r => removeDiacritics(r.name.toLowerCase()).includes(query))
    : systemRecipes;
  const filteredFavoriteRecipes = query
    ? favoriteRecipes.filter(r => removeDiacritics(r.name.toLowerCase()).includes(query))
    : favoriteRecipes;
  const filteredCommunityPosts = communityPosts
    .filter(p => {
      if (communitySubTab === 'mine') {
        return p.author.id === user?.id;
      }
      return true;
    })
    .filter(p => {
      if (query) {
        return removeDiacritics(p.recipe.name.toLowerCase()).includes(query);
      }
      return true;
    });

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="recipes-feature" id="recipes-feature">
      {/* Sticky page header */}
      <div className="recipes-page-header">
        <div className="recipes-header-title-row">
          <h1 className="recipes-page-title">Công thức nấu ăn</h1>
        </div>
        <RecipeTabs
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />
        {/* Search bar input at the bottom of header */}
        <div className="recipe-search-bar-wrapper">
          <span className="recipe-search-icon">🔍</span>
          <input
            id="recipe-search-input"
            type="text"
            className="recipe-search-input"
            placeholder="Tìm kiếm theo tên món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="recipe-search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Xoá tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tab content area (scrollable) */}
      <div className="recipes-content">
        {activeTab === 'library' && (
          <TabLibrary
            recipes={filteredRecipes}
            systemRecipes={filteredSystemRecipes}
            subTab={subTab}
            onChangeSubTab={setSubTab}
            selectedIngredients={selectedIngredients}
            availableIngredients={availableIngredients}
            onChangeIngredients={setSelectedIngredients}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
            role={role}
          />
        )}
        {activeTab === 'favorites' && (
          <TabFavorites
            recipes={filteredFavoriteRecipes}
            onRecipeClick={handleRecipeClick}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
        {activeTab === 'community' && (
          <TabCommunity
            posts={filteredCommunityPosts}
            pendingPosts={pendingPosts}
            role={role}
            onPostRecipeClick={handleCommunityPostClick}
            onToggleLike={handleToggleCommunityLike}
            onShareClick={() => {
              setShareRecipe(null);
              setIsShareOpen(true);
            }}
            onCancelPending={handleCancelPending}
            subTab={communitySubTab}
            onChangeSubTab={setCommunitySubTab}
          />
        )}
      </div>

      {/* FAB: Thêm công thức (homemaker & member cho cả thư viện và cộng đồng) */}
      {((activeTab === 'library' && subTab === 'family') || activeTab === 'community') && (
        <button
          id="recipe-fab-btn"
          type="button"
          className="recipe-fab"
          onClick={activeTab === 'community' ? () => {
            setShareRecipe(null);
            setIsShareOpen(true);
          } : handleOpenCreate}
          aria-label={activeTab === 'community' ? "Chia sẻ bài viết mới" : "Thêm công thức mới"}
        >
          <span>+</span>
        </button>
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      <RecipeDetailModal
        isOpen={isDetailOpen}
        recipe={detailRecipe}
        showEditDelete={!isViewingCommunity && detailRecipe?.authorId === user?.id}
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
        onShare={handleOpenShare}
        onAddToMenu={handleAddToMenu}
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
        key={isShareOpen ? `share-modal-${shareRecipe?.id ?? 'new'}` : 'share-modal-closed'}
        isOpen={isShareOpen}
        role={role}
        recipe={shareRecipe}
        onClose={() => {
          setIsShareOpen(false);
          setShareRecipe(null);
        }}
        onSubmit={handleShareSubmit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        recipeName={deleteRecipe?.name}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <button
        id="recipes-ai-fab-btn"
        type="button"
        className="recipes-ai-fab"
        onClick={() => setIsAiModalOpen(true)}
        aria-label="AI Gợi ý nấu ăn"
        title="AI Gợi ý nấu ăn"
      >
        <Sparkles size={24} />
      </button>

      <AiRecipeModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onRecipeSaved={(newRecipe) => {
          setRecipes(prev => [newRecipe, ...prev]);
          showToast('Đã lưu công thức vào thư viện!');
        }}
      />

      <Toast message={toastMsg} trigger={toastTrigger} onHide={() => { }} />
    </div>
  );
};

export default RecipesFeature;
