import React, { useEffect, useRef } from 'react';
import './UnitDropdown.css';

export type UnitType = 'Kg' | 'Gram' | 'Lít' | 'ml' | 'Quả';

export const UNIT_OPTIONS: UnitType[] = ['Kg', 'Gram', 'Lít', 'ml', 'Quả'];

interface UnitDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (unit: UnitType) => void;
}

const UnitDropdown: React.FC<UnitDropdownProps> = ({ isOpen, onClose, onSelect }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="unit-dropdown-container" ref={dropdownRef}>
      {UNIT_OPTIONS.map((unit, index) => (
        <React.Fragment key={unit}>
          <button 
            type="button" 
            className="unit-dropdown-item"
            onClick={() => {
              onSelect(unit);
              onClose();
            }}
          >
            {unit}
          </button>
          {index < UNIT_OPTIONS.length - 1 && <div className="unit-dropdown-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default UnitDropdown;
