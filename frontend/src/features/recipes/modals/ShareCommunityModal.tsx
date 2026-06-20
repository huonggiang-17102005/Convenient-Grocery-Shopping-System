// src/features/recipes/modals/ShareCommunityModal.tsx
// Full-form community share modal, same as RecipeFormModal but with description + "Gửi bài viết" action

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import type { Recipe, Ingredient, CookingStep, DifficultyLevel } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';
import { useCategoryContext } from '../../../contexts/CategoryContext';
import CustomSelect from '../../../components/common/CustomSelect';
import { fridgeService } from '../../fridge/fridge.service';

interface ShareCommunityModalProps {
  isOpen: boolean;
  role?: 'homemaker' | 'member';
  onClose: () => void;
  onSubmit: (description: string, recipeData: Omit<Recipe, 'id' | 'isFavorited'>) => void;
}

const DIFFICULTIES: DifficultyLevel[] = ['Dễ', 'Trung bình', 'Khó'];

const createEmptyIngredient = (): Ingredient => {
  return {
    id: 'ing_' + Date.now() + Math.random(),
    category: '',
    name: '',
    amount: 0,
    unit: '',
  };
};

const createEmptySpice = (categoriesData: any[]): Ingredient => {
  const spiceCategory = categoriesData.find(c => c.category === 'Gia vị');
  return {
    id: 'spice_' + Date.now() + Math.random(),
    category: spiceCategory?.category || 'Gia vị',
    name: '',
    amount: 0,
    unit: spiceCategory?.units?.[0] || '',
  };
};

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
  role = 'homemaker',
  onClose,
  onSubmit,
}) => {
  const { categoriesData } = useCategoryContext();
  const primaryColor = role === 'member' ? '#1E88E5' : '#FF8A00';

  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [cookTime, setCookTime] = useState<number | ''>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
  const [servings, setServings] = useState<number | ''>('');
  const [emoji] = useState('🍽️');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [spices, setSpices] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<CookingStep[]>([emptyStep()]);

  const availableCategories = categoriesData.map(c => c.category);

  const getAvailableUnits = (category: string) => {
    const data = categoriesData.find(c => c.category === category);
    return data?.units || [];
  };

  useEffect(() => {
    if (isOpen && categoriesData.length > 0) {
      if (ingredients.length === 0) setIngredients([createEmptyIngredient()]);
      if (spices.length === 0) setSpices([createEmptySpice(categoriesData)]);
    }
  }, [isOpen, categoriesData, ingredients.length, spices.length]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const data = await fridgeService.uploadImage(file);
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImagePublicId(data.imagePublicId || '');
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleIngredientChange = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients((prev) =>
      prev.map((ing) => {
        if (ing.id !== id) return ing;
        const newIng = { ...ing, [field]: value };
        if (field === 'category') {
          const newUnits = getAvailableUnits(value as string);
          if (newUnits.length > 0) {
            newIng.unit = newUnits[0];
          }
        }
        return newIng;
      })
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
    const validIngredients = ingredients.filter((i) => i.name.trim() || i.amount > 0 || i.category);
    const hasIncompleteIngredient = validIngredients.some(i => !i.name.trim() || !i.category || !i.unit);
    
    const validSteps = steps.filter((s) => s.description.trim());

    if (!name.trim() || !servings || validIngredients.length === 0 || validSteps.length === 0 || !cookTime || !difficulty) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    if (hasIncompleteIngredient) {
      alert('Vui lòng điền đầy đủ Tên, Phân loại và Đơn vị cho các nguyên liệu đã nhập!');
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
      imageUrl: imageUrl.trim() || undefined,
      imagePublicId: imagePublicId.trim() || undefined,
      cookTimeMinutes: Number(cookTime),
      difficulty: difficulty as DifficultyLevel,
      servings: Number(servings),
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
              <label className="form-label" htmlFor="share-form-time">Thời gian nấu <span className="form-required">*</span></label>
              <input
                id="share-form-time"
                type="number"
                className="form-input"
                placeholder="25 phút"
                value={cookTime}
                min={1}
                onChange={(e) => setCookTime(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="form-group form-group--half">
              <label className="form-label">Độ khó <span className="form-required">*</span></label>
              <CustomSelect
                value={difficulty}
                onChange={(v) => setDifficulty(v as DifficultyLevel)}
                options={DIFFICULTIES.map(d => ({ value: d, label: d }))}
                placeholder="- Chọn -"
                triggerHeight={52}
              />
            </div>
          </div>

          {/* Ingredient info section */}
          <div className="form-section-box">
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
                  <CustomSelect
                    value={ing.category}
                    onChange={(val) => handleIngredientChange(ing.id, 'category', val)}
                    options={availableCategories.filter(c => c !== 'Gia vị').map(c => ({ value: c, label: c }))}
                    placeholder="- Chọn -"
                    triggerHeight={22}
                    fontSize={10}
                    padding="0 6px"
                    className="figma-category-select-wrapper-custom"
                    style={{ width: '90px' }}
                  />
                  
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
                  
                  <CustomSelect
                    value={ing.unit}
                    onChange={(val) => handleIngredientChange(ing.id, 'unit', val)}
                    options={getAvailableUnits(ing.category).map(u => ({ value: u, label: u }))}
                    placeholder="-"
                    disabled={ing.category !== 'Khác'}
                    triggerHeight={22}
                    fontSize={10}
                    padding="0 6px"
                    className="figma-category-select-wrapper-custom"
                    style={{ width: '60px' }}
                  />
                </div>
              </div>
            ))}

            <button
              id="share-modal-add-ingredient-btn"
              type="button"
              className="form-add-btn"
              onClick={() => setIngredients((p) => [...p, createEmptyIngredient()])}
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
              id="share-modal-add-spice-btn"
              type="button"
              className="form-add-btn"
              onClick={() => setSpices((p) => [...p, createEmptySpice(categoriesData)])}
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
              onClick={() => setSteps((p) => [...p, emptyStep()])}
            >
              + Thêm bước làm
            </button>
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Hình ảnh món ăn (Đường dẫn URL hoặc Tải lên)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập đường dẫn ảnh từ Unsplash, Pexels..."
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); setImagePublicId(''); }}
              style={{ marginBottom: '12px' }}
            />

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <div style={{ display: 'flex', gap: 12, marginBottom: '16px' }}>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ flex: 1, height: 44, background: 'white', borderRadius: 8, outline: '1px solid #E0E0E0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer' }}>
                <ImageIcon size={18} color={primaryColor} />
                <span style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>
                  {isUploading ? 'Đang tải...' : 'Chọn ảnh'}
                </span>
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ flex: 1, height: 44, background: 'white', borderRadius: 8, outline: '1px solid #E0E0E0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, border: 'none', cursor: 'pointer' }}>
                <Camera size={18} color={primaryColor} />
                <span style={{ color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Chụp ảnh</span>
              </button>
            </div>

            <div className="form-image-preview">
              {imageUrl ? (
                <ImageWithFallback src={imageUrl} fallbackType="recipe" alt="Preview" style={{ width: '100%', height: '150px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '150px', background: '#F5F5F5', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: 64 }}>{emoji}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-form-footer">
          <button
            id="share-form-submit-btn"
            type="button"
            className="recipe-detail-primary-btn"
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
