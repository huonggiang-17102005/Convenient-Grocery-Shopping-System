import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Clock, Flame } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { recipesService } from '../../recipes/recipes.service';
import './AiRecipeModal.css';

interface AiRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeSaved?: (newRecipe: any) => void;
}

const AiRecipeModal: React.FC<AiRecipeModalProps> = ({ isOpen, onClose, onRecipeSaved }) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const parseIngredientString = (str: string) => {
    const trimmed = str.trim();
    const pattern1 = trimmed.match(/^([\d.,]+)\s*([a-zA-Z\u00C0-\u1EF9]+)\s+(.+)$/);
    if (pattern1) {
      return {
        name: pattern1[3].trim(),
        amount: parseFloat(pattern1[1].replace(',', '.')) || 1,
        unit: pattern1[2].trim(),
        category: 'Khác'
      };
    }
    const pattern2 = trimmed.match(/^([\d.,]+)\s+(.+)$/);
    if (pattern2) {
      const qty = parseFloat(pattern2[1].replace(',', '.')) || 1;
      const rest = pattern2[2].trim();
      const parts = rest.split(/\s+/);
      if (parts.length > 1) {
        return {
          name: parts.slice(1).join(' '),
          amount: qty,
          unit: parts[0],
          category: 'Khác'
        };
      }
      return {
        name: rest,
        amount: qty,
        unit: 'phần',
        category: 'Khác'
      };
    }
    return {
      name: trimmed,
      amount: 1,
      unit: 'phần',
      category: 'Khác'
    };
  };

  const handleSaveRecipe = async (aiRecipe: any, index: number) => {
    try {
      const parsedIngredients = (aiRecipe.ingredients || []).map((ing: any, idx: number) => {
        if (typeof ing === 'string') {
          const parsed = parseIngredientString(ing);
          return {
            id: `ing_ai_${Date.now()}_${idx}`,
            ...parsed
          };
        } else {
          return {
            id: `ing_ai_${Date.now()}_${idx}`,
            name: ing?.name || '',
            amount: Number(ing?.amount) || 1,
            unit: ing?.unit || 'g',
            category: ing?.category || 'Khác'
          };
        }
      });

      const cookTime = parseInt(aiRecipe.prepTime?.replace(/[^0-9]/g, '')) || 30;

      const saved = await recipesService.createRecipe({
        name: aiRecipe.title,
        emoji: '🍽️',
        cookTimeMinutes: cookTime,
        difficulty: 'Trung bình',
        servings: 4,
        ingredients: parsedIngredients,
        steps: (aiRecipe.instructions || []).map((step: string, idx: number) => ({
          id: `step_ai_${Date.now()}_${idx}`,
          description: step
        })),
        calories: aiRecipe.calories || 0,
        protein: aiRecipe.protein || 0,
        fat: aiRecipe.fat || 0,
        carbs: aiRecipe.carbs || 0,
        visibility: 'Private'
      });

      if (onRecipeSaved) {
        onRecipeSaved(saved);
      }

      setSavedIndexes((prev) => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
    } catch (err: any) {
      console.error(err);
      alert('Không thể lưu công thức. Vui lòng thử lại sau.');
    }
  };

  const handleGenerate = async () => {
    if (!user?.family_id) return;
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/ai/recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId: user.family_id, prompt })
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(Array.isArray(data.data) ? data.data : [data.data]);
      } else {
        setError(data.message || 'Lỗi khi gọi AI');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content ai-modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Sparkles color="#7C4DFF" />
             <h2>AI Gợi Ý Món Ăn</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body ai-modal-body">
            <div className="ai-input-group">
                <label>Bạn đang muốn ăn gì?</label>
                <textarea 
                    placeholder="Ví dụ: Nấu món gì đó nhạt, ít calo, phù hợp cho người đang giảm cân..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={3}
                />
            </div>
            
            <button 
                className={`ai-generate-btn ${loading ? 'loading' : ''}`} 
                onClick={handleGenerate}
                disabled={loading}
            >
                {loading ? '✨ AI đang suy nghĩ...' : '✨ Tạo Công Thức Bằng AI'}
            </button>

            {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

            {recipes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
                    {recipes.map((recipe, index) => (
                        <div className="ai-result-card" key={index}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                              <h3 className="recipe-title" style={{ margin: 0 }}><ChefHat size={20}/> {recipe.title}</h3>
                              <button
                                type="button"
                                disabled={savedIndexes.has(index)}
                                onClick={() => handleSaveRecipe(recipe, index)}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  color: 'white',
                                  background: savedIndexes.has(index) ? '#4CAF50' : '#7C4DFF',
                                  border: 'none',
                                  borderRadius: '8px',
                                  cursor: savedIndexes.has(index) ? 'default' : 'pointer',
                                  fontFamily: 'Plus Jakarta Sans',
                                  transition: 'background 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {savedIndexes.has(index) ? '✓ Đã lưu' : '💾 Lưu vào thư viện'}
                              </button>
                            </div>
                            
                            <div className="recipe-meta-row">
                                <span className="meta-badge"><Clock size={16}/> {recipe.prepTime}</span>
                                <span className="meta-badge calories"><Flame size={16}/> {recipe.calories} kcal</span>
                            </div>

                            <div className="nutrition-row">
                                <div className="nutri-box"><span className="label">Protein</span><span className="val">{recipe.protein}g</span></div>
                                <div className="nutri-box"><span className="label">Fat</span><span className="val">{recipe.fat}g</span></div>
                                <div className="nutri-box"><span className="label">Carbs</span><span className="val">{recipe.carbs}g</span></div>
                            </div>

                            <div className="recipe-section">
                                <h4>Nguyên liệu cần dùng:</h4>
                                <ul className="ingredient-list">
                                    {recipe.ingredients?.map((ing: any, i: number) => {
                                      const formatIngredient = (item: any) => {
                                        if (typeof item === 'string') return item;
                                        if (!item) return '';
                                        return `${item.amount} ${item.unit === 'any' ? '' : item.unit} ${item.name}`.replace(/\s+/g, ' ').trim();
                                      };
                                      return <li key={i}>{formatIngredient(ing)}</li>;
                                    }) || <li>Không có thông tin nguyên liệu</li>}
                                </ul>
                            </div>

                            <div className="recipe-section">
                                <h4>Hướng dẫn:</h4>
                                <ol className="instruction-list">
                                    {recipe.instructions?.map((inst: string, i: number) => <li key={i}>{inst}</li>) || <li>Không có hướng dẫn</li>}
                                </ol>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AiRecipeModal;
