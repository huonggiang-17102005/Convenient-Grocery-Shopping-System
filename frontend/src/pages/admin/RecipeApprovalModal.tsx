import React, { useState, useEffect } from 'react';
import './RecipeApprovalModal.css';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface PendingRecipe {
  id: string;
  name: string;
  author: { full_name: string } | null;
  created_at: string;
  image_url: string | null;
  description?: string;
  servings?: number;
  ingredients?: Ingredient[];
  instructions?: string[];
}

interface Props {
  recipe: PendingRecipe | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const CRITERIA = [
  'Nội dung phù hợp, không vi phạm cộng đồng',
  'Nguyên liệu được liệt kê rõ ràng, đầy đủ',
  'Các bước thực hiện chi tiết, dễ theo dõi',
  'Hình ảnh thực tế, chất lượng đạt chuẩn',
  'Khẩu phần và thời gian nấu hợp lý'
];

const RecipeApprovalModal: React.FC<Props> = ({ recipe, onClose, onApprove, onReject }) => {
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false, false]);

  // Reset checked state when recipe changes
  useEffect(() => {
    setChecked([false, false, false, false, false]);
  }, [recipe]);

  if (!recipe) return null;

  const toggleCheck = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  const checkedCount = checked.filter(Boolean).length;
  const isAllChecked = checkedCount === CRITERIA.length;

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const date = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    return `${time} - ${date}`;
  };

  return (
    <div className="ra-modal-overlay">
      <div className="ra-modal-container">
        {/* LEFT SIDE: PREVIEW */}
        <div className="ra-modal-left">
          <div className="ra-modal-left-header">XEM TRƯỚC NỘI DUNG</div>
          <div className="ra-modal-preview-card">
            <div className="ra-modal-image-container">
              {recipe.image_url ? (
                <img src={recipe.image_url} alt={recipe.name} onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/500x300/e0e0e0/757575?text=L%E1%BB%97i+%E1%BA%A3nh';
                }} />
              ) : (
                <div className="ra-modal-no-image">Không có ảnh</div>
              )}
            </div>
            
            <div className="ra-modal-preview-content">
              <h2 className="ra-modal-recipe-title">{recipe.name}</h2>
              <p className="ra-modal-recipe-desc">{recipe.description || 'Không có mô tả'}</p>

              <div className="ra-modal-section-title">KHẨU PHẦN</div>
              <p className="ra-modal-servings">{recipe.servings || 1} người</p>

              <div className="ra-modal-section-title">NGUYÊN LIỆU</div>
              <div className="ra-modal-ingredients">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  recipe.ingredients.map((ing, idx) => (
                    <span key={idx} className="ra-modal-ingredient-pill">
                      {ing.name} - {ing.quantity} {ing.unit}
                    </span>
                  ))
                ) : (
                  <span>Chưa có thông tin nguyên liệu</span>
                )}
              </div>

              <div className="ra-modal-section-title">CÁC BƯỚC THỰC HIỆN</div>
              <div className="ra-modal-instructions">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  recipe.instructions.map((step, idx) => (
                    <div key={idx} className="ra-modal-instruction-step">
                      <div className="ra-modal-step-number">{idx + 1}</div>
                      <div className="ra-modal-step-text">{step}</div>
                    </div>
                  ))
                ) : (
                  <span>Chưa có thông tin các bước thực hiện</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: EVALUATION */}
        <div className="ra-modal-right">
          <div className="ra-modal-right-header">
            <h2>Đánh giá công thức</h2>
            <button className="ra-modal-close-btn" onClick={onClose}>&times;</button>
          </div>
          
          <div className="ra-modal-author-info">
            <div><strong>Người đăng:</strong> {recipe.author?.full_name || 'Không rõ'}</div>
            <div><strong>Thời gian gửi:</strong> {formatDate(recipe.created_at)}</div>
          </div>

          <div className="ra-modal-divider"></div>

          <div className="ra-modal-criteria-header">
            <span className="ra-modal-criteria-title">TIÊU CHÍ KIỂM DUYỆT</span>
            <span className="ra-modal-criteria-count">{checkedCount}/{CRITERIA.length} đã xác nhận</span>
          </div>

          <div className="ra-modal-criteria-list">
            {CRITERIA.map((criterion, idx) => {
              const isChecked = checked[idx];
              return (
                <div 
                  key={idx} 
                  className={`ra-modal-criteria-item ${isChecked ? 'checked' : ''}`}
                  onClick={() => toggleCheck(idx)}
                >
                  <div className={`ra-modal-checkbox ${isChecked ? 'checked' : ''}`}>
                    {isChecked && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span>{criterion}</span>
                </div>
              );
            })}
          </div>

          <div className="ra-modal-progress-bar">
            <div 
              className="ra-modal-progress-fill" 
              style={{ width: `${(checkedCount / CRITERIA.length) * 100}%` }}
            ></div>
          </div>
          <div className="ra-modal-progress-text">
            Tick đủ 5 tiêu chí để mở khóa phê duyệt
          </div>

          <div className="ra-modal-actions">
            <button className="ra-modal-btn reject" onClick={() => onReject(recipe.id)}>
              Từ chối duyệt
            </button>
            <button 
              className={`ra-modal-btn approve ${isAllChecked ? 'enabled' : 'disabled'}`} 
              disabled={!isAllChecked}
              onClick={() => onApprove(recipe.id)}
            >
              Phê duyệt công thức
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeApprovalModal;
