import React, { useState } from 'react';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; 

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Mật khẩu ít nhất có 6 kí tự');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Lưu ý: Backend hiện tại chỉ lưu email và password, tạm thời chưa gửi name xuống DB
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Đăng ký thành công thì nhảy sang trang chọn vai trò
      navigate('/choose-role');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo">
          <ShoppingCart size={32} color="#1A1A1A" />
        </div>
        <h1 className="auth-title">Chào mừng đến BridMate</h1>
        <p className="auth-subtitle">Bắt đầu quản lý bếp nhà thông minh</p>
      </div>

      <div className="auth-toggle">
        <div 
          className="toggle-btn"
          onClick={() => navigate('/')}
        >
          Đăng nhập
        </div>
        <div className="toggle-btn active">
          Đăng ký
        </div>
      </div>

      <form className="auth-form" onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>
          <input 
            id="name"
            type="text" 
            placeholder="Nguyễn Văn A" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            placeholder="your@email.com" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <div className="input-wrapper">
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={20} color="#757575" /> : <EyeOff size={20} color="#757575" />}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div className="input-wrapper">
            <input 
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="••••••••" 
              required 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <Eye size={20} color="#757575" /> : <EyeOff size={20} color="#757575" />}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{ color: 'red', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
            {errorMsg}
          </div>
        )}

        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>
      </form>
    </div>
  );
}
