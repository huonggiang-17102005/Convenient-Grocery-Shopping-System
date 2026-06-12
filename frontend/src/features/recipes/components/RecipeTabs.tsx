// src/features/recipes/components/RecipeTabs.tsx

import React from 'react';

type Tab = 'library' | 'favorites' | 'community';

interface RecipeTabsProps {
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'library', label: 'Thư viện' },
  { id: 'favorites', label: 'Yêu thích' },
  { id: 'community', label: 'Cộng đồng' },
];

const RecipeTabs: React.FC<RecipeTabsProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="recipe-tabs">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`recipe-tab-${tab.id}`}
            className={`recipe-tab-btn ${isActive ? 'active' : ''}`}
            onClick={() => onChangeTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default RecipeTabs;
