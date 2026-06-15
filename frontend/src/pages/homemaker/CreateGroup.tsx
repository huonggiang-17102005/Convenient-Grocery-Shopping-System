import React, { useState } from 'react';
import { ArrowLeft, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../contexts/AuthContext';
import './CreateGroup.css';

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [groupCode, setGroupCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/families/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: groupName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data.message || 'Lỗi khi tạo nhóm') + (data.error ? ': ' + data.error : ''));
      }

      await refreshUser();

      setGroupCode(data.family.invite_code);
      setShowPopup(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupCode);
    alert('Đã sao chép mã nhóm!');
  };

  const handleGoToDashboard = () => {
    navigate('/homemaker/dashboard');
  };

  return (
    <div className="create-group-container">
      <div className="create-group-header">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
          title="Quay lại"
          aria-label="Quay lại"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="header-title">Tạo nhóm gia đình</h1>
      </div>
      
      <div className="create-group-content">
        <div className="input-group">
          <input 
            type="text" 
            className="group-name-input"
            placeholder="Nhập tên nhóm gia đình của bạn..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        
        <button 
          type="button"
          className={`create-btn ${groupName.trim() ? 'active' : ''}`}
          onClick={handleCreateGroup}
          disabled={!groupName.trim() || isLoading}
        >
          {isLoading ? 'Đang tạo...' : 'Tạo nhóm ngay'}
        </button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3 className="popup-title">Mã nhóm của bạn</h3>
            
            <div className="group-code-container">
              <span className="group-code-text">{groupCode}</span>
              <button className="copy-btn" onClick={handleCopyCode} title="Sao chép">
                <Copy size={20} color="#FF8A00" />
              </button>
            </div>

            <div className="qr-code-wrapper">
              <div className="qr-placeholder" style={{ background: 'white' }}>
                <div className="qr-icon-text">
                  <QRCodeSVG 
                    value={`http://localhost:5173/join?code=${groupCode}`} 
                    size={160} 
                    level="H" 
                  />
                </div>
              </div>
            </div>

            <button className="popup-action-btn" onClick={handleGoToDashboard}>
              Vào màn hình chính
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroup;
