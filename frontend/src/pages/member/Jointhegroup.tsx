import React, { useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Jointhegroup.css';

const Jointhegroup: React.FC = () => {
  const navigate = useNavigate();
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    if (!groupCode.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập lại.');
        navigate('/');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/families/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: groupCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Mã nhóm không hợp lệ hoặc đã xảy ra lỗi');
      }
      
      // Update local storage user info
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        userObj.family_id = data.family.id;
        localStorage.setItem('user', JSON.stringify(userObj));
      }

      setIsLoading(false);
      navigate('/member/dashboard');
      
    } catch (error: any) {
      alert(error.message || 'Lỗi khi tham gia nhóm');
      setIsLoading(false);
    }
  };

  return (
    <div className="join-group-container">
      <div className="join-group-header">
        <div className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1A1A1A" />
        </div>
        <div className="header-title">Tham gia nhóm gia đình</div>
      </div>

      <div className="join-group-content">
        <div className="group-input-container">
          <input
            type="text"
            className="group-code-input"
            placeholder="Nhập mã nhóm (Ví dụ: FC-9821-AM)"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
          />
        </div>

        <button 
          className="join-btn" 
          onClick={handleJoin}
          disabled={!groupCode.trim() || isLoading}
        >
          {isLoading ? 'Đang tham gia...' : 'Tham gia nhóm'}
        </button>

        <div className="qr-scan-container">
          <div className="qr-scan-box" onClick={() => alert('Tính năng quét QR đang được phát triển!')}>
            <div className="qr-scan-icon">📷</div>
            <div className="qr-scan-line"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jointhegroup;
