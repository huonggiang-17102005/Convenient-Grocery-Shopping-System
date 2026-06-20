import React, { useState, useEffect, useRef } from 'react';
import './CustomSelect.css';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  triggerHeight?: number | string;
  fontSize?: string | number;
  padding?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '- Chọn -',
  disabled = false,
  triggerHeight = 52,
  fontSize = 14,
  padding = '0 16px',
  className = '',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'open' : ''} ${className}`} 
      ref={containerRef}
      style={style}
    >
      <button
        type="button"
        className={`custom-select-trigger ${disabled ? 'disabled' : ''}`}
        style={{ height: triggerHeight, padding, fontSize }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className="custom-select-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="custom-select-options">
          {options.map((opt, idx) => (
            <React.Fragment key={opt.value}>
              <button
                type="button"
                className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
                style={{ fontSize }}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </button>
              {idx < options.length - 1 && <div className="custom-select-divider" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
