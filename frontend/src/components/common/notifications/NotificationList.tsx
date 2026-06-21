import React, { useEffect, useRef, useCallback } from 'react';
import { useNotifications, type NotificationCategory } from '../../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';

interface Props {
  category: NotificationCategory;
  onClose: () => void;
}

export const NotificationList: React.FC<Props> = ({ category }) => {
  const { categories, loadMoreNotifications } = useNotifications();
  const observerTarget = useRef<HTMLDivElement>(null);
  
  const catData = categories[category];

  // Infinite Scroll logic
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && catData.hasMore && !catData.isLoading) {
      loadMoreNotifications(category);
    }
  }, [catData.hasMore, catData.isLoading, loadMoreNotifications, category]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { root: null, rootMargin: '20px', threshold: 1.0 });
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [handleObserver]);

  return (
    <div className="notif-list">
      {catData.items.length === 0 && !catData.isLoading && (
        <p className="notif-empty">Chưa có thông báo nào.</p>
      )}
      
      {catData.items.map(notif => (
        <NotificationItem key={notif.id} notif={notif} />
      ))}

      {catData.isLoading && <p className="notif-loading">Đang tải...</p>}
      
      <div ref={observerTarget} style={{ height: '20px', width: '100%' }}></div>
    </div>
  );
};
