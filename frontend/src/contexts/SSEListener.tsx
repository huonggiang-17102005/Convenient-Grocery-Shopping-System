import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useShoppingListContext } from './ShoppingListContext';
import { useFamilyContext } from './FamilyContext';

export const SSEListener: React.FC = () => {
  const { user, family } = useAuth();
  const { handleSSENotification } = useNotifications();
  const { refreshShoppingList } = useShoppingListContext();
  const { refreshMembers } = useFamilyContext();

  const handleNotifRef = useRef(handleSSENotification);
  const refreshShoppingRef = useRef(refreshShoppingList);
  const refreshMembersRef = useRef(refreshMembers);

  useEffect(() => {
    handleNotifRef.current = handleSSENotification;
    refreshShoppingRef.current = refreshShoppingList;
    refreshMembersRef.current = refreshMembers;
  }, [handleSSENotification, refreshShoppingList, refreshMembers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id || !family?.id) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const evtSource = new EventSource(`${API_URL}/stream?token=${token}`);

    evtSource.addEventListener('NEW_NOTIFICATION', (event) => {
      console.log('🔔 [SSE] Nhận thông báo mới:', event.data);
      
      try {
        const payload = JSON.parse(event.data);
        handleNotifRef.current(payload);
        
        if (payload.type === 'FAMILY_JOIN' || payload.type === 'FAMILY_LEAVE') {
          console.log('👨‍👩‍👧 [SSE] Có sự thay đổi nhân sự, tải lại danh sách...');
          refreshMembersRef.current();
        }

        if (payload.type === 'ROLE_CHANGED' || payload.type === 'FAMILY_ROLE') {
          console.log('👑 [SSE] Quyền hạn thay đổi, đang kiểm tra quyền mới...');
          
          fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const freshUser = data.data;
              if (freshUser.role !== user?.role) {
                if (freshUser.role === 'Homemaker') {
                  window.location.href = '/homemaker/dashboard';
                } else {
                  window.location.href = '/member/dashboard';
                }
              } else {
                window.location.reload();
              }
            } else {
              window.location.reload();
            }
          })
          .catch(() => {
            window.location.reload();
          });
        }
      } catch (e) {}
    });

    evtSource.addEventListener('SHOPPING_LIST_UPDATED', (event) => {
      console.log('🛒 [SSE] Danh sách đi chợ thay đổi:', event.data);
      refreshShoppingRef.current();
    });

    evtSource.addEventListener('KICKED_FROM_FAMILY', (event) => {
      console.log('🚪 [SSE] Bị đuổi khỏi nhóm:', event.data);
      localStorage.setItem('kicked_alert', 'true');
      window.location.href = '/choose-role';
    });

    evtSource.onerror = (err) => {
      console.error('📡 [SSE] Lỗi kết nối, đang thử lại...', err);
    };

    return () => {
      console.log('🔌 [SSE] Đóng kết nối');
      evtSource.close();
    };
  }, [user?.id, family?.id]); // Only reconnect if user or family changes

  return null;
};

export default SSEListener;
