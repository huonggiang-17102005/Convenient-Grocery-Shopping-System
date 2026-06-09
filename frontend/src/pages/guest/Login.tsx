import React, { useState } from 'react';
import { ShoppingCart, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      // Lưu token vào localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/homemaker/dashboard');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Có lỗi xảy ra');
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
        <h1 className="auth-title">Chào mừng đến FridMate</h1>
        <p className="auth-subtitle">Bắt đầu quản lý bếp nhà thông minh</p>
      </div>

      <div className="auth-toggle">
        <div className="toggle-btn active">
          Đăng nhập
        </div>
        <div 
          className="toggle-btn"
          onClick={() => navigate('/register')}
        >
          Đăng ký
        </div>
      </div>

      <form className="auth-form" onSubmit={handleAuth}>
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
        
        <div className="forgot-password">
          <span>Quên mật khẩu?</span>
        </div>

        {errorMsg && (
          <div style={{ color: 'red', fontSize: '13px', marginBottom: '16px', textAlign: 'left' }}>
            {errorMsg}
          </div>
        )}

        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
