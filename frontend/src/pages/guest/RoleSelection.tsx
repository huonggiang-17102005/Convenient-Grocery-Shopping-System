import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

export default function RoleSelection() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Homemaker' | 'Member' | null>(null);

  const handleSelectRole = async (role: 'Homemaker' | 'Member') => {
    setSelectedRole(role);
    setErrorMsg('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại để chọn vai trò.');
      }

      const response = await fetch(`http://localhost:5000/api/users/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật vai trò');
      }

      // Cập nhật lại thông tin user trong localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.role = role;
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Điều hướng dựa vào vai trò
      if (role === 'Homemaker') {
        navigate('/homemaker/create-group');
      } else {
        navigate('/member/join-group');
      }

    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi cập nhật vai trò');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-header">
        <h1 className="role-title">Bạn là ai trong gia đình?</h1>
        <p className="role-subtitle">Chọn vai trò để chúng tôi cá nhân hóa</p>
      </div>

      {errorMsg && (
        <div style={{ color: 'red', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#FF8A00', fontWeight: 'bold' }}>
          Đang cập nhật vai trò...
        </div>
      ) : (
        <div className="role-cards-container">
          <div 
            className={`role-card ${selectedRole === 'Homemaker' ? 'active' : ''}`}
            onClick={() => handleSelectRole('Homemaker')}
          >
            <div className="role-icon-wrapper">
              <span className="role-icon">🏠</span>
            </div>
            <h3 className="role-card-title">Người nội trợ</h3>
            <p className="role-card-desc">Quản lý tủ lạnh, lên thực đơn, phân công mua sắm</p>
          </div>

          <div 
            className={`role-card ${selectedRole === 'Member' ? 'active' : ''}`}
            onClick={() => handleSelectRole('Member')}
          >
            <div className="role-icon-wrapper">
              <span className="role-icon">👨‍👩‍👧</span>
            </div>
            <h3 className="role-card-title">Thành viên gia đình</h3>
            <p className="role-card-desc">Tham gia mua sắm chung, nhận nhiệm vụ</p>
          </div>
        </div>
      )}
    </div>
  );
}
