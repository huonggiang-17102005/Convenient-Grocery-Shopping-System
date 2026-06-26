import React, { useState, useEffect } from 'react';
import '../profile.css';
import ExpirationWarningSetting from '../components/ExpirationWarningSetting';

interface FamilySettingsModalProps {
  isOpen: boolean;
  name: string;
  dailyCalorieTarget: number;
  onUpdateFamilySettings: (name: string, dailyCalorieTarget: number) => Promise<void>;
  onClose: () => void;
  warningDays?: number;
  onUpdateWarningDays?: (days: number) => Promise<void>;
}

const FamilySettingsModal: React.FC<FamilySettingsModalProps> = ({
  isOpen,
  name,
  dailyCalorieTarget,
  onUpdateFamilySettings,
  onClose,
  warningDays,
  onUpdateWarningDays,
}) => {
  const [inputName, setInputName] = useState(name);
  const [inputTarget, setInputTarget] = useState(dailyCalorieTarget);
  const [inputWarningDays, setInputWarningDays] = useState(warningDays ?? 3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputName(name);
      setInputTarget(dailyCalorieTarget);
      if (warningDays !== undefined) {
        setInputWarningDays(warningDays);
      }
    }
  }, [isOpen, name, dailyCalorieTarget, warningDays]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateFamilySettings(inputName.trim(), Number(inputTarget));
      if (onUpdateWarningDays && inputWarningDays !== warningDays) {
        await onUpdateWarningDays(inputWarningDays);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={handleOverlayClick}>
      <div className="profile-modal-card">
        <h3 className="profile-modal-title profile-modal-title--default" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 700 }}>Cấu hình nhóm gia đình</h3>

        <form onSubmit={handleSubmit}>
          {/* Tên nhóm gia đình */}
          <div className="profile-form-group">
            <label className="profile-form-label" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>Tên nhóm gia đình</label>
            <input
              type="text"
              className="profile-form-input"
              placeholder="Nhập tên nhóm gia đình"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              required
            />
          </div>

          {/* Ngưỡng calo tiêu chuẩn ngày */}
          <div className="profile-form-group">
            <label className="profile-form-label" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>Mục tiêu Calo ngày (kcal/người)</label>
            <input
              type="number"
              className="profile-form-input"
              placeholder="Ví dụ: 2000"
              value={inputTarget}
              onChange={(e) => setInputTarget(Number(e.target.value))}
              min={500}
              max={10000}
              required
            />
          </div>

          {/* Expiration Warning Setting */}
          {warningDays !== undefined && onUpdateWarningDays && (
            <div className="profile-form-group">
              <label className="profile-form-label" style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}>Cài đặt thông báo</label>
              <ExpirationWarningSetting 
                initialDays={inputWarningDays} 
                onChangeDays={setInputWarningDays} 
              />
            </div>
          )}

          {/* Form actions */}
          <div className="profile-form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="profile-form-btn profile-form-btn--primary"
              style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
            <button
              type="button"
              className="profile-form-btn profile-form-btn--secondary"
              onClick={onClose}
              style={{ fontFamily: 'Plus Jakarta Sans', fontWeight: 600 }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilySettingsModal;
