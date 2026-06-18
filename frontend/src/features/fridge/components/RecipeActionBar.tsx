import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RecipeActionBarProps {
  selectedCount: number;
  role: 'homemaker' | 'member';
  selectedItems: string[];
}

const ROLE_COLORS = {
  homemaker: { bg: '#FFE0B2', text: '#FF8A00', btn: '#FF8A00' },
  member:    { bg: '#E3F2FF', text: '#1E88E5', btn: '#1E88E5' },
};

const RecipeActionBar: React.FC<RecipeActionBarProps> = ({ selectedCount, role, selectedItems }) => {
  const navigate = useNavigate();

  if (selectedCount === 0) return null;

  const colors = ROLE_COLORS[role];

  const handleSearchRecipes = () => {
    navigate(`/${role}/recipes`, { state: { suggestIngredients: selectedItems } });
  };

  return (
    <div className="recipe-action-bar-container">
      <div className="recipe-action-bar" style={{ background: colors.bg }}>
        <span className="recipe-action-text" style={{ color: colors.text }}>
          Tìm công thức từ {selectedCount} nguyên liệu đã chọn
        </span>
        <button
          className="recipe-action-btn"
          style={{ background: colors.btn }}
          onClick={handleSearchRecipes}
          aria-label="Tìm công thức"
        >
          <ChevronRight size={20} color="white" />
        </button>
      </div>
    </div>
  );
};

export default RecipeActionBar;
