// src/features/recipes/modals/ShareCommunityModal.tsx
// Full-form community share modal, same as RecipeFormModal but with description + "Gửi bài viết" action

import React, { useState } from 'react';
import type { Recipe, Ingredient, CookingStep, DifficultyLevel } from '../types';

interface ShareCommunityModalProps {
  isOpen: boolean;
  role: 'homemaker' | 'member';
  primaryColor: string;
  onClose: () => void;
  onSubmit: (description: string, recipeData: Omit<Recipe, 'id' | 'isFavorited'>) => void;
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

const matchFoodEmoji = (nameStr: string): string => {
  const lower = nameStr.toLowerCase();
  if (lower.includes('bò') || lower.includes('beef')) return '🥩';
  if (lower.includes('gà') || lower.includes('chicken')) return '🍗';
  if (lower.includes('cá') || lower.includes('fish')) return '🐟';
  if (lower.includes('tôm') || lower.includes('shrimp')) return '🍤';
  if (lower.includes('cà chua') || lower.includes('tomato')) return '🍅';
  if (lower.includes('bông cải') || lower.includes('súp lơ') || lower.includes('broccoli')) return '🥦';
  if (lower.includes('kho') || lower.includes('tộ')) return '🍲';
  if (lower.includes('mì') || lower.includes('phở') || lower.includes('noodles') || lower.includes('bún')) return '🍜';
  if (lower.includes('canh') || lower.includes('súp') || lower.includes('soup') || lower.includes('riêu')) return '🥣';
  if (lower.includes('trứng') || lower.includes('egg')) return '🍳';
  return '🍽️';
};

const ShareCommunityModal: React.FC<ShareCommunityModalProps> = ({
  isOpen,
  role,
  primaryColor,
  onClose,
  onSubmit,
}) => {
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [cookTime, setCookTime] = useState(30);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Dễ');
  const [servings, setServings] = useState(4);
  const [emoji] = useState('🍽️');
  const [ingredients, setIngredients] = useState<Ingredient[]>([emptyIngredient()]);
  const [spices, setSpices] = useState<Ingredient[]>([emptySpice()]);
  const [steps, setSteps] = useState<CookingStep[]>([emptyStep()]);

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

    const finalEmoji = emoji === '🍽️' ? matchFoodEmoji(name) : emoji;
    const finalIngredients = [
      ...validIngredients,
      ...spices.filter((s) => s.name.trim()),
    ];

    onSubmit(description.trim(), {
      name: name.trim(),
      emoji: finalEmoji,
      cookTimeMinutes: cookTime,
      difficulty,
      servings,
      ingredients: finalIngredients,
      steps: validSteps,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" id="share-community-modal" onClick={onClose}>
      <div
        className="modal-sheet modal-sheet--form"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Row */}
        <div className="modal-form-header-row">
          <h2 className="modal-form-title">Chia sẻ công thức</h2>
          <button
            id="share-form-close-btn"
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
            <label className="form-label" htmlFor="share-form-name">
              Tên món ăn <span className="form-required">*</span>
            </label>
            <input
              id="share-form-name"
              type="text"
              className="form-input"
              placeholder="Ví dụ: Thịt bò xào rau củ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="share-form-description">Mô tả món ăn</label>
            <textarea
              id="share-form-description"
              className="form-input form-textarea"
              placeholder="Chia sẻ ngắn gọn về món ăn này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Cook time & difficulty */}
          <div className="form-row">
            <div className="form-group form-group--half">
              <label className="form-label" htmlFor="share-form-time">Thời gian nấu</label>
              <input
                id="share-form-time"
                type="number"
                className="form-input"
                placeholder="Ví dụ: 30 phút"
                value={cookTime || ''}
                min={1}
                onChange={(e) => setCookTime(Number(e.target.value))}
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label" htmlFor="share-form-difficulty">Độ khó</label>
              <select
                id="share-form-difficulty"
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
                id="share-form-servings"
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
              id="share-form-add-ingredient-btn"
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
              id="share-form-add-spice-btn"
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
                  placeholder="Sơ chế nguyên liệu..."
                  title={`Nội dung bước ${idx + 1}`}
                  value={step.description}
                  onChange={(e) => handleStepChange(step.id, e.target.value)}
                />
              </div>
            ))}
            <button
              id="share-form-add-step-btn"
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
              <button id="share-form-pick-image-btn" type="button" className="form-image-btn">
                📷 Chọn ảnh
              </button>
              <button id="share-form-take-photo-btn" type="button" className="form-image-btn">
                📷 Chụp ảnh
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-form-footer">
          <button
            id="share-form-submit-btn"
            type="button"
            className="recipe-detail-primary-btn"
            style={{ background: primaryColor }}
            onClick={handleSubmit}
          >
            Gửi bài viết
          </button>
          <button
            id="share-form-cancel-btn"
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

export default ShareCommunityModal;
