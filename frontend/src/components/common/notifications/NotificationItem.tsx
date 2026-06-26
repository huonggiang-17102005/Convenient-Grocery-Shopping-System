import React from 'react';
import { Bell, Check, Trash2, Edit2, Heart, Info, Clock, UserPlus, UserMinus, CheckCircle2, AlertTriangle, UserCheck, Shield, UserX, ClipboardList, CalendarPlus, CalendarMinus } from 'lucide-react';
import type { AppNotification } from '../../../types/notification';
import { useNotifications } from '../../../contexts/NotificationContext';

interface Props {
  notif: AppNotification;
}

export const NotificationItem: React.FC<Props> = ({ notif }) => {
  const { markAsRead, checkIsRead } = useNotifications();
  const isRead = checkIsRead(notif.id);

  const getIcon = (type: string) => {
    switch(type) {
      // Inventory Flow
      case 'ADD': return <Check size={18} color="#4CAF50" />;
      case 'CONSUME': return <Info size={18} color="#FF9800" />;
      case 'WASTE': return <Trash2 size={18} color="#F44336" />;
      case 'UPDATE': return <Edit2 size={18} color="#2196F3" />;
      case 'EXPIRE': return <Clock size={18} color="#F44336" />;
      
      // Recipe Flow
      case 'LIKE': return <Heart size={18} color="#E91E63" />;
      case 'RECIPE_APPROVED': return <CheckCircle2 size={18} color="#4CAF50" />;
      
      // Meal Plan Flow
      case 'MEAL_PLAN_ADD': return <CalendarPlus size={18} color="#4CAF50" />;
      case 'MEAL_PLAN_REMOVE': return <CalendarMinus size={18} color="#F44336" />;
      
      // Task Flow
      case 'TASK_ASSIGN': return <ClipboardList size={18} color="#9C27B0" />;
      case 'TASK_UNASSIGN': return <UserMinus size={18} color="#757575" />;
      case 'TASK_COMPLETE': return <CheckCircle2 size={18} color="#4CAF50" />;
      case 'TASK_OVERDUE': return <AlertTriangle size={18} color="#FF5722" />;
      case 'TASK_DELETE': return <Trash2 size={18} color="#F44336" />;
      
      // Member Flow
      case 'FAMILY_JOIN': return <UserCheck size={18} color="#4CAF50" />;
      case 'FAMILY_ROLE': return <Shield size={18} color="#673AB7" />;
      case 'FAMILY_LEAVE': return <UserX size={18} color="#F44336" />;
      
      default: return <Bell size={18} color="#757575" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  const handleNotifClick = () => {
    if (!isRead) markAsRead(notif.id);
  };

  return (
    <div 
      className={`notif-item ${!isRead ? 'unread' : ''}`}
      onClick={handleNotifClick}
    >
      <div className="notif-icon-wrapper">{getIcon(notif.type)}</div>
      <div className="notif-content">
        <p className="notif-text">
          <strong>{notif.title}</strong><br/>
          <span dangerouslySetInnerHTML={{ __html: notif.message }} />
        </p>
        <span className="notif-time">{formatTime(notif.created_at)}</span>
      </div>
      {!isRead && <div className="unread-dot"></div>}
    </div>
  );
};
