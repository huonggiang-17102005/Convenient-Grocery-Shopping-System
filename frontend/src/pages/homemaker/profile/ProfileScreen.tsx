import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import './ProfileScreen.css';

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

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();

  // User details state
  const [user, setUser] = useState({
    name: 'Mỹ Anh',
    email: 'myanh@gmail.com',
    avatar: '👩',
    role: 'Homemaker',
  });

  // Family members list state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: '1', name: 'Mỹ Anh', avatar: '👩', role: 'homemaker', isCurrentUser: true },
    { id: '2', name: 'Shin', avatar: '🧑', role: 'member', isCurrentUser: false },
    { id: '3', name: 'Bố Shin', avatar: '👨', role: 'member', isCurrentUser: false },
  ]);

  // Expiration days warning state
  const [expirationDays, setExpirationDays] = useState(3);

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
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Avatar Selection Handlers
  const handleSelectAvatar = (newAvatar: string) => {
    setUser((prev) => ({ ...prev, avatar: newAvatar }));
    
    // Also update current user avatar in the family list
    setFamilyMembers((prev) =>
      prev.map((m) => (m.isCurrentUser ? { ...m, avatar: newAvatar } : m))
    );
    triggerToast('Thay đổi ảnh đại diện thành công!');
  };

  // Account Settings Handlers
  const handleUpdateProfile = (newName: string, newEmail: string) => {
    setUser((prev) => ({ ...prev, name: newName, email: newEmail }));
    
    // Also update current user name in the family list
    setFamilyMembers((prev) =>
      prev.map((m) => (m.isCurrentUser ? { ...m, name: newName } : m))
    );
    triggerToast('Cập nhật hồ sơ thành công!');
  };

  const handleUpdatePassword = () => {
    triggerToast('Đổi mật khẩu thành công!');
  };

  // Family Actions Handlers
  const handleOpenTransfer = (member: FamilyMember) => {
    setSelectedMember(member);
    setConfirmVariant('transfer');
    setIsConfirmOpen(true);
  };

  const handleOpenDelete = (member: FamilyMember) => {
    setSelectedMember(member);
    setConfirmVariant('delete');
    setIsConfirmOpen(true);
  };

  const handleOpenLogout = () => {
    setSelectedMember(null);
    setConfirmVariant('logout');
    setIsConfirmOpen(true);
  };

  const handleOpenExport = () => {
    setSelectedMember(null);
    setConfirmVariant('export');
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
      // Mock logout by navigating to choose-role or root
      triggerToast('Đăng xuất thành công!');
      setTimeout(() => {
        navigate('/choose-role');
      }, 800);
    } else if (confirmVariant === 'export') {
      // Export report in chosen format
      const format = data === 'pdf' ? 'PDF' : 'Excel';
      triggerToast(`Xuất báo cáo gia đình định dạng ${format} thành công!`);
    }
  };

  return (
    <div className="profile-page">
      {/* Toast Notification */}
      <div className={`profile-toast-container ${showToast ? 'profile-toast-show' : ''}`}>
        <div className="profile-toast">
          <div className="profile-toast-icon">
            <Check size={16} color="white" strokeWidth={3} />
          </div>
          <div className="profile-toast-text">{toastMessage}</div>
        </div>
      </div>

      <div className="profile-white-card">
        {/* Page Title */}
        <h1 className="profile-title">Hồ sơ & Quản lý</h1>
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
          onTransfer={handleOpenTransfer}
          onDelete={handleOpenDelete}
        />

        {/* Waste Progress and Stats */}
        <WasteStats
          consumedPercent={wasteStats.consumedPercent}
          wastedPercent={wasteStats.wastedPercent}
          onExportReport={handleOpenExport}
        />

        {/* Settings options */}
        <SettingsMenu
          expirationDays={expirationDays}
          onChangeExpirationDays={setExpirationDays}
          onOpenAccount={() => setIsAccountOpen(true)}
          onLogout={handleOpenLogout}
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
  );
};

export default ProfileScreen;
