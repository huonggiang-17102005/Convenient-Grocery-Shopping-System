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
  primaryColor?: string;
}

const WeekDayTabs: React.FC<WeekDayTabsProps> = ({ days, activeDay, onSelectDay, primaryColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector<HTMLLabelElement>(
      '.mp-day-tab--active'
    );
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeDay]);

  return (
    <div className="mp-day-tabs" ref={containerRef} role="radiogroup" aria-label="Chọn ngày trong tuần">
      {days.map((day) => (
        <label
          key={day.key}
          id={`mp-day-tab-${day.key}`}
          className={`mp-day-tab${activeDay === day.key ? ' mp-day-tab--active' : ''}`}
          style={activeDay === day.key && primaryColor ? { background: primaryColor, color: '#fff', borderColor: primaryColor } : undefined}
        >
          <input
            type="radio"
            name="weekDay"
            checked={activeDay === day.key}
            onChange={() => onSelectDay(day.key)}
            className="mp-sr-only"
          />
          <span className="mp-day-tab__label">{day.label}</span>
          {day.date && <span className="mp-day-tab__date">{day.date}</span>}
        </label>
      ))}
    </div>
  );
};

export default WeekDayTabs;
