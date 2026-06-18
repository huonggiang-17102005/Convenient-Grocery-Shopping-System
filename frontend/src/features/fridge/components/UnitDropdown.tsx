import React, { useEffect, useRef } from 'react';
import './UnitDropdown.css';

export type UnitType = string;

interface UnitDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (unit: UnitType) => void;
  options: string[];
}

const UnitDropdown: React.FC<UnitDropdownProps> = ({ isOpen, onClose, onSelect, options }) => {
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
      {options.map((unit, index) => (
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
          {index < options.length - 1 && <div className="unit-dropdown-divider" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default UnitDropdown;
