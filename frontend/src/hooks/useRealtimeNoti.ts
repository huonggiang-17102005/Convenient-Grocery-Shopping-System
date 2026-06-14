import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client sử dụng biến môi trường của Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const useRealtimeNoti = (
  familyId: string | null | undefined,
  localUserId: string | null | undefined,
  onRoleChangedForMe: (newRole: string) => void
) => {
  // Sử dụng useRef để lưu trữ callback mới nhất, tránh re-render liên tục
  const callbackRef = useRef(onRoleChangedForMe);

  useEffect(() => {
    callbackRef.current = onRoleChangedForMe;
  }, [onRoleChangedForMe]);

  useEffect(() => {
    // Nếu chưa có thông tin thì không kết nối
    if (!familyId || !supabaseUrl || !supabaseKey) return;

    // Đăng ký kênh Realtime lắng nghe bảng notifications của family_id này
    const channel = supabase
      .channel(`public:notifications:family_id=eq.${familyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `family_id=eq.${familyId}` // Chỉ bắt thông báo của gia đình mình
        },
        (payload) => {
          console.log('🔥 [Supabase Realtime] CÓ THÔNG BÁO MỚI:', payload);
          const newNoti = payload.new as any;
          
          // Kiểm tra nếu là sự kiện đổi vai trò
          if (newNoti.type === 'ROLE_CHANGED') {
            const targetUserId = newNoti.metadata?.user_id;
            const newRole = newNoti.metadata?.new_role;
            console.log(`Kiểm tra ID: targetUserId = ${targetUserId}, localUserId = ${localUserId}, Role Mới = ${newRole}`);

            // NẾU TRÚNG ID CỦA MÌNH: Gọi hàm callback để chuyển trang
            if (targetUserId === localUserId && newRole) {
              console.log('✅ TRÚNG ID CỦA MÌNH! Chuẩn bị chuyển trang...');
              callbackRef.current(newRole);
            } else {
              console.log('❌ KHÔNG TRÚNG ID CỦA MÌNH. Bỏ qua.');
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 [Supabase Realtime] Status:', status, err || '');
      });

    // Cleanup khi component bị hủy hoặc familyId thay đổi
    return () => {
      console.log('🔌 [Supabase Realtime] Đóng kết nối do cleanup...');
      supabase.removeChannel(channel);
    };
  }, [familyId, localUserId]); // Xóa bỏ dependency onRoleChangedForMe
};

export default useRealtimeNoti;
