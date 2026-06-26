import React, { useState } from 'react';

export interface UnitStat {
  unit: string;
  total: number;
  consumed: number;
  wasted: number;
  consumedPercent: number;
  wastedPercent: number;
}

export interface CategoryStat {
  name: string;
  total: number;
  unit: string;
  consumed: number;
  consumedPercent: number;
  wasted: number;
  wastedPercent: number;
  color: string;
  isMultipleUnits?: boolean;
  unitsData?: UnitStat[];
}

interface WasteStatsProps {
  categories: CategoryStat[];
  onExportReport: () => void;
}

const CategoryStatRow: React.FC<{ stat: CategoryStat }> = ({ stat }) => {
  const formatVal = (val: number) => {
    if (val === undefined || val === null) return '0';
    return (Math.round((val + Number.EPSILON) * 100) / 100).toString();
  };

  const isMultiple = stat.isMultipleUnits && stat.unitsData;

  const totalText = isMultiple 
    ? `${formatVal(stat.unitsData!.find(u => u.unit === 'g')?.total ?? 0)} g, ${formatVal(stat.unitsData!.find(u => u.unit === 'ml')?.total ?? 0)} ml`
    : `${formatVal(stat.total)} ${stat.unit}`;

  const consumedText = isMultiple
    ? `${formatVal(stat.unitsData!.find(u => u.unit === 'g')?.consumed ?? 0)} g, ${formatVal(stat.unitsData!.find(u => u.unit === 'ml')?.consumed ?? 0)} ml (${formatVal(stat.consumedPercent)}%)`
    : `${formatVal(stat.consumed)} ${stat.unit} (${formatVal(stat.consumedPercent)}%)`;

  const wastedText = isMultiple
    ? `${formatVal(stat.unitsData!.find(u => u.unit === 'g')?.wasted ?? 0)} g, ${formatVal(stat.unitsData!.find(u => u.unit === 'ml')?.wasted ?? 0)} ml (${formatVal(stat.wastedPercent)}%)`
    : `${formatVal(stat.wasted)} ${stat.unit} (${formatVal(stat.wastedPercent)}%)`;

  return (
    <div style={{ width: '100%', paddingTop: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
      <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
        <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 6, display: 'flex' }}>
          <div style={{ width: 8, height: 8, position: 'relative', background: stat.color, borderRadius: 42770700 }} />
          <div style={{ position: 'relative', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '19.50px', wordWrap: 'break-word' }}>
            {stat.name}
          </div>
        </div>
        <div style={{ position: 'relative', color: '#757575', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '16.50px', wordWrap: 'break-word' }}>
          Tổng: {totalText}
        </div>
      </div>
      
      <div style={{ alignSelf: 'stretch', paddingTop: 6, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
        <div style={{ width: '100%', height: 10, background: '#E0E0E0', overflow: 'hidden', borderRadius: 42770700, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ width: `${stat.consumedPercent}%`, height: 10, position: 'relative', background: '#2E7D32' }} />
          <div style={{ width: `${stat.wastedPercent}%`, height: 10, position: 'relative', background: '#D32F2F' }} />
        </div>
      </div>
      
      <div style={{ width: '100%', paddingTop: 4, justifyContent: 'space-between', alignItems: 'center', display: 'inline-flex' }}>
        <div style={{ position: 'relative', color: '#2E7D32', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '16.50px', wordWrap: 'break-word' }}>
          Tiêu thụ: {consumedText}
        </div>
        <div style={{ position: 'relative', color: '#D32F2F', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '16.50px', wordWrap: 'break-word' }}>
          Lãng phí: {wastedText}
        </div>
      </div>
    </div>
  );
};

const WasteStats: React.FC<WasteStatsProps> = ({ categories, onExportReport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_COUNT = 3;
  const remainingCount = categories.length - INITIAL_COUNT;

  return (
    <div className="profile-section" id="waste-stats-report">
      <h2 className="profile-section-title">Thống kê lãng phí tháng {new Date().getMonth() + 1}</h2>
      <div style={{ alignSelf: 'stretch', padding: 16, background: 'white', borderRadius: 16, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
        <div style={{ width: '100%', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
          {categories.length === 0 ? (
            <div style={{ color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', width: '100%', textAlign: 'center', padding: '16px 0 0 0' }}>
              Chưa có dữ liệu thống kê lãng phí cho tháng này.
            </div>
          ) : (
            categories.map((stat, index) => {
              const isCollapsed = !isExpanded && index >= INITIAL_COUNT;
              return (
                <div 
                  key={index} 
                  className={isCollapsed ? 'waste-stat-collapsed-row' : ''}
                  style={{ 
                    width: '100%', 
                    marginTop: index === 0 ? -16 : 0,
                    display: isCollapsed ? 'none' : 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <CategoryStatRow stat={stat} />
                </div>
              );
            })
          )}
        </div>
        
        {categories.length > INITIAL_COUNT && (
          <div className="no-print" style={{ width: '100%', paddingTop: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
            <div 
              onClick={() => setIsExpanded(!isExpanded)}
              style={{ width: '100%', height: 36, background: '#FAFAFA', borderRadius: 100, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', justifyContent: 'center', alignItems: 'center', display: 'inline-flex', cursor: 'pointer' }}
            >
              <div style={{ textAlign: 'center', color: '#FF8A00', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '18px', wordWrap: 'break-word' }}>
                {isExpanded ? 'Thu gọn ▲' : `Xem thêm ${remainingCount} danh mục ▼`}
              </div>
            </div>
          </div>
        )}

        <div className="no-print" style={{ width: '100%', paddingTop: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex' }}>
          <button 
            onClick={onExportReport}
            disabled={categories.length === 0}
            style={{ width: '100%', height: 44, background: categories.length === 0 ? '#E0E0E0' : '#FF8A00', cursor: categories.length === 0 ? 'default' : 'pointer', borderRadius: 100, border: 'none', outline: 'none', justifyContent: 'center', alignItems: 'center', gap: 8, display: 'inline-flex' }}
          >
            <div style={{ width: 20, height: 20, position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 13.33, height: 16.66, left: 3.33, top: 1.67, position: 'absolute', outline: '1.67px white solid', outlineOffset: '-0.83px' }} />
              <div style={{ width: 5, height: 5, left: 11.66, top: 1.67, position: 'absolute', outline: '1.67px white solid', outlineOffset: '-0.83px' }} />
              <div style={{ width: 5, height: 2.50, left: 7.50, top: 12.50, position: 'absolute', outline: '1.67px white solid', outlineOffset: '-0.83px' }} />
            </div>
            <div style={{ textAlign: 'center', color: categories.length === 0 ? '#9E9E9E' : 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px', wordWrap: 'break-word' }}>
              Xuất báo cáo gia đình
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WasteStats;
