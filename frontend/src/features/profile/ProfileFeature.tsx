import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Toast from '@/components/shared/Toast';

export const ProfileFeature: React.FC<ProfileFeatureProps> = ({ role }) => {
  const navigate = useNavigate();

  // User details state
  const localUserStr = localStorage.getItem('user');
  const localUser = localUserStr ? JSON.parse(localUserStr) : null;

  const [user, setUser] = useState({
    name: localUser?.full_name || '',
    email: localUser?.email || '',
    avatar: localUser?.avatar || '',
    role: localUser?.role === 'Homemaker' ? 'Homemaker' : 'Thành viên',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          const freshUser = data.data;
          // Update local storage
          localStorage.setItem('user', JSON.stringify(freshUser));
          // Update state
          setUser({
            name: freshUser.full_name || '',
            email: freshUser.email || '',
            avatar: freshUser.avatar || '',
            role: freshUser.role === 'Homemaker' ? 'Homemaker' : 'Thành viên',
          });
        }
      } catch (err) {
        console.error('Lỗi khi lấy thông tin user:', err);
      }
    };
    fetchUser();
  }, []);

  // Family members list state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    role === 'homemaker'
      ? [
          { id: '1', name: 'Mỹ Anh', avatar: '👩', role: 'homemaker', isCurrentUser: true },
          { id: '2', name: 'Shin', avatar: '🧑', role: 'member', isCurrentUser: false },
          { id: '3', name: 'Bố Shin', avatar: '👨', role: 'member', isCurrentUser: false },
        ]
      : [
          { id: '1', name: 'Mỹ Anh', avatar: '👤', role: 'homemaker', isCurrentUser: false },
          { id: '2', name: 'Shin', avatar: '👨', role: 'member', isCurrentUser: true },
        ]
  );

  // Waste statistics state
  const [wasteStats] = useState({
    consumedPercent: 75,
    wastedPercent: 25,
  });

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
      const res = await fetch('http://localhost:5000/api/users/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ avatar: newAvatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật ảnh đại diện');
      
      setUser((prev) => ({ ...prev, avatar: newAvatar }));
      setFamilyMembers((prev) =>
        prev.map((m) => (m.isCurrentUser ? { ...m, avatar: newAvatar } : m))
      );
      
      if (localUser) {
        localUser.avatar = newAvatar;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
      triggerToast('Thay đổi ảnh đại diện thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Account Settings Handlers
  const handleUpdateProfile = async (newName: string, newEmail: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ full_name: newName, email: newEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật hồ sơ');
      
      setUser((prev) => ({ ...prev, name: newName, email: newEmail }));
      setFamilyMembers((prev) =>
        prev.map((m) => (m.isCurrentUser ? { ...m, name: newName } : m))
      );
      
      if (localUser) {
        localUser.full_name = newName;
        localUser.email = newEmail;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
      triggerToast('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Account Password Handlers
  const handleUpdatePassword = async (currentPass: string, newPass: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/password', {
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
  const handleConfirmAction = (data?: string) => {
    setIsConfirmOpen(false);

    if (confirmVariant === 'transfer' && selectedMember) {
      // Transfer Homemaker role to the selected member
      setFamilyMembers((prev) =>
        prev.map((m) => {
          if (m.id === selectedMember.id) {
            return { ...m, role: 'homemaker' };
          }
          if (m.isCurrentUser) {
            return { ...m, role: 'member' };
          }
          return m;
        })
      );
      setUser((prev) => ({ ...prev, role: 'Thành viên' }));
      triggerToast('Nhường quyền Homemaker thành công!');
    } else if (confirmVariant === 'delete' && selectedMember) {
      // Remove selected member from list
      setFamilyMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      triggerToast('Xóa thành viên thành công!');
    } else if (confirmVariant === 'logout') {
      // Clear token and user data from local storage
      //localStorage.removeItem('token');
      //localStorage.removeItem('user');
      triggerToast('Đăng xuất thành công!');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else if (confirmVariant === 'export') {
      const format = data === 'pdf' ? 'PDF' : 'Excel';
      triggerToast(`Xuất báo cáo gia đình định dạng ${format} thành công!`);
    } else if (confirmVariant === 'leave') {
      triggerToast('Rời nhóm thành công!');
      setTimeout(() => {
        navigate('/choose-role');
      }, 800);
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
              consumedPercent={wasteStats.consumedPercent}
              wastedPercent={wasteStats.wastedPercent}
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
