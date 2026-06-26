// src/features/recipes/modals/RecipeFormModal.tsx
// Shared form for both Add and Edit personal recipe

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import type { Recipe, Ingredient, CookingStep, DifficultyLevel } from '../types';
import ImageWithFallback from '../../../components/common/ImageWithFallback';
import { useCategoryContext } from '../../../contexts/CategoryContext';
import CustomSelect from '../../../components/common/CustomSelect';
import { fridgeService } from '../../fridge/fridge.service';
import { recipesService } from '../recipes.service';

interface RecipeFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  recipe?: Recipe | null;
  role?: 'homemaker' | 'member';
  onClose: () => void;
  onSubmit: (data: Omit<Recipe, 'id' | 'isFavorited'>) => void;
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
    unit: '', // Default to empty instead of 'any'
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

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({
  isOpen,
  mode,
  recipe,
  role = 'homemaker',
  onClose,
  onSubmit,
}) => {
  const { categoriesData } = useCategoryContext();
  const primaryColor = role === 'member' ? '#1E88E5' : '#FF8A00';

  const [name, setName] = useState(() => (mode === 'edit' && recipe ? recipe.name : ''));
  const [cookTime, setCookTime] = useState<number | ''>(() => (mode === 'edit' && recipe ? recipe.cookTimeMinutes : ''));
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>(() => (mode === 'edit' && recipe ? recipe.difficulty : ''));
  const [servings, setServings] = useState<number | ''>(() => (mode === 'edit' && recipe ? recipe.servings : ''));
  const [emoji] = useState(() => (mode === 'edit' && recipe ? recipe.emoji : '🍽️'));
  const [imageUrl, setImageUrl] = useState(() => (mode === 'edit' && recipe ? recipe.imageUrl || '' : ''));
  const [imagePublicId, setImagePublicId] = useState(() => (mode === 'edit' && recipe ? recipe.imagePublicId || '' : ''));
  const [isUploading, setIsUploading] = useState(false);
  
  const [calories, setCalories] = useState<number | ''>(() => (mode === 'edit' && recipe ? recipe.calories || '' : ''));
  const [protein, setProtein] = useState<number | ''>(() => (mode === 'edit' && recipe ? recipe.protein || '' : ''));
  const [fat, setFat] = useState<number | ''>(() => (mode === 'edit' && recipe ? recipe.fat || '' : ''));
  const [carbs, setCarbs] = useState<number | ''>(() => (mode === 'edit' && recipe ? recipe.carbs || '' : ''));
  const [isEstimating, setIsEstimating] = useState(false);

  const handleEstimateNutrition = async () => {
    const validIngredients = ingredients.filter((i) => i.name.trim() && i.amount > 0);
    const validSpices = spices.filter((s) => s.name.trim());
    const allIngs = [
      ...validIngredients.map(i => ({ name: i.name, quantity: i.amount, unit: i.unit })),
      ...validSpices.map(s => ({ name: s.name, quantity: s.amount || 0, unit: s.unit }))
    ];
    const validSteps = steps.filter((s) => s.description.trim()).map(s => s.description);

    if (allIngs.length === 0) {
      alert('Vui lòng nhập nguyên liệu trước khi tính toán dinh dưỡng!');
      return;
    }

    setIsEstimating(true);
    try {
      const res = await recipesService.estimateNutrition(allIngs, validSteps.length > 0 ? validSteps : ['Nấu món ăn']);
      setCalories(res.calories);
      setProtein(res.protein);
      setFat(res.fat);
      setCarbs(res.carbs);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Không thể tính toán dinh dưỡng bằng AI. Vui lòng thử lại sau.');
    } finally {
      setIsEstimating(false);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (mode === 'edit' && recipe && recipe.ingredients.length > 0) {
      const filtered = recipe.ingredients.filter((i) => i.category !== 'Gia vị');
      return filtered.length > 0 ? filtered : [];
    }
    return [];
  });

  const [spices, setSpices] = useState<Ingredient[]>(() => {
    if (mode === 'edit' && recipe && recipe.ingredients.length > 0) {
      const filtered = recipe.ingredients.filter((i) => i.category === 'Gia vị');
      return filtered.length > 0 ? filtered : [];
    }
    return [];
  });

  const [steps, setSteps] = useState<CookingStep[]>(() =>
    mode === 'edit' && recipe && recipe.steps.length > 0
      ? recipe.steps
      : [emptyStep()]
  );

  const availableCategories = categoriesData.map(c => c.category);
  const [rawQtys, setRawQtys] = useState<Record<string, string>>({});

  const getAvailableUnits = (category: string) => {
    const data = categoriesData.find(c => c.category === category);
    return data?.units || [];
  };

  useEffect(() => {
    if (mode === 'create' && categoriesData.length > 0) {
      if (ingredients.length === 0) setIngredients([createEmptyIngredient()]);
      if (spices.length === 0) setSpices([createEmptySpice(categoriesData)]);
    }
  }, [categoriesData, mode, ingredients.length, spices.length]);

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
        // Auto update unit when category changes
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
    setRawQtys((prev) => ({ ...prev, [id]: value }));
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

    const finalIngredients = [
      ...validIngredients,
      ...spices.filter((s) => s.name.trim()),
    ];

    onSubmit({
      name: name.trim(),
      emoji,
      imageUrl: imageUrl.trim() || undefined,
      imagePublicId: imagePublicId.trim() || undefined,
      cookTimeMinutes: Number(cookTime),
      difficulty: difficulty as DifficultyLevel,
      servings: Number(servings),
      ingredients: finalIngredients,
      steps: validSteps,
      calories: calories === '' ? 0 : Number(calories),
      protein: protein === '' ? 0 : Number(protein),
      fat: fat === '' ? 0 : Number(fat),
      carbs: carbs === '' ? 0 : Number(carbs),
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
              <label className="form-label" htmlFor="recipe-form-time">Thời gian nấu <span className="form-required">*</span></label>
              <input
                id="recipe-form-time"
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

            {/* Nutrition inputs */}
            <div style={{ marginTop: '16px', background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1A1A1A', fontFamily: 'Plus Jakarta Sans' }}>Dinh dưỡng (trên 1 phần)</span>
                <button
                  type="button"
                  onClick={handleEstimateNutrition}
                  disabled={isEstimating}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'white',
                    background: primaryColor,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: isEstimating ? 0.7 : 1,
                    fontFamily: 'Plus Jakarta Sans'
                  }}
                >
                  {isEstimating ? '⚡ Đang tính...' : '⚡ AI tính dinh dưỡng'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#64748B', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Calo (kcal)</label>
                  <input
                    type="number"
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 6px', fontSize: '12px', textAlign: 'center' }}
                    placeholder="Calo"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#64748B', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Protein (g)</label>
                  <input
                    type="number"
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 6px', fontSize: '12px', textAlign: 'center' }}
                    placeholder="Prot"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#64748B', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Fat (g)</label>
                  <input
                    type="number"
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 6px', fontSize: '12px', textAlign: 'center' }}
                    placeholder="Béo"
                    value={fat}
                    onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#64748B', fontFamily: 'Plus Jakarta Sans', fontWeight: '500' }}>Carbs (g)</label>
                  <input
                    type="number"
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #CBD5E1', padding: '0 6px', fontSize: '12px', textAlign: 'center' }}
                    placeholder="Carb"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>
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
              id="recipe-form-add-ingredient-btn"
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
                  value={rawQtys[spice.id] ?? formatSpiceQty(spice)}
                  onChange={(e) => handleSpiceQtyChange(spice.id, e.target.value)}
                />
              </div>
            ))}

            <button
              id="recipe-form-add-spice-btn"
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
              onClick={() => setSteps((p) => [...p, emptyStep()])}
            >
              + Thêm bước làm
            </button>
          </div>

          {/* Image URL Input & Preview */}
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
                <span style={{ fontSize: 64 }}>{emoji}</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="modal-form-footer">
          <button
            id="recipe-form-submit-btn"
            type="button"
            className="recipe-detail-primary-btn"
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
