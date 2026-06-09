import React from 'react';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  query: string;
  onQueryChange: (q: string) => void;
  filterMode: 'name' | 'ingredient';
  onFilterChange: (mode: 'name' | 'ingredient') => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  query,
  onQueryChange,
  filterMode,
  onFilterChange,
}) => {
  return (
    <div className="mp-search-area">
      {/* Search input */}
      <div className="mp-search-input-wrap">
        <span className="mp-search-icon">
          <Search size={16} />
        </span>
        <input
          id="mp-search-recipe"
          className="mp-search-input"
          type="text"
          placeholder="Tìm kiếm công thức nấu ăn..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
          aria-label="Tìm kiếm công thức"
        />
      </div>

      {/* Filter toggle row */}
      <div className="mp-filter-row" role="radiogroup" aria-label="Chế độ tìm kiếm">
        <label
          className={`mp-filter-btn${filterMode === 'name' ? ' mp-filter-btn--active' : ' mp-filter-btn--inactive'}`}
        >
          <input
            type="radio"
            name="filterMode"
            checked={filterMode === 'name'}
            onChange={() => onFilterChange('name')}
            className="mp-sr-only"
          />
          Theo tên món
        </label>
        <label
          className={`mp-filter-btn${filterMode === 'ingredient' ? ' mp-filter-btn--active' : ' mp-filter-btn--inactive'}`}
        >
          <input
            type="radio"
            name="filterMode"
            checked={filterMode === 'ingredient'}
            onChange={() => onFilterChange('ingredient')}
            className="mp-sr-only"
          />
          Theo nguyên liệu
        </label>
      </div>
    </div>
  );
};

export default SearchAndFilter;
