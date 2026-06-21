import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { useShoppingListContext } from './ShoppingListContext';

export const SSEListener: React.FC = () => {
  const { user, family } = useAuth();
  const { refreshNotifications } = useNotifications();
  const { refreshShoppingList } = useShoppingListContext();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id || !family?.id) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const evtSource = new EventSource(`${API_URL}/stream?token=${token}`);

    evtSource.addEventListener('NEW_NOTIFICATION', (event) => {
      console.log('🔔 [SSE] Nhận thông báo mới:', event.data);
      refreshNotifications();
      
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'ROLE_CHANGED' || payload.type === 'FAMILY_ROLE') {
          console.log('👑 [SSE] Quyền hạn thay đổi, đang kiểm tra quyền mới...');
          
          // Gọi API lấy user mới nhất để kiểm tra cho chắc chắn 100%
          fetch(`${API_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.data) {
              const freshUser = data.data;
              
              // Nếu Role của mình thực sự bị thay đổi so với hiện tại
              if (freshUser.role !== user?.role) {
                if (freshUser.role === 'Homemaker') {
                  window.location.href = '/homemaker/dashboard';
                } else {
                  window.location.href = '/member/dashboard';
                }
              } else {
                // Nếu Role không đổi (mình là người ngoài cuộc đứng xem)
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
      refreshShoppingList();
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
  }, [user?.id, family?.id, refreshNotifications, refreshShoppingList]);

  return null;
};

export default SSEListener;
