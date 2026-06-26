// src/features/recipes/modals/RecipeDetailModal.tsx

import React from 'react';
import type { Recipe } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';

interface RecipeDetailModalProps {
  isOpen: boolean;
  recipe: Recipe | null;
  showEditDelete?: boolean;
  showShoppingAndCook?: boolean;
  role?: 'homemaker' | 'member';
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  onSaveToFamily?: (recipe: Recipe) => void;
  onShare?: (recipe: Recipe) => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  recipe,
  showEditDelete = true,
  showShoppingAndCook = true,
  role,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddToShoppingList,
  onSaveToFamily,
  onShare,
}) => {
  if (!isOpen || !recipe) return null;

  const expiring = recipe.ingredients.filter((i) => i.isExpiringSoon);
  const notExpiring = recipe.ingredients.filter((i) => !i.isExpiringSoon);

  return (
    <div className="modal-overlay" id="recipe-detail-modal" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: 32 }}
      >
        {/* Favorite & Close header */}
        <div className="recipe-detail-header-row">
          {showShoppingAndCook && (
            <button
              id="recipe-detail-fav-btn"
              type="button"
              className="recipe-detail-fav-btn"
              onClick={() => onToggleFavorite(recipe.id)}
              aria-label={recipe.isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
            >
              {recipe.isFavorited ? '❤️' : '🤍'}
            </button>
          )}
          <button
            id="recipe-detail-close-btn"
            type="button"
            className="recipe-detail-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="recipe-detail-body">
          {/* Image */}
          <div className="recipe-detail-image" style={{ margin: '0 0 20px 0' }}>
            {recipe.imageUrl ? (
              <ImageWithFallback src={recipe.imageUrl} fallbackType="recipe" alt={recipe.name} className="recipe-detail-img-element" />
            ) : (
              <span className="recipe-detail-emoji">{recipe.emoji}</span>
            )}
          </div>

          <h2 className="recipe-detail-title">{recipe.name}</h2>

          {/* Cook time & difficulty badges */}
          <div className="recipe-detail-tags" style={{ display: 'flex', gap: '8px', marginTop: '-12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className={`recipe-tag ${recipe.cookTimeMinutes <= 30 ? 'recipe-tag--easy' : recipe.cookTimeMinutes <= 60 ? 'recipe-tag--medium' : 'recipe-tag--hard'}`}>
              ⏱️ {recipe.cookTimeMinutes} phút
            </span>
            <span className={`recipe-tag ${recipe.difficulty?.toLowerCase() === 'dễ' ? 'recipe-tag--easy' : recipe.difficulty?.toLowerCase() === 'trung bình' ? 'recipe-tag--medium' : 'recipe-tag--hard'}`}>
              📊 {recipe.difficulty}
            </span>
          </div>

          {/* Nutrition Info Row */}
          {recipe.calories !== undefined && recipe.calories > 0 && (
            <div className="recipe-detail-nutrition-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '20px',
              border: '1px solid #E2E8F0',
              textAlign: 'center'
            }}>
              <div className="nutrition-item">
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, fontFamily: 'Plus Jakarta Sans' }}>Calories</div>
                <div style={{ fontSize: '14px', color: '#D84315', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>{recipe.calories} kcal</div>
              </div>
              <div className="nutrition-item">
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, fontFamily: 'Plus Jakarta Sans' }}>Protein</div>
                <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>{recipe.protein || 0}g</div>
              </div>
              <div className="nutrition-item">
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, fontFamily: 'Plus Jakarta Sans' }}>Fat</div>
                <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>{recipe.fat || 0}g</div>
              </div>
              <div className="nutrition-item">
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, fontFamily: 'Plus Jakarta Sans' }}>Carbs</div>
                <div style={{ fontSize: '14px', color: '#1E293B', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' }}>{recipe.carbs || 0}g</div>
              </div>
            </div>
          )}

          {/* Ingredient info box */}
          <div className="recipe-detail-ingredients-box">
            <h4 className="recipe-detail-section-title">Thông tin nguyên liệu</h4>
            <div className="recipe-detail-servings-badge">
              Khẩu phần: {recipe.servings} người!
            </div>

            <ul className="recipe-detail-ingredient-list">
              {expiring.map((ing) => (
                <li key={ing.id} className="recipe-detail-ingredient expiring">
                  <span className="ingredient-dot" style={{ background: '#D32F2F' }} />
                  <strong>{ing.name} – {Math.round(ing.amount * 100) / 100} {ing.unit}</strong>
                </li>
              ))}
              {notExpiring.map((ing) => (
                <li key={ing.id} className="recipe-detail-ingredient">
                  <span className="ingredient-dot" style={{ background: '#1A1A1A' }} />
                  {ing.name} – {Math.round(ing.amount * 100) / 100} {ing.unit}
                </li>
              ))}
            </ul>

            {showShoppingAndCook && (
              <button
                id="recipe-detail-shopping-btn"
                type="button"
                className="recipe-detail-primary-btn"
                onClick={() => onAddToShoppingList(recipe)}
              >
                Gom đồ thiếu vào Shopping List
              </button>
            )}
          </div>

          {/* Cooking steps */}
          <h4 className="recipe-detail-section-title" style={{ marginTop: 24 }}>Các bước thực hiện</h4>
          <ol className="recipe-detail-steps">
            {recipe.steps.map((step, idx) => (
              <li key={step.id} className="recipe-detail-step">
                <span className="recipe-step-number">
                  {idx + 1}
                </span>
                <span className="recipe-step-text">{step.description}</span>
              </li>
            ))}
          </ol>

          {/* Action buttons */}
          <div className="recipe-detail-actions">
            {showEditDelete && recipe.authorId === null && (
              <button
                id="recipe-detail-save-family-btn"
                type="button"
                className="recipe-detail-primary-btn"
                onClick={() => onSaveToFamily && onSaveToFamily(recipe)}
              >
                Lưu vào thư viện Gia đình
              </button>
            )}

            {/* Action buttons (show edit/delete for both roles only if showEditDelete is true) */}
            {showEditDelete && (
              <>
                <button
                  id="recipe-detail-edit-btn"
                  type="button"
                  className="recipe-detail-primary-btn"
                  onClick={() => onEdit(recipe)}
                >
                  Sửa công thức
                </button>
                {onShare && (
                  <button
                    id="recipe-detail-share-btn"
                    type="button"
                    className="recipe-detail-share-btn"
                    onClick={() => onShare(recipe)}
                  >
                    📢 Chia sẻ cho Cộng đồng
                  </button>
                )}
                <button
                  id="recipe-detail-delete-btn"
                  type="button"
                  className="recipe-detail-danger-btn"
                  onClick={() => onDelete(recipe)}
                >
                  🗑️ Xóa công thức
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
