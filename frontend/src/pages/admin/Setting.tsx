import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import CustomSelect from '../../components/common/CustomSelect';
import './Dashboard.css';
import './Setting.css';

interface WasteReportData {
  category: string;
  wasteRate: number;
}

const COLORS = [
  '#FFB74D', // Rau củ (Orange)
  '#EF5350', // Thịt cá (Red)
  '#42A5F5', // Đồ uống (Blue)
  '#AB47BC', // Gia vị (Purple)
  '#66BB6A', // Green
  '#26C6DA', // Cyan
  '#D4E157', // Lime
  '#8D6E63', // Brown
  '#78909C'  // Blue Grey
];

const getColorForCategory = (category: string, index: number) => {
  if (category === 'Rau củ quả' || category === 'Rau củ' || category === 'Vegetables') return '#FFB74D';
  if (category === 'Thịt cá' || category === 'Meat') return '#EF5350';
  if (category === 'Chất lỏng' || category === 'Đồ uống' || category === 'Drinks') return '#42A5F5';
  if (category === 'Gia vị' || category === 'Spices') return '#AB47BC';
  if (category === 'Trứng') return '#D4E157';
  if (category === 'Đồ khô') return '#8D6E63';
  return COLORS[index % COLORS.length];
};

const SettingAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'report' | 'settings'>('report');
  const [maxMembers, setMaxMembers] = useState(10);
  const [expiryDays, setExpiryDays] = useState(3);
  const [reportData, setReportData] = useState<WasteReportData[]>([]);

  // Default to current month (June 2026 based on mock data and current date)
  const [selectedMonth, setSelectedMonth] = useState<string>('6');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [isExporting, setIsExporting] = useState(false);

  const getHighestWasteCategory = () => {
    if (reportData.length === 0) return null;
    let max = reportData[0];
    for (let i = 1; i < reportData.length; i++) {
      if (reportData[i].wasteRate > max.wasteRate) {
        max = reportData[i];
      }
    }
    return max;
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      const element = document.getElementById('pdf-report-content');
      if (element) {
        const opt = {
          margin:       10,
          filename:     `BaoCao_FridMate_${selectedMonth || 'All'}_${selectedYear || 'All'}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };
        
        html2pdf().set(opt).from(element).save().then(() => {
          setIsExporting(false);
        });
      } else {
        setIsExporting(false);
      }
    }, 300);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Construct query params
        const params = new URLSearchParams();
        if (selectedYear) {
          params.append('year', selectedYear);
          if (selectedMonth) {
            params.append('month', selectedMonth);
          }
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/admin/waste-report?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } catch (err) {
        console.error('Error fetching waste report:', err);
      }
    };
    fetchReport();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}/admin/settings`);
        if (res.ok) {
          const data = await res.json();
          setMaxMembers(data.max_family_members || 10);
          setExpiryDays(data.default_expiry_warning_days || 3);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleApply = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          max_family_members: maxMembers,
          default_expiry_warning_days: expiryDays
        })
      });
      
      if (res.ok) {
        alert(`Đã lưu cài đặt thành công lên máy chủ:\n- Tối đa: ${maxMembers} người\n- Cảnh báo trước: ${expiryDays} ngày`);
      } else {
        const errorData = await res.json();
        alert(`Lỗi lưu cài đặt: ${errorData.message}\nChi tiết: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Lỗi kết nối đến máy chủ khi lưu cài đặt.');
    }
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar - Reused from Dashboard */}
      <div className="admin-db-sidebar">
        <div className="admin-db-logo">
          <div className="admin-db-logo-text">FridMate Admin</div>
        </div>
        
        <div className="admin-db-nav">
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/dashboard')}>
            <div className="admin-db-nav-text">Tổng quan</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/users')}>
            <div className="admin-db-nav-text">Quản lý người dùng</div>
          </div>
          <div className="admin-db-nav-item">
            <div className="admin-db-nav-text">Kiểm duyệt công thức</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/master-data')}>
            <div className="admin-db-nav-text">Quản lý dữ liệu gốc</div>
          </div>
          <div className="admin-db-nav-item active">
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
          <h1 className="admin-setting-title">Báo cáo & Cài đặt hệ thống</h1>
          
          <div className="admin-setting-tabs">
            <div className="admin-setting-tabs-border">
              <div 
                className={`admin-setting-tab ${activeTab === 'report' ? 'active' : ''}`}
                onClick={() => setActiveTab('report')}
              >
                Báo cáo thống kê
                {activeTab === 'report' && <div className="admin-setting-tab-indicator"></div>}
              </div>
              <div 
                className={`admin-setting-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                Cấu hình vận hành
                {activeTab === 'settings' && <div className="admin-setting-tab-indicator"></div>}
              </div>
            </div>
          </div>

          <div className="admin-setting-content">
            {activeTab === 'settings' ? (
              <div className="admin-setting-card">
                <h2 className="admin-setting-card-title">Cài đặt tham số vận hành hệ thống</h2>
                
                <div className="admin-setting-group">
                  {/* Max members */}
                  <div className="admin-setting-item">
                    <div className="admin-setting-label">Giới hạn số thành viên tối đa trong một nhóm</div>
                    <div className="admin-setting-desc">
                      Áp dụng cho tính năng chia tiền và quản lý hóa đơn nhóm ăn chung (Lunch Mate).
                    </div>
                    <div className="admin-setting-input-wrapper">
                      <div 
                        className="admin-setting-btn-minus" 
                        onClick={() => setMaxMembers(prev => Math.max(1, prev - 1))}
                      >−</div>
                      <div className="admin-setting-value">
                        <div className="admin-setting-number">{maxMembers}</div>
                        <div className="admin-setting-unit">người</div>
                      </div>
                      <div 
                        className="admin-setting-btn-plus" 
                        onClick={() => setMaxMembers(prev => prev + 1)}
                      >+</div>
                    </div>
                  </div>

                  {/* Expiry days */}
                  <div className="admin-setting-item">
                    <div className="admin-setting-label">Số ngày cảnh báo hết hạn mặc định</div>
                    <div className="admin-setting-desc">
                      Hệ thống sẽ gửi thông báo đẩy (Push Notification) trước khi thực phẩm trong tủ lạnh hết hạn.
                    </div>
                    <div className="admin-setting-input-wrapper">
                      <div 
                        className="admin-setting-btn-minus" 
                        onClick={() => setExpiryDays(prev => Math.max(1, prev - 1))}
                      >−</div>
                      <div className="admin-setting-value">
                        <div className="admin-setting-number">{expiryDays}</div>
                        <div className="admin-setting-unit">ngày</div>
                      </div>
                      <div 
                        className="admin-setting-btn-plus" 
                        onClick={() => setExpiryDays(prev => prev + 1)}
                      >+</div>
                    </div>
                  </div>
                </div>

                <div className="admin-setting-actions">
                  <button className="admin-setting-submit-btn" onClick={handleApply}>
                    Áp dụng cài đặt
                  </button>
                </div>
              </div>
            ) : (
              // Report Tab Content
              <div style={{ width: '835px', display: 'flex', flexDirection: 'column' }}>
                <div className="admin-setting-report-header">
                  <div className="admin-setting-filter">
                    <div className="admin-setting-filter-label">Thời gian:</div>
                    
                    <CustomSelect
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      options={[
                        { value: '', label: 'Tất cả các tháng' },
                        ...Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
                          value: m.toString(),
                          label: `Tháng ${m}`
                        }))
                      ]}
                      triggerHeight={40}
                      fontSize={14}
                      padding="0 16px"
                      className="admin-setting-filter-select"
                    />

                    <input 
                      type="number"
                      className="admin-setting-dropdown"
                      style={{ 
                        outline: 'none', 
                        width: '130px',
                        appearance: 'textfield' // Removes spinner arrows on some browsers
                      }}
                      placeholder="Nhập năm (VD: 2026)"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    />
                  </div>
                  <div className="admin-setting-export-btn" onClick={handleExportPDF} style={{ opacity: isExporting ? 0.5 : 1, pointerEvents: isExporting ? 'none' : 'auto' }}>
                    <div className="admin-setting-export-icon">
                      <FileText size={20} color="#DA291C" />
                    </div>
                    <div className="admin-setting-export-text">
                      {isExporting ? 'Đang xuất...' : 'Xuất file PDF'}
                    </div>
                  </div>
                </div>

                <div 
                  id="pdf-report-content" 
                  className={isExporting ? "" : "admin-setting-card"}
                  style={{ 
                    padding: isExporting ? '24px' : '28px', 
                    backgroundColor: '#FFFFFF',
                    marginTop: isExporting ? '0' : '24px',
                    border: isExporting ? 'none' : '0.80px solid #E0E0E0',
                    boxShadow: isExporting ? 'none' : '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Tiêu đề báo cáo chỉ xuất hiện trong file PDF */}
                  {isExporting && (
                    <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                      <h2 style={{ color: '#1A1A1A', fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        BÁO CÁO THỐNG KÊ LÃNG PHÍ THỰC PHẨM
                      </h2>
                      <p style={{ color: '#757575', fontSize: '14px', marginBottom: '4px' }}>
                        Hệ thống FridMate 
                      </p>
                      <p style={{ color: '#757575', fontSize: '14px' }}>
                        Kỳ báo cáo: {selectedMonth && selectedYear ? `Tháng ${selectedMonth} Năm ${selectedYear}` : selectedYear ? `Năm ${selectedYear}` : 'Tất cả thời gian'}
                      </p>
                    </div>
                  )}

                  <div className="admin-setting-report-body" style={{ marginTop: isExporting ? '24px' : '0' }}>
                    <h2 className="admin-setting-card-title">Phân tích tỷ lệ thực phẩm lãng phí do hết hạn trên toàn hệ thống</h2>
                    
                    <div className="admin-setting-chart-container">
                      {reportData.length > 0 ? reportData.map((item, index) => {
                        const color = getColorForCategory(item.category, index);

                        return (
                          <div className="admin-setting-bar-item" key={item.category}>
                            <div className="admin-setting-bar-header">
                              <span className="admin-setting-bar-label">{item.category}</span>
                              <span className="admin-setting-bar-value">{item.wasteRate}%</span>
                            </div>
                            <div className="admin-setting-bar-bg">
                              <div className="admin-setting-bar-fill" style={{ width: `${item.wasteRate}%`, background: color }}></div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div style={{ color: '#757575', fontStyle: 'italic' }}>Không có dữ liệu báo cáo...</div>
                      )}
                    </div>

                    <div className="admin-setting-legend" style={{ flexWrap: 'wrap' }}>
                      {reportData.map((item, index) => (
                        <div className="admin-setting-legend-item" key={item.category}>
                          <div className="admin-setting-legend-color" style={{ background: getColorForCategory(item.category, index) }}></div>
                          <span className="admin-setting-legend-label">{item.category}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer báo cáo (Nhận xét) chỉ xuất hiện trong PDF */}
                    {isExporting && reportData.length > 0 && (
                      <div style={{ marginTop: '40px' }}>
                        <div style={{ padding: '16px', backgroundColor: '#F9F9F9', borderLeft: '4px solid #DA291C', borderRadius: '8px' }}>
                          <h3 style={{ color: '#1A1A1A', fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Nhận xét:</h3>
                          <p style={{ color: '#1A1A1A', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                            Trong kỳ báo cáo, nhóm thực phẩm bị lãng phí nhiều nhất là <strong>{getHighestWasteCategory()?.category}</strong> với tỷ lệ <strong>{getHighestWasteCategory()?.wasteRate}%</strong>. 
                            Đề xuất hệ thống tăng cường gửi thông báo nhắc nhở sớm hơn cho người dùng khi mua các thực phẩm thuộc nhóm này để cải thiện tỷ lệ hao phí.
                          </p>
                        </div>
                        <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', padding: '0 32px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>Người lập báo cáo</p>
                            <p style={{ margin: 0, fontSize: '14px', color: '#757575' }}>FridMate Admin</p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#757575' }}>Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingAdmin;
