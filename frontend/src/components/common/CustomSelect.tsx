import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  optionHeight?: number | string;
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
  optionHeight,
  fontSize = 14,
  padding = '0 16px',
  className = '',
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [themeStyles, setThemeStyles] = useState<React.CSSProperties>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateCoords = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const triggerStyle = window.getComputedStyle(triggerRef.current);
      
      const primaryColor = triggerStyle.getPropertyValue('--primary-color');
      const primaryLight = triggerStyle.getPropertyValue('--primary-light');
      const primaryBgOpacity = triggerStyle.getPropertyValue('--primary-bg-opacity');

      setThemeStyles({
        '--primary-color': primaryColor || undefined,
        '--primary-light': primaryLight || undefined,
        '--primary-bg-opacity': primaryBgOpacity || undefined,
      } as React.CSSProperties);

      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        !(e.target instanceof Element && e.target.closest('.custom-select-options'))
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollResize = () => {
      updateCoords();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('resize', handleScrollResize);
    window.addEventListener('scroll', handleScrollResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('resize', handleScrollResize);
      window.removeEventListener('scroll', handleScrollResize, true);
    };
  }, [isOpen, updateCoords]);

  const normalize = (str: any) => String(str || '').normalize('NFC').trim().toLowerCase();
  const selectedOption = options.find(o => normalize(o.value) === normalize(value));
  const isCompact = typeof triggerHeight === 'number' && triggerHeight <= 30;

  return (
    <div 
      className={`custom-select-container ${isOpen ? 'open' : ''} ${className}`} 
      ref={containerRef}
      style={style}
    >
      <button
        ref={triggerRef}
        type="button"
        className={`custom-select-trigger ${disabled ? 'disabled' : ''}`}
        style={{ height: triggerHeight, padding, fontSize }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span>{selectedOption ? selectedOption.label : (value || placeholder)}</span>
        <span className="custom-select-arrow">▼</span>
      </button>

      {isOpen && createPortal(
        <div 
          className={`custom-select-options ${className}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${coords.top + 4}px`,
            left: `${coords.left}px`,
            minWidth: `${coords.width}px`,
            width: 'max-content',
            zIndex: 99999,
            ...themeStyles,
          }}
        >
          {options.map((opt, idx) => (
            <React.Fragment key={opt.value}>
              <button
                type="button"
                className={`custom-select-option ${normalize(opt.value) === normalize(value) ? 'selected' : ''}`}
                style={{ 
                  fontSize,
                  height: optionHeight || (isCompact ? '30px' : undefined),
                  padding: isCompact ? '0 10px' : undefined
                }}
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
