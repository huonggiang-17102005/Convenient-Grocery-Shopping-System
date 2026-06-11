import React from 'react';
import type { StorageType } from '../types';
import FridgeDropdown from './FridgeDropdown';

interface StorageFilterProps {
  activeStorage: StorageType;
  onStorageChange: (storage: StorageType) => void;
}

const STORAGE_OPTIONS = [
  { value: 'Tất cả',   label: 'Tất cả vị trí' },
  { value: 'Ngăn mát', label: '❄️  Ngăn mát' },
  { value: 'Ngăn đông',label: '🧊  Ngăn đông' },
  { value: 'Khô',      label: '📦  Khô' },
];

const StorageFilter: React.FC<StorageFilterProps> = ({ activeStorage, onStorageChange }) => (
  <FridgeDropdown
    value={activeStorage}
    onChange={(v) => onStorageChange(v as StorageType)}
    options={STORAGE_OPTIONS}
  />
);

export default StorageFilter;
