import React, { useState, useEffect } from 'react';

interface ExpirationWarningSettingProps {
  initialDays: number;
  onChangeDays: (days: number) => void;
}

const ExpirationWarningSetting: React.FC<ExpirationWarningSettingProps> = ({ initialDays, onChangeDays }) => {
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    setDays(initialDays);
  }, [initialDays]);

  const handleDecrease = () => {
    if (days > 1) {
      const newDays = days - 1;
      setDays(newDays);
      onChangeDays(newDays);
    }
  };

  const handleIncrease = () => {
    if (days < 30) {
      const newDays = days + 1;
      setDays(newDays);
      onChangeDays(newDays);
    }
  };

  return (
    <div style={{
      alignSelf: 'stretch', 
      padding: 16, 
      background: 'white', 
      borderRadius: 12, 
      border: '1px solid #E0E0E0', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      display: 'flex',
      marginTop: 12,
      marginBottom: 12,
    }}>
      <div style={{color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '21px'}}>
        Cảnh báo hết hạn trước
      </div>
      <div style={{
        padding: 4, 
        background: '#F5F5F5', 
        borderRadius: 42, 
        border: '1px solid #E0E0E0', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        display: 'flex',
        gap: 8
      }}>
        <button 
          type="button"
          onClick={handleDecrease}
          disabled={days <= 1}
          style={{
            width: 28, 
            height: 28, 
            background: 'white', 
            boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)', 
            borderRadius: '50%', 
            justifyContent: 'center', 
            alignItems: 'center', 
            display: 'flex',
            border: 'none',
            cursor: days <= 1 ? 'not-allowed' : 'pointer',
            padding: 0
          }}
        >
          <span style={{color: days <= 1 ? '#CCC' : '#757575', fontSize: 16, fontWeight: '700'}}>−</span>
        </button>
        
        <div style={{width: 50, textAlign: 'center'}}>
          <span style={{color: '#1A1A1A', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '700'}}>
            {days} ngày
          </span>
        </div>
        
        <button 
          type="button"
          onClick={handleIncrease}
          disabled={days >= 30}
          style={{
            width: 28, 
            height: 28, 
            background: 'white', 
            boxShadow: '0px 1px 2px -1px rgba(0, 0, 0, 0.10), 0px 1px 3px rgba(0, 0, 0, 0.10)', 
            borderRadius: '50%', 
            justifyContent: 'center', 
            alignItems: 'center', 
            display: 'flex',
            border: 'none',
            cursor: days >= 30 ? 'not-allowed' : 'pointer',
            padding: 0
          }}
        >
          <span style={{color: days >= 30 ? '#CCC' : '#FF8A00', fontSize: 16, fontWeight: '700'}}>+</span>
        </button>
      </div>
    </div>
  );
};

export default ExpirationWarningSetting;
