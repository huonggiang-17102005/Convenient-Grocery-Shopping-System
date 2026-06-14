import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string;
  /**
   * Increment this counter every time you want to show a toast.
   * The toast will always display for `duration` ms from the moment
   * the trigger changes, regardless of previous state.
   */
  trigger: number;
  onHide: () => void;
  duration?: number;
  // kept for backward-compat but no longer used internally
  isVisible?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  trigger,
  onHide,
  duration = 2500,
}) => {
  const [visible, setVisible]       = useState(false);
  const [rendered, setRendered]     = useState(false);
  const [displayMsg, setDisplayMsg] = useState(message);

  const hideTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAll = () => {
    if (hideTimer.current)   clearTimeout(hideTimer.current);
    if (unmountTimer.current) clearTimeout(unmountTimer.current);
  };

  useEffect(() => {
    // trigger === 0 means "no toast has been requested yet" — ignore
    if (trigger === 0) return;

    // Cancel any pending hide / unmount from the previous toast
    clearAll();

    // Snapshot the message at the moment of trigger
    setDisplayMsg(message);
    setRendered(true);
    setVisible(true);

    // Auto-hide after duration
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      onHide();

      // Unmount after fade-out animation (300 ms)
      unmountTimer.current = setTimeout(() => {
        setRendered(false);
      }, 300);
    }, duration);

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]); // ← only re-runs when trigger increments

  if (!rendered) return null;

  return (
    <div className={`toast-notification ${visible ? 'toast-notification--visible' : 'toast-notification--hidden'}`}>
      <div className="toast-notification__icon">
        <Check size={16} color="white" strokeWidth={3} />
      </div>
      <span className="toast-notification__text">{displayMsg}</span>
    </div>
  );
};

export default Toast;
