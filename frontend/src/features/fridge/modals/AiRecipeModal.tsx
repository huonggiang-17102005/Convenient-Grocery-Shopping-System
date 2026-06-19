import React, { useState } from 'react';
import { X, Sparkles, ChefHat, Clock, Flame } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import './AiRecipeModal.css';

interface AiRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AiRecipeModal: React.FC<AiRecipeModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!user?.family_id) return;
    setLoading(true);
    setError('');
    setRecipes([]);
    try {
      const res = await fetch(`http://localhost:5000/api/ai/recipe`, {
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

  return (
    <div className="modal-overlay">
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
                            <h3 className="recipe-title"><ChefHat size={20}/> {recipe.title}</h3>
                            
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
                                    {recipe.ingredients?.map((ing: string, i: number) => <li key={i}>{ing}</li>) || <li>Không có thông tin nguyên liệu</li>}
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
