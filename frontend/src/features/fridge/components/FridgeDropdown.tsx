import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FridgeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const FridgeDropdown: React.FC<FridgeDropdownProps> = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="fridge-custom-dropdown" ref={ref}>
      <button
        type="button"
        className={`fridge-custom-dropdown__trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className="fridge-custom-dropdown__label">{selected?.label ?? value}</span>
        <ChevronDown
          size={18}
          className={`fridge-custom-dropdown__chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="fridge-custom-dropdown__menu">
          {options.map(opt => (
            <button
              type="button"
              key={opt.value}
              className={`fridge-custom-dropdown__item ${opt.value === value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FridgeDropdown;
