// src/features/recipes/modals/RecipeFormModal.tsx
// Shared form for both Add and Edit personal recipe

import React, { useState } from 'react';
import type { Recipe, Ingredient, CookingStep, DifficultyLevel } from '../types';

interface RecipeFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  recipe?: Recipe | null;
  role: 'homemaker' | 'member';
  primaryColor: string;
  onClose: () => void;
  onSubmit: (data: Omit<Recipe, 'id' | 'isFavorited'>) => void;
}

const DIFFICULTIES: DifficultyLevel[] = ['Dễ', 'Trung bình', 'Khó'];
const INGREDIENT_CATEGORIES = ['Thịt cá', 'Rau củ', 'Gia vị', 'Đồ khô', 'Khác'];

const emptyIngredient = (): Ingredient => ({
  id: 'ing_' + Date.now() + Math.random(),
  category: 'Thịt cá',
  name: '',
  amount: 0,
  unit: 'g',
});

const emptySpice = (): Ingredient => ({
  id: 'spice_' + Date.now() + Math.random(),
  category: 'Gia vị',
  name: '',
  amount: 0,
  unit: '',
});

const emptyStep = (): CookingStep => ({
  id: 'step_' + Date.now() + Math.random(),
  description: '',
});

const parseQuantity = (str: string): { amount: number; unit: string } => {
  const trimmed = str.trim();
  const match = trimmed.match(/^([\d.,]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1].replace(',', '.'));
    return {
      amount: isNaN(num) ? 0 : num,
      unit: match[2] || '',
    };
  }
  return {
    amount: 0,
    unit: trimmed,
  };
};

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  mode,
  recipe,
  role,
  primaryColor,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState(() => (mode === 'edit' && recipe ? recipe.name : ''));
  const [cookTime, setCookTime] = useState(() => (mode === 'edit' && recipe ? recipe.cookTimeMinutes : 30));
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(() => (mode === 'edit' && recipe ? recipe.difficulty : 'Dễ'));
  const [servings, setServings] = useState<number>(() => (mode === 'edit' && recipe ? recipe.servings : 4));
  const [emoji] = useState(() => (mode === 'edit' && recipe ? recipe.emoji : '🍽️'));
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (mode === 'edit' && recipe && recipe.ingredients.length > 0) {
      const filtered = recipe.ingredients.filter((i) => i.category !== 'Gia vị');
      return filtered.length > 0 ? filtered : [emptyIngredient()];
    }
    return [emptyIngredient()];
  });

  const [spices, setSpices] = useState<Ingredient[]>(() => {
    if (mode === 'edit' && recipe && recipe.ingredients.length > 0) {
      const filtered = recipe.ingredients.filter((i) => i.category === 'Gia vị');
      return filtered.length > 0 ? filtered : [emptySpice()];
    }
    return [emptySpice()];
  });

  const [steps, setSteps] = useState<CookingStep[]>(() =>
    mode === 'edit' && recipe && recipe.steps.length > 0
      ? recipe.steps
      : [emptyStep()]
  );

  if (!isOpen) return null;

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const handleSpiceChange = (id: string, field: keyof Ingredient, value: string | number) => {
    setSpices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSpiceQtyChange = (id: string, value: string) => {
    const parsed = parseQuantity(value);
    setSpices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, amount: parsed.amount, unit: parsed.unit } : s))
    );
  };

  const formatSpiceQty = (spice: Ingredient): string => {
    if (spice.amount === 0) return spice.unit;
    return `${spice.amount} ${spice.unit}`.trim();
  };

  const handleStepChange = (id: string, value: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, description: value } : s))
    );
  };

  const handleSubmit = () => {
    const validIngredients = ingredients.filter((i) => i.name.trim());
    const validSteps = steps.filter((s) => s.description.trim());

    if (!name.trim() || !servings || validIngredients.length === 0 || validSteps.length === 0) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const finalIngredients = [
      ...validIngredients,
      ...spices.filter((s) => s.name.trim()),
    ];

    onSubmit({
      name: name.trim(),
      emoji,
      cookTimeMinutes: cookTime,
      difficulty,
      servings,
      ingredients: finalIngredients,
      steps: validSteps,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" id="recipe-form-modal" onClick={onClose}>
      <div
        className="modal-sheet modal-sheet--form"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row */}
        <div className="modal-form-header-row">
          <h2 className="modal-form-title">
            {mode === 'create' ? 'Thêm công thức cá nhân' : 'Sửa công thức cá nhân'}
          </h2>
          <button
            id="recipe-form-close-btn"
            type="button"
            className="recipe-detail-close-btn"
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className="modal-form-scroll">
          {/* Dish name */}
          <div className="form-group">
            <label className="form-label" htmlFor="recipe-form-name">
              Tên món ăn <span className="form-required">*</span>
            </label>
            <input
              id="recipe-form-name"
              type="text"
              className="form-input"
              placeholder="Thịt bò xào cà chua"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Cook time & difficulty */}
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label" htmlFor="recipe-form-time">Thời gian nấu</label>
              <input
                id="recipe-form-time"
                type="number"
                className="form-input"
                placeholder="25 phút"
                value={cookTime}
                min={1}
                onChange={(e) => setCookTime(Number(e.target.value))}
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label" htmlFor="recipe-form-difficulty">Độ khó</label>
              <select
                id="recipe-form-difficulty"
                className="form-input"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ingredient info section */}
          <div className="form-section-box" style={{ background: role === 'homemaker' ? '#FFE0B2' : '#BBDEFB' }}>
            <h4 className="figma-section-title">Thông tin nguyên liệu</h4>

            {/* Servings */}
            <div className="figma-servings-input-wrapper">
              <div className="figma-label-row">
                <span className="figma-label">Khẩu phần ăn <span className="form-required">*</span></span>
              </div>
              <input
                id="recipe-form-servings"
                type="text"
                className="figma-servings-input"
                placeholder="Ví dụ: 2 người..."
                value={servings ? `${servings} người` : ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setServings(parseInt(val) || 0);
                }}
              />
            </div>

            {/* Ingredient list */}
            <div className="figma-label-row">
              <span className="figma-label">Danh sách nguyên liệu <span className="form-required">*</span></span>
            </div>

            {ingredients.map((ing) => (
              <div key={ing.id} className="figma-ingredient-card">
                {/* Upper part: Name */}
                <div className="figma-ingredient-card-top">
                  <input
                    type="text"
                    className="figma-ingredient-card-input-name"
                    placeholder="Tên nguyên liệu..."
                    title="Tên nguyên liệu"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(ing.id, 'name', e.target.value)}
                  />
                </div>
                
                {/* Divider */}
                <div className="figma-ingredient-card-divider" />
                
                {/* Bottom part: Category, Amount, Unit */}
                <div className="figma-ingredient-card-bottom">
                  <div className="figma-category-select-wrapper">
                    <select
                      title="Phân loại"
                      className={`figma-category-select figma-category-select-${role}`}
                      value={ing.category}
                      onChange={(e) => handleIngredientChange(ing.id, 'category', e.target.value)}
                      style={{ paddingRight: '18px' }}
                    >
                      {INGREDIENT_CATEGORIES.filter(c => c !== 'Gia vị').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <span style={{
                      marginLeft: '-14px',
                      pointerEvents: 'none',
                      fontSize: '7px',
                      color: role === 'homemaker' ? '#FF8A00' : '#1E88E5'
                    }}>▼</span>
                  </div>
                  
                  <div className="figma-card-v-divider" />
                  
                  <input
                    type="number"
                    className="figma-ingredient-card-input-qty"
                    placeholder="Số lượng"
                    title="Số lượng"
                    value={ing.amount || ''}
                    min={0}
                    onChange={(e) => handleIngredientChange(ing.id, 'amount', Number(e.target.value))}
                  />
                  
                  <div className="figma-card-v-divider" />
                  
                  <input
                    type="text"
                    className="figma-ingredient-card-input-unit"
                    placeholder="g"
                    title="Đơn vị"
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(ing.id, 'unit', e.target.value)}
                  />
                </div>
              </div>
            ))}

            <button
              id="recipe-form-add-ingredient-btn"
              type="button"
              className="form-add-btn"
              style={{ color: primaryColor }}
              onClick={() => setIngredients((p) => [...p, emptyIngredient()])}
            >
              + Thêm nguyên liệu
            </button>

            {/* Seasoning list */}
            <div className="figma-label-row" style={{ marginTop: 12 }}>
              <span className="figma-label">Danh sách gia vị</span>
            </div>

            {spices.map((spice) => (
              <div key={spice.id} className="figma-spice-row">
                <input
                  type="text"
                  className="figma-spice-input-name"
                  placeholder="Gia vị..."
                  title="Gia vị"
                  value={spice.name}
                  onChange={(e) => handleSpiceChange(spice.id, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="figma-spice-input-qty"
                  placeholder="Định lượng"
                  title="Định lượng"
                  value={formatSpiceQty(spice)}
                  onChange={(e) => handleSpiceQtyChange(spice.id, e.target.value)}
                />
              </div>
            ))}

            <button
              id="recipe-form-add-spice-btn"
              type="button"
              className="form-add-btn"
              style={{ color: primaryColor }}
              onClick={() => setSpices((p) => [...p, emptySpice()])}
            >
              + Thêm gia vị
            </button>
          </div>

          {/* Cooking steps */}
          <div className="form-group">
            <label className="form-label">
              Các bước thực hiện <span className="form-required">*</span>
            </label>
            {steps.map((step, idx) => (
              <div key={step.id} className="form-step-row">
                <span className="form-step-label">Bước {idx + 1}:</span>
                <input
                  type="text"
                  className="form-input form-input--grow"
                  placeholder="Sơ chế thịt bò..."
                  title={`Nội dung bước ${idx + 1}`}
                  value={step.description}
                  onChange={(e) => handleStepChange(step.id, e.target.value)}
                />
              </div>
            ))}
            <button
              id="recipe-form-add-step-btn"
              type="button"
              className="form-add-btn"
              style={{ color: primaryColor }}
              onClick={() => setSteps((p) => [...p, emptyStep()])}
            >
              + Thêm bước làm
            </button>
          </div>

          {/* Image upload (UI only) */}
          <div className="form-group">
            <label className="form-label">Hình ảnh món ăn</label>
            <div className="form-image-preview">
              <span style={{ fontSize: 64 }}>{emoji}</span>
            </div>
            <div className="form-image-actions">
              <button id="recipe-form-pick-image-btn" type="button" className="form-image-btn">
                📷 Chọn ảnh
              </button>
              <button id="recipe-form-take-photo-btn" type="button" className="form-image-btn">
                📷 Chụp ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-form-footer">
          <button
            id="recipe-form-submit-btn"
            type="button"
            className="recipe-detail-primary-btn"
            style={{ background: primaryColor }}
            onClick={handleSubmit}
          >
            {mode === 'create' ? 'Lưu công thức' : 'Lưu thay đổi'}
          </button>
          <button
            id="recipe-form-cancel-btn"
            type="button"
            className="recipe-detail-outline-btn"
            onClick={onClose}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeFormModal;
