import React from 'react';

interface CategoryGroupProps {
  title: string;
  children: React.ReactNode;
}

const CategoryGroup: React.FC<CategoryGroupProps> = ({ title, children }) => {
  return (
    <div className="shopping-category-group">
      <div className="shopping-category-header">{title}</div>
      <div className="shopping-category-list">
        {children}
      </div>
    </div>
  );
};

export default CategoryGroup;
