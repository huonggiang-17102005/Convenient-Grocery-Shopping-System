import React, { useRef, useEffect } from 'react';

export interface DayTab {
  key: string;   // 'mon' | 'tue' | ...
  label: string; // 'Thứ 2', 'Thứ 3', ..., 'CN'
  date?: string; // optional short date, e.g. '09/6'
}

interface WeekDayTabsProps {
  days: DayTab[];
  activeDay: string;
  onSelectDay: (key: string) => void;
}

const WeekDayTabs: React.FC<WeekDayTabsProps> = ({ days, activeDay, onSelectDay }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLLabelElement>(
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
    <div className="mp-weekday-tabs" ref={containerRef} role="radiogroup" aria-label="Chọn ngày trong tuần">
      {days.map((day) => (
        <label
          key={day.key}
          id={`mp-day-tab-${day.key}`}
          className={`mp-weekday-tab${activeDay === day.key ? ' mp-weekday-tab--active' : ''}`}
        >
          <input
            type="radio"
            name="weekDay"
            checked={activeDay === day.key}
            onChange={() => onSelectDay(day.key)}
            className="mp-sr-only"
          />
          <span className="mp-weekday-tab__label">{day.label}</span>
          {day.date && <span className="mp-weekday-tab__date">{day.date}</span>}
        </label>
      ))}
    </div>
  );
};

export default WeekDayTabs;
