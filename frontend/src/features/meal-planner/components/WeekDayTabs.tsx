import React, { useRef, useEffect } from 'react';

export interface DayTab {
  key: string;   // 'mon' | 'tue' | ...
  label: string; // 'Thứ 2', 'Thứ 3', ..., 'CN'
  date?: string; // optional short date, e.g. '09/6'
}

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WeekDayTabsProps {
  days: DayTab[];
  activeDay: string;
  onSelectDay: (key: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

const WeekDayTabs: React.FC<WeekDayTabsProps> = ({ days, activeDay, onSelectDay, onPrevWeek, onNextWeek }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLButtonElement>(
      '.mp-weekday-tab--active'
    );
    if (activeEl) {
      // Prevent whole page shifting by scrolling only the container
      const container = containerRef.current;
      const scrollLeft = activeEl.offsetLeft - (container.offsetWidth / 2) + (activeEl.offsetWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeDay]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderBottom: '1.27px solid #E0E0E0' }}>
      <button 
        onClick={onPrevWeek} 
        style={{ padding: '0 8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9E9E9E', height: '100%', display: 'flex', alignItems: 'center' }}
      >
        <ChevronLeft size={20} />
      </button>
      <div className="mp-weekday-tabs" ref={containerRef} role="tablist" aria-label="Chọn ngày trong tuần" style={{ borderBottom: 'none', flex: 1, padding: '16px 0' }}>
        {days.map((day) => (
          <button
            key={day.key}
            id={`mp-day-tab-${day.key}`}
            className={`mp-weekday-tab${activeDay === day.key ? ' mp-weekday-tab--active' : ''}`}
            onClick={() => onSelectDay(day.key)}
            role="tab"
            aria-selected={activeDay === day.key}
            type="button"
          >
            <span className="mp-weekday-tab__label">{day.label}</span>
            {day.date && <span className="mp-weekday-tab__date">{day.date}</span>}
          </button>
        ))}
      </div>
      <button 
        onClick={onNextWeek} 
        style={{ padding: '0 8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9E9E9E', height: '100%', display: 'flex', alignItems: 'center' }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default WeekDayTabs;
