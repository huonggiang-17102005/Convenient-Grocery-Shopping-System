// src/features/recipes/modals/RecipeDetailModal.tsx

import React from 'react';
import type { Recipe } from '../types';

interface RecipeDetailModalProps {
  isOpen: boolean;
  recipe: Recipe | null;
  role: 'homemaker' | 'member';
  primaryColor: string;
  showEditDelete?: boolean;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  onToggleFavorite: (recipeId: string) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  recipe,
  role,
  primaryColor,
  showEditDelete = true,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onAddToShoppingList,
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
          <button
            id="recipe-detail-fav-btn"
            type="button"
            className="recipe-detail-fav-btn"
            onClick={() => onToggleFavorite(recipe.id)}
            aria-label={recipe.isFavorited ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            {recipe.isFavorited ? '❤️' : '🤍'}
          </button>
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
              <img src={recipe.imageUrl} alt={recipe.name} className="recipe-detail-img-element" />
            ) : (
              <span className="recipe-detail-emoji">{recipe.emoji}</span>
            )}
          </div>

          <h2 className="recipe-detail-title">{recipe.name}</h2>

          {/* Ingredient info box */}
          <div className="recipe-detail-ingredients-box" style={{ background: role === 'homemaker' ? '#FFF3E0' : '#E3F2FF' }}>
            <h4 className="recipe-detail-section-title">Thông tin nguyên liệu</h4>
            <div className="recipe-detail-servings-badge" style={{ background: role === 'homemaker' ? '#FFE0B2' : '#BBDEFB', color: primaryColor }}>
              Khẩu phần: {recipe.servings} người!
            </div>

            <ul className="recipe-detail-ingredient-list">
              {expiring.map((ing) => (
                <li key={ing.id} className="recipe-detail-ingredient expiring">
                  <span className="ingredient-dot" style={{ background: '#D32F2F' }} />
                  <strong>{ing.name} – {ing.amount}{ing.unit}</strong>
                </li>
              ))}
              {notExpiring.map((ing) => (
                <li key={ing.id} className="recipe-detail-ingredient">
                  <span className="ingredient-dot" style={{ background: '#1A1A1A' }} />
                  {ing.name} – {ing.amount}{ing.unit}
                </li>
              ))}
            </ul>

            <button
              id="recipe-detail-shopping-btn"
              type="button"
              className="recipe-detail-primary-btn"
              style={{ background: primaryColor }}
              onClick={() => onAddToShoppingList(recipe)}
            >
              Gom đồ thiếu vào Shopping List
            </button>
          </div>

          {/* Cooking steps */}
          <h4 className="recipe-detail-section-title" style={{ marginTop: 24 }}>Các bước thực hiện</h4>
          <ol className="recipe-detail-steps">
            {recipe.steps.map((step, idx) => (
              <li key={step.id} className="recipe-detail-step">
                <span className="recipe-step-number" style={{ background: primaryColor }}>
                  {idx + 1}
                </span>
                <span className="recipe-step-text">{step.description}</span>
              </li>
            ))}
          </ol>

          {/* Action buttons */}
          <div className="recipe-detail-actions">
            <button
              id="recipe-detail-cook-btn"
              type="button"
              className="recipe-detail-primary-btn"
              style={{ background: primaryColor }}
              onClick={() => {/* Lưu vào thực đơn - placeholder */}}
            >
              Lưu vào thực đơn hôm nay
            </button>

            {/* Action buttons (show edit/delete for both roles only if showEditDelete is true) */}
            {showEditDelete && (
              <>
                <button
                  id="recipe-detail-edit-btn"
                  type="button"
                  className="recipe-detail-outline-btn"
                  onClick={() => onEdit(recipe)}
                >
                  Sửa công thức
                </button>
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
