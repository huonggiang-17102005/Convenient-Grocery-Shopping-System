import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Jointhegroup.css';

const Jointhegroup: React.FC = () => {
  const navigate = useNavigate();
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoin = async () => {
    if (!groupCode.trim()) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMsg('Vui lòng đăng nhập lại.');
        setIsLoading(false);
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
        throw new Error(data.message || 'Mã tham gia không tồn tại');
      }
      
      const meRes = await fetch(`http://localhost:5000/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const meData = await meRes.json();
      if (meData.success) {
        localStorage.setItem('user', JSON.stringify(meData.data));
      }

      setIsLoading(false);
      navigate('/member/dashboard');
      
    } catch (error: any) {
      setErrorMsg(error.message || 'Mã tham gia không tồn tại');
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
            className={`group-code-input ${errorMsg ? 'error' : ''}`}
            placeholder="Nhập mã nhóm (Ví dụ: FC-9821-AM)"
            value={groupCode}
            onChange={(e) => {
              setGroupCode(e.target.value);
              if (errorMsg) setErrorMsg('');
            }}
          />
          {errorMsg && <div className="error-message">{errorMsg}</div>}
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
