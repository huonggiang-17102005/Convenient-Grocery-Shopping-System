// src/features/recipes/components/SearchAndFilter.tsx

import React, { useState, useRef, useEffect } from 'react';
import { FILTER_INGREDIENTS, type FilterIngredient } from '../types';

interface SearchAndFilterProps {
  selectedIngredients: FilterIngredient[];
  onChangeIngredients: (ingredients: FilterIngredient[]) => void;
  primaryColor: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  selectedIngredients,
  onChangeIngredients,
  primaryColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = FILTER_INGREDIENTS.filter(
    (ing) => ing !== 'Tất cả' && ing.toLowerCase().includes(search.toLowerCase())
  );

  const toggleIngredient = (ing: FilterIngredient) => {
    if (ing === 'Tất cả') {
      onChangeIngredients([]);
      return;
    }
    if (selectedIngredients.includes(ing)) {
      onChangeIngredients(selectedIngredients.filter((i) => i !== ing));
    } else {
      onChangeIngredients([...selectedIngredients, ing]);
    }
  };

  const displayText =
    selectedIngredients.length === 0
      ? 'Chọn nguyên liệu từ tủ lạnh...'
      : `Đã chọn ${selectedIngredients.length} nguyên liệu`;

  return (
    <div className="recipe-filter-wrapper" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        id="recipe-ingredient-filter-btn"
        type="button"
        className={`recipe-filter-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span
          className="recipe-filter-label"
          style={{ color: selectedIngredients.length > 0 ? '#1A1A1A' : '#757575', fontWeight: selectedIngredients.length > 0 ? 500 : 400 }}
        >
          {displayText}
        </span>
        <span className="recipe-filter-arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="recipe-filter-dropdown">
          {/* Search */}
          <div className="recipe-filter-search-wrap">
            <input
              id="recipe-ingredient-search"
              type="text"
              className="recipe-filter-search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* List */}
          <div className="recipe-filter-list">
            {/* Tất cả */}
            <label className="recipe-filter-item">
              <span
                className="recipe-filter-checkbox"
                style={{
                  background: selectedIngredients.length === 0 ? primaryColor : 'white',
                  border: selectedIngredients.length === 0 ? 'none' : '1.27px solid #757575',
                }}
              >
                {selectedIngredients.length === 0 && <span className="recipe-filter-check">✓</span>}
              </span>
              <span className="recipe-filter-item-label" style={{ fontWeight: 600 }}>Tất cả</span>
              <input type="checkbox" hidden onChange={() => toggleIngredient('Tất cả')} />
            </label>

            {/* Other ingredients */}
            {(search ? filtered : FILTER_INGREDIENTS.filter((i) => i !== 'Tất cả')).map((ing) => {
              const isChecked = selectedIngredients.includes(ing as FilterIngredient);
              return (
                <label key={ing} className="recipe-filter-item">
                  <span
                    className="recipe-filter-checkbox"
                    style={{
                      background: isChecked ? primaryColor : 'white',
                      border: isChecked ? 'none' : '1.27px solid #757575',
                    }}
                  >
                    {isChecked && <span className="recipe-filter-check">✓</span>}
                  </span>
                  <span className="recipe-filter-item-label">{ing}</span>
                  <input
                    type="checkbox"
                    hidden
                    checked={isChecked}
                    onChange={() => toggleIngredient(ing as FilterIngredient)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
