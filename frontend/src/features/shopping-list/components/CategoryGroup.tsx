import React from 'react';

interface CategoryGroupProps {
  title: string;
  children: React.ReactNode;
  showTickAll?: boolean;
  onTickAll?: () => void;
  tickAllChecked?: boolean;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ title, children, showTickAll = false, onTickAll, tickAllChecked = false }) => {
  return (
    <div className="shopping-category-group">
      <div className="shopping-category-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{title}</span>
        {showTickAll && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onTickAll?.(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              opacity: tickAllChecked ? 0.5 : 1,
            }}
            title="Xác nhận mua tất cả trong danh mục này"
            aria-label="Xác nhận mua tất cả trong danh mục này"
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                border: tickAllChecked ? 'none' : '1.5px solid #9E9E9E',
                background: tickAllChecked ? 'var(--primary-color, #FF8A00)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {tickAllChecked && <span style={{ fontSize: '9px', color: 'white', lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{
              fontSize: '11px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontWeight: '500',
              color: tickAllChecked ? '#9E9E9E' : '#757575',
              whiteSpace: 'nowrap',
            }}>
              Chọn tất cả
            </span>
          </button>
        )}
      </div>
      <div className="shopping-category-list">
        {children}
      </div>
    </div>
  );
};

export default CategoryGroup;
