import React, { useEffect, useRef, useCallback } from 'react';
import { useNotifications, type NotificationCategory } from '../../../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';

interface Props {
  category: NotificationCategory;
  onClose: () => void;
}

export const NotificationList: React.FC<Props> = ({ category }) => {
  const { categories, loadMoreNotifications } = useNotifications();
  const catData = categories[category];
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (catData.isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && catData.hasMore) {
        loadMoreNotifications(category);
      }
    }, { root: null, rootMargin: '20px', threshold: 1.0 });

    if (node) observer.current.observe(node);
  }, [catData.isLoading, catData.hasMore, loadMoreNotifications, category]);

  return (
    <div className="notif-list">
      {catData.items.length === 0 && !catData.isLoading && (
        <p className="notif-empty">Chưa có thông báo nào.</p>
      )}

      {catData.items.map(notif => (
        <NotificationItem key={notif.id} notif={notif} />
      ))}

      {catData.isLoading && <p className="notif-loading">Đang tải...</p>}

      <div ref={lastElementRef} style={{ height: '20px', width: '100%' }}></div>
    </div>
  );
};
