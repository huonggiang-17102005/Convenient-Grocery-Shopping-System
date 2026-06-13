import React from 'react';

interface WasteStatsProps {
  consumedPercent: number;
  wastedPercent: number;
  onExportReport: () => void;
}

const WasteStats: React.FC<WasteStatsProps> = ({
  consumedPercent,
  wastedPercent,
  onExportReport,
}) => {
  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Thống kê lãng phí</h2>
      <div className="profile-waste-card">
        {/* Progress bar */}
        <div className="profile-progress-bar" role="progressbar" aria-label="Thống kê tiêu thụ và lãng phí">
          <div
            className="profile-progress-consumed"
            style={{ width: `${consumedPercent}%` }}
          />
          <div
            className="profile-progress-wasted"
            style={{ width: `${wastedPercent}%` }}
          />
        </div>

        {/* Labels */}
        <div className="profile-waste-labels">
          <p className="profile-waste-label--consumed">Tiêu thụ: {consumedPercent}%</p>
          <p className="profile-waste-label--wasted">Lãng phí: {wastedPercent}%</p>
        </div>

        {/* Export button */}
        <button
          id="profile-export-report-btn"
          className="profile-export-btn"
          onClick={onExportReport}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3.33" y="1.67" width="13.33" height="16.66" rx="1" stroke="white" strokeWidth="1.67" fill="none"/>
            <rect x="11.66" y="1.67" width="5" height="5" rx="0.5" stroke="white" strokeWidth="1.67" fill="none"/>
            <rect x="7.5" y="12.5" width="5" height="2.5" rx="0.5" stroke="white" strokeWidth="1.67" fill="none"/>
          </svg>
          <span>Xuất báo cáo gia đình</span>
        </button>
      </div>
    </div>
  );
};

export default WasteStats;
