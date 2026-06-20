import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import './profile.css';
export interface ProfileFeatureProps {
  role: 'homemaker' | 'member';
}

// Components
import ProfileHeader from './components/ProfileHeader';
import FamilySection from './components/FamilySection';
import type { FamilyMember } from './components/FamilySection';
import WasteStats from './components/WasteStats';
import SettingsMenu from './components/SettingsMenu';

// Modals
import AvatarModal from './modals/AvatarModal';
import AccountModal from './modals/AccountModal';
import ConfirmModal from './modals/ConfirmModal';
import type { ConfirmVariant } from './modals/ConfirmModal';
import Toast from '@/components/common/Toast';
import useRealtimeNoti from '../../hooks/useRealtimeNoti';
import { useFamilyContext } from '../../contexts/FamilyContext';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileFeature: React.FC<ProfileFeatureProps> = ({ role }) => {
  const navigate = useNavigate();
  const { user: authUser, logout, refreshUser } = useAuth();

  const user = {
    name: authUser?.full_name || '',
    email: authUser?.email || '',
    avatar: authUser?.avatar || '',
    role: authUser?.role === 'Homemaker' ? 'Nội trợ' : 'Thành viên',
  };

  // Gọi Hook Realtime để lắng nghe thông báo đổi quyền
  useRealtimeNoti(authUser?.family_id, authUser?.id, async (newRole) => {
    // Tải lại thông tin mới nhất
    await refreshUser();
    // Chuyển trang theo Role mới
    if (newRole === 'Homemaker') {
      navigate('/homemaker/dashboard');
    } else {
      navigate('/member/dashboard');
    }
  });

  // Lấy danh sách thành viên từ Context (đã được cache ở tầng Layout)
  const { familyMembers, setFamilyMembers } = useFamilyContext();

  const [categoriesStats, setCategoriesStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchWasteStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/families/waste-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && data.data.length > 0) {
          setCategoriesStats(data.data);
        }
      } catch (err) {
        console.error('Lỗi tải thống kê lãng phí:', err);
      }
    };

    if (role === 'homemaker') {
      fetchWasteStats();
    }
  }, [role]);

  // Modal open states
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState<ConfirmVariant>('logout');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');
  const [toastTrigger, setToastTrigger] = useState(0);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setToastTrigger(prev => prev + 1);
  };

  // Avatar Selection Handlers
  const handleSelectAvatar = async (newAvatar: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/users/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ avatar: newAvatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật ảnh đại diện');
      
      // setUser((prev) => ({ ...prev, avatar: newAvatar }));
      setFamilyMembers((prev) =>
        prev.map((m) => (m.isCurrentUser ? { ...m, avatar: newAvatar } : m))
      );
      
      await refreshUser();
      triggerToast('Thay đổi ảnh đại diện thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Account Settings Handlers
  const handleUpdateProfile = async (newName: string, newEmail: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: newName, email: newEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật hồ sơ');
      
      // setUser((prev) => ({ ...prev, name: newName, email: newEmail }));
      setFamilyMembers((prev) =>
        prev.map((m) => (m.isCurrentUser ? { ...m, name: newName } : m))
      );
      
      await refreshUser();
      triggerToast('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Account Password Handlers
  const handleUpdatePassword = async (currentPass: string, newPass: string) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/users/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPass, new_password: newPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi đổi mật khẩu');
      
      triggerToast('Đổi mật khẩu thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Family Actions Handlers
  const handleOpenTransfer = (member: FamilyMember) => {
    setSelectedMember(member);
    setConfirmVariant('transfer');
    setIsConfirmOpen(true);
  };

  // Open Delete Member Confirmation
  const handleOpenDelete = (member: FamilyMember) => {
    setSelectedMember(member);
    setConfirmVariant('delete');
    setIsConfirmOpen(true);
  };

  // Open Logout Confirmation
  const handleOpenLogout = () => {
    setSelectedMember(null);
    setConfirmVariant('logout');
    setIsConfirmOpen(true);
  };

  // Open Export Confirmation
  const handleOpenExport = () => {
    setSelectedMember(null);
    setConfirmVariant('export');
    setIsConfirmOpen(true);
  };

  // Open Leave Group Confirmation
  const handleOpenLeaveGroup = () => {
    setSelectedMember(null);
    setConfirmVariant('leave');
    setIsConfirmOpen(true);
  };

  // Confirmed Actions Handlers
  const handleConfirmAction = async (_data?: string) => {
    setIsConfirmOpen(false);

    try {
      const token = localStorage.getItem('token');

      if (confirmVariant === 'transfer' && selectedMember) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/families/transfer-homemaker`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ newHomemakerId: selectedMember.id })
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Lỗi nhường quyền');

        triggerToast('Đang xử lý nhường quyền...');

      } else if (confirmVariant === 'delete' && selectedMember) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/families/members/${selectedMember.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Lỗi xóa thành viên');

        setFamilyMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
        triggerToast('Xóa thành viên thành công!');

      } else if (confirmVariant === 'logout') {
        logout();
        triggerToast('Đăng xuất thành công!');
        setTimeout(() => {
          navigate('/');
        }, 800);

      } else if (confirmVariant === 'export') {
        triggerToast(`Đang chuẩn bị xuất báo cáo...`);
        const element = document.getElementById('waste-stats-report');
        
        if (element) {
          const opt = {
            margin:       10,
            filename:     `Thong-ke-lang-phi-${new Date().toISOString().slice(0, 10)}.pdf`,
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, ignoreElements: (node: Element) => node.classList?.contains('no-print') },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
          };
          
          html2pdf().set(opt).from(element).save().then(() => {
            triggerToast('Xuất báo cáo PDF thành công!');
          }).catch((err: any) => {
            console.error('Lỗi xuất PDF:', err);
            triggerToast('Lỗi khi xuất file PDF');
          });
        } else {
          triggerToast('Không tìm thấy dữ liệu báo cáo');
        }

      } else if (confirmVariant === 'leave') {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/families/leave`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.message || 'Lỗi rời nhóm');

        await refreshUser();
        triggerToast('Rời nhóm thành công!');
        setTimeout(() => {
          navigate('/choose-role');
        }, 800);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <Toast message={toastMessage} trigger={toastTrigger} onHide={() => {}} />
      <div className="profile-page">
        <div className="profile-white-card">
          {/* Page Title */}
          <h1 className="profile-title">Hồ sơ &amp; Quản lý</h1>
          {/* Header (Avatar + Name) */}
          <ProfileHeader
            avatar={user.avatar}
            name={user.name}
            role={user.role}
            onAvatarClick={() => setIsAvatarOpen(true)}
          />

          {/* Family Section */}
          <FamilySection
            members={familyMembers}
            role={role}
            onTransfer={handleOpenTransfer}
            onDelete={handleOpenDelete}
          />

          {/* Waste Progress and Stats */}
          {role === 'homemaker' && (
            <WasteStats
              categories={categoriesStats}
              onExportReport={handleOpenExport}
            />
          )}

          {/* Settings options */}
          <SettingsMenu
            role={role}
            onOpenAccount={() => setIsAccountOpen(true)}
            onLogout={handleOpenLogout}
            onLeaveGroup={handleOpenLeaveGroup}
          />
        </div>

        {/* MODALS */}
        <AvatarModal
          isOpen={isAvatarOpen}
          currentAvatar={user.avatar}
          onSelectAvatar={handleSelectAvatar}
          onClose={() => setIsAvatarOpen(false)}
        />

        <AccountModal
          isOpen={isAccountOpen}
          name={user.name}
          email={user.email}
          onUpdateProfile={handleUpdateProfile}
          onUpdatePassword={handleUpdatePassword}
          onClose={() => setIsAccountOpen(false)}
        />

        <ConfirmModal
          isOpen={isConfirmOpen}
          variant={confirmVariant}
          memberName={selectedMember ? selectedMember.name : user.name}
          onConfirm={handleConfirmAction}
          onCancel={() => setIsConfirmOpen(false)}
        />
      </div>
    </>
  );
};

export default ProfileFeature;
