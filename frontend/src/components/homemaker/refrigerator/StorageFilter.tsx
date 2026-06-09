import React from 'react';
import type { StorageType } from '../../../types/homemaker/refrigerator';

interface StorageFilterProps {
  activeStorage: StorageType;
  onStorageChange: (storage: StorageType) => void;
}

const StorageFilter: React.FC<StorageFilterProps> = ({ activeStorage, onStorageChange }) => {
  const storages: StorageType[] = ['Tất cả', 'Ngăn mát', 'Ngăn đông', 'Khô'];

  return (
    <div className="refrigerator-filter-group">
      {storages.map(storage => (
        <button 
          key={storage}
          className={`filter-pill ${activeStorage === storage ? 'active' : ''}`}
          onClick={() => onStorageChange(storage)}
        >
          {storage}
        </button>
      ))}
    </div>
  );
};

export default StorageFilter;
