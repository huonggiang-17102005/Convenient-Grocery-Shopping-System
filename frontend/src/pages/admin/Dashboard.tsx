import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface DashboardStats {
  totalUsers: number;
  activeFamilies: number;
  pendingRecipes: number;
  wasteRate: number;
  userGrowthRate?: number;
  chartData: {
    labels: string[];
    data: number[];
  };
}

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; value: number; label: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard-stats');
        // Shield frontend from crashing if backend fails
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Helper function to render dynamic SVG chart
  const renderChart = () => {
    if (!stats || !stats.chartData || stats.chartData.data.length === 0) return null;
    
    const data = stats.chartData.data;
    const labels = stats.chartData.labels;
    
    const chartWidth = 730;
    const chartHeight = 271;
    const xPadding = 20; 
    
    // Calculate Max Value to define Y-axis scale
    let maxData = Math.max(...data);
    let maxVal = 50; // Default minimum max value to get steps of 10 (0, 10, 20, 30, 40, 50)
    
    if (maxData > 50) {
      // Round maxVal to nice numbers that are multiples of 5 to avoid decimals
      const digits = maxData.toString().length;
      const roundTo = Math.pow(10, digits - 1);
      // E.g. maxData 123 -> digits 3 -> roundTo 100 -> ceil(123/100)*100 = 200. Steps: 40
      maxVal = Math.ceil(maxData / roundTo) * roundTo;
    }

    // Y-Axis Steps (5 intervals)
    const ySteps = [maxVal, maxVal * 0.8, maxVal * 0.6, maxVal * 0.4, maxVal * 0.2, 0];
    
    // Generate Points string for SVG polyline
    // X distance between points
    const dx = (chartWidth - 2 * xPadding) / (data.length - 1);
    
    const points = data.map((val, i) => {
      const x = xPadding + i * dx;
      const y = chartHeight - (val / maxVal) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="admin-db-chart-container">
        {/* Y-Axis Labels */}
        <div style={{ width: '44px', height: '227px', paddingRight: '8px', left: '-4.30px', top: '-15px', position: 'absolute', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'flex-end' }}>
          {ySteps.map((step, i) => (
            <div key={i} style={{ color: '#757575', fontSize: '11px', textAlign: 'right' }}>
              {step >= 1000 ? `${(step / 1000).toFixed(1)}K` : step}
            </div>
          ))}
        </div>

        {/* Chart Grid and Lines */}
        <div style={{ width: `${chartWidth}px`, height: `${chartHeight}px`, left: '48px', top: '0px', position: 'absolute', borderLeft: '0.80px solid #E0E0E0', borderBottom: '0.80px solid #E0E0E0' }}>
          {/* Horizontal Grid lines */}
          <div style={{ width: '100%', height: '20%', borderBottom: '0.80px solid #E0E0E0' }}></div>
          <div style={{ width: '100%', height: '20%', borderBottom: '0.80px solid #E0E0E0' }}></div>
          <div style={{ width: '100%', height: '20%', borderBottom: '0.80px solid #E0E0E0' }}></div>
          <div style={{ width: '100%', height: '20%', borderBottom: '0.80px solid #E0E0E0' }}></div>
          
          {/* SVG Chart Line */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, overflow: 'visible' }}>
            <polyline
              fill="none"
              stroke="#7C4DFF"
              strokeWidth="3"
              points={points}
            />
            {data.map((val, i) => {
              const x = xPadding + i * dx;
              const y = chartHeight - (val / maxVal) * chartHeight;
              return (
                <circle 
                  key={i} 
                  cx={x} 
                  cy={y} 
                  r="6" 
                  fill={activeTooltip && activeTooltip.x === x ? '#fff' : '#7C4DFF'} 
                  stroke="#7C4DFF"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => {
                    setActiveTooltip({ x, y, value: val, label: labels[i] });
                  }}
                  onMouseLeave={() => {
                    setActiveTooltip(null);
                  }}
                />
              );
            })}
          </svg>
          
          {/* Tooltip Overlay */}
          {activeTooltip && (
            <div 
              style={{
                position: 'absolute',
                left: `${activeTooltip.x}px`,
                top: `${activeTooltip.y - 40}px`,
                transform: 'translate(-50%, -100%)',
                background: '#fff',
                border: '1px solid #E0E0E0',
                borderRadius: '6px',
                padding: '6px 10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                zIndex: 10,
                pointerEvents: 'none',
                minWidth: '100px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', color: '#757575', marginBottom: '2px' }}>{activeTooltip.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#7C4DFF' }}>{activeTooltip.value}</div>
              {/* Tooltip Arrow */}
              <div style={{
                position: 'absolute',
                bottom: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '10px',
                height: '10px',
                background: '#fff',
                borderRight: '1px solid #E0E0E0',
                borderBottom: '1px solid #E0E0E0',
              }}></div>
            </div>
          )}
        </div>

        {/* X-Axis Labels */}
        <div style={{ width: `${chartWidth}px`, height: '48px', padding: '0 8px', left: '39.70px', top: '263px', position: 'absolute', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {labels.map((label, i) => (
            <div key={i} style={{ color: '#757575', fontSize: '11px', width: '20px', textAlign: 'center' }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar */}
      <div className="admin-db-sidebar">
        <div className="admin-db-logo">
          <div className="admin-db-logo-text">FridMate Admin</div>
        </div>
        
        <div className="admin-db-nav">
          <div className="admin-db-nav-item active" onClick={() => navigate('/admin/dashboard')}>
            <div className="admin-db-nav-text">Tổng quan</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/users')}>
            <div className="admin-db-nav-text">Quản lý người dùng</div>
          </div>
          <div className="admin-db-nav-item">
            <div className="admin-db-nav-text">Kiểm duyệt nội dung</div>
          </div>
          <div className="admin-db-nav-item">
            <div className="admin-db-nav-text">Quản lý dữ liệu nền</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/settings')}>
            <div className="admin-db-nav-text">Báo cáo & Cài đặt</div>
          </div>
        </div>

        <div className="admin-db-logout-container">
          <div className="admin-db-logout-btn" onClick={handleLogout}>
            <div className="admin-db-logout-text">Đăng xuất</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-db-main">
        <div className="admin-db-content">
          {/* Header */}
          <div className="admin-db-header">
            <h1 className="admin-db-title">Tổng quan hệ thống</h1>
            <div className="admin-db-profile">
              <div className="admin-db-avatar">{
                (() => {
                  try {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    if (user.role === 'Admin' || user.role === 'admin') return 'A';
                    const name = user.name || user.full_name || user.email || 'Admin';
                    return name.charAt(0).toUpperCase();
                  } catch {
                    return 'A';
                  }
                })()
              }</div>
              <div className="admin-db-profile-name">{
                (() => {
                  try {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    if (user.role === 'Admin' || user.role === 'admin') return 'Admin System';
                    return user.name || user.full_name || user.email?.split('@')[0] || 'Admin System';
                  } catch {
                    return 'Admin System';
                  }
                })()
              }</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="admin-db-stats-grid">
            <div className="admin-db-card">
              <div className="admin-db-card-label">Tổng người dùng</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="admin-db-card-value">
                  {stats ? stats.totalUsers.toLocaleString() : '...'}
                </div>
                {stats && stats.userGrowthRate !== undefined && stats.userGrowthRate > 0 && (
                  <div className="admin-db-badge-success">+{stats.userGrowthRate}%</div>
                )}
                {stats && stats.userGrowthRate !== undefined && stats.userGrowthRate < 0 && (
                  <div className="admin-db-badge-danger">{stats.userGrowthRate}%</div>
                )}
                {stats && stats.userGrowthRate !== undefined && stats.userGrowthRate === 0 && (
                  <div className="admin-db-badge-neutral">0%</div>
                )}
                {(!stats || stats.userGrowthRate === undefined) && (
                  <div className="admin-db-badge-neutral">...</div>
                )}
              </div>
            </div>
            
            <div className="admin-db-card">
              <div className="admin-db-card-label">Nhóm gia đình hoạt động</div>
              <div className="admin-db-card-value">
                {stats ? stats.activeFamilies.toLocaleString() : '...'}
              </div>
            </div>
            
            <div className="admin-db-card">
              <div className="admin-db-card-label">Công thức chờ duyệt</div>
              <div className="admin-db-card-value danger">
                {stats ? stats.pendingRecipes : '...'}
              </div>
              <div className="admin-db-card-bg-line"></div>
            </div>
            
            <div className="admin-db-card">
              <div className="admin-db-card-label">Tỷ lệ lãng phí hệ thống</div>
              <div className="admin-db-card-value">
                {stats ? `${stats.wasteRate}%` : '...'}
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="admin-db-chart-section">
            <div className="admin-db-chart-title">Xu hướng tăng trưởng người dùng (7 ngày gần nhất)</div>
            {renderChart()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
