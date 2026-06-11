import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface MealItem {
  session: 'morning' | 'noon' | 'evening';
  dish: string;
}

interface TodayMenuProps {
  meals: MealItem[];
  role?: 'homemaker' | 'member';
  onMarkCooked?: () => void;
}

const sessionConfig: Record<MealItem['session'], { emoji: string; label: string }> = {
  morning: { emoji: '🌅', label: 'Sáng' },
  noon: { emoji: '☀️', label: 'Trưa' },
  evening: { emoji: '🌙', label: 'Tối' },
};

const TodayMenu: React.FC<TodayMenuProps> = ({ meals, role = 'homemaker', onMarkCooked }) => {
  const navigate = useNavigate();

  return (
    <section className="today-menu">
      <h2 className="today-menu__title">Thực đơn hôm nay</h2>

      <div className="today-menu__meals">
        {meals.map((meal, index) => {
          const config = sessionConfig[meal.session];
          return (
            <div key={index} className="today-menu__meal-row">
              <span className="today-menu__meal-icon">{config.emoji}</span>
              <div className="today-menu__meal-info">
                <span className="today-menu__meal-session">{config.label}</span>
                <span className="today-menu__meal-dish">{meal.dish}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="today-menu__actions">
        <button
          className="today-menu__btn today-menu__btn--primary"
          onClick={() => navigate(`/${role}/meal-planner`)}
        >
          {role === 'homemaker' ? 'Quản lý thực đơn tuần' : 'Xem thực đơn tuần'}
        </button>
        {role === 'homemaker' && (
          <button
            className="today-menu__btn today-menu__btn--secondary"
            onClick={onMarkCooked}
          >
            Đánh dấu đã nấu
          </button>
        )}
      </div>
    </section>
  );
};

export default TodayMenu;
