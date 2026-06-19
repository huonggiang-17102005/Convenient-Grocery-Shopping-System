import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, Edit2, Heart, Info, Clock, UserPlus, UserMinus, CheckCircle2, AlertTriangle, UserCheck, Shield, UserX, ClipboardList } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loadMoreNotifications, markAsRead, markAllAsRead, hasMore, isLoading } = useNotifications();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || 'member';
  const dropdownRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Infinite Scroll logic
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !isLoading) {
      loadMoreNotifications();
    }
  }, [hasMore, isLoading, loadMoreNotifications]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { root: null, rootMargin: '20px', threshold: 1.0 });
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [handleObserver]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getIcon = (type: string) => {
    switch(type) {
      // Inventory Flow
      case 'ADD': return <Check size={18} color="#4CAF50" />;
      case 'CONSUME': return <Info size={18} color="#FF9800" />;
      case 'WASTE': return <Trash2 size={18} color="#F44336" />;
      case 'UPDATE': return <Edit2 size={18} color="#2196F3" />;
      case 'EXPIRE': return <Clock size={18} color="#F44336" />;
      
      // Recipe Flow
      case 'LIKE': return <Heart size={18} color="#E91E63" />;
      
      // Task Flow
      case 'TASK_ASSIGN': return <ClipboardList size={18} color="#9C27B0" />;
      case 'TASK_UNASSIGN': return <UserMinus size={18} color="#757575" />;
      case 'TASK_COMPLETE': return <CheckCircle2 size={18} color="#4CAF50" />;
      case 'TASK_OVERDUE': return <AlertTriangle size={18} color="#FF5722" />;
      
      // Member Flow
      case 'FAMILY_JOIN': return <UserCheck size={18} color="#4CAF50" />;
      case 'FAMILY_ROLE': return <Shield size={18} color="#673AB7" />;
      case 'FAMILY_LEAVE': return <UserX size={18} color="#F44336" />;
      
      default: return <Bell size={18} color="#757575" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  const handleNotifClick = (id: string, isRead: boolean) => {
    if (!isRead) markAsRead(id);
  };

  return (
    <div className={`notif-bell-wrapper role-${role}`} ref={dropdownRef}>
      <div className="bell-container" onClick={toggleDropdown}>
        <Bell size={24} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notif-header">
            <h3 className="notif-title">Thông báo</h3>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          
          <div className="notif-list">
            {notifications.length === 0 && !isLoading && (
              <p className="notif-empty">Chưa có thông báo nào.</p>
            )}
            
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                onClick={() => handleNotifClick(notif.id, notif.is_read || false)}
              >
                <div className="notif-icon-wrapper">{getIcon(notif.type)}</div>
                <div className="notif-content">
                  <p className="notif-text">
                    <strong>{notif.title}</strong><br/>
                    <span dangerouslySetInnerHTML={{ __html: notif.message }} />
                  </p>
                  <span className="notif-time">{formatTime(notif.created_at)}</span>
                </div>
                {!notif.is_read && <div className="unread-dot"></div>}
              </div>
            ))}

            {isLoading && <p className="notif-loading">Đang tải...</p>}
            
            <div ref={observerTarget} style={{ height: '20px', width: '100%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
