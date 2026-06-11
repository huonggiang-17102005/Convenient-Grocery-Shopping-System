import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onHide, duration = 2500 }) => {
  const [prevIsVisible, setPrevIsVisible] = useState(isVisible);
  const [shouldRender, setShouldRender] = useState(isVisible);

  if (isVisible !== prevIsVisible) {
    setPrevIsVisible(isVisible);
    if (isVisible) {
      setShouldRender(true);
    }
  }

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      // Delay unmount to allow fade-out animation
      const unmountTimer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(unmountTimer);
    }
  }, [isVisible, duration, onHide]);

  if (!shouldRender) return null;

  return (
    <div className={`toast-notification ${isVisible ? 'toast-notification--visible' : 'toast-notification--hidden'}`}>
      <div className="toast-notification__icon">
        <Check size={16} color="white" strokeWidth={3} />
      </div>
      <span className="toast-notification__text">{message}</span>
    </div>
  );
};

export default Toast;
