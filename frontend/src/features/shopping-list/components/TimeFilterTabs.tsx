import React from 'react';

interface TimeFilterTabsProps {
  activeTab: 'today' | 'week';
  onChangeTab: (tab: 'today' | 'week') => void;
}

const TimeFilterTabs: React.FC<TimeFilterTabsProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="time-filter-container">
      <button
        type="button"
        className={`time-filter-tab ${
          activeTab === 'today' ? 'time-filter-tab--active' : 'time-filter-tab--inactive'
        }`}
        onClick={() => onChangeTab('today')}
      >
        Hôm nay
      </button>
      <button
        type="button"
        className={`time-filter-tab ${
          activeTab === 'week' ? 'time-filter-tab--active' : 'time-filter-tab--inactive'
        }`}
        onClick={() => onChangeTab('week')}
      >
        Trong tuần
      </button>
    </div>
  );
};

export default TimeFilterTabs;
