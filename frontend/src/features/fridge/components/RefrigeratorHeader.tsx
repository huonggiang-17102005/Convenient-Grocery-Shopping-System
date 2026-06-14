import React from 'react';
import { Search } from 'lucide-react';

interface RefrigeratorHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RefrigeratorHeader: React.FC<RefrigeratorHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="refrigerator-header">
      <div className="refrigerator-title">Tủ lạnh của nhà</div>
      <div className="refrigerator-search-container">
        <Search className="refrigerator-search-icon" size={20} />
        <input 
          type="text" 
          className="refrigerator-search-input" 
          placeholder="Tìm thực phẩm..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default RefrigeratorHeader;
