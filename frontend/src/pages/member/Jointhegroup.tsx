import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Jointhegroup.css';

const Jointhegroup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [groupCode, setGroupCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { refreshUser } = useAuth();

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

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/families/join`, {
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
      
      await refreshUser();

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

      </div>
    </div>
  );
};

export default Jointhegroup;
