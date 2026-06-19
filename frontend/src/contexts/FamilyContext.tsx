import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FamilyMember } from '../features/profile/components/FamilySection';
import { useAuth } from './AuthContext';

interface FamilyContextType {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  refreshMembers: () => Promise<void>;
  isLoading: boolean;
}

const FamilyContext = createContext<FamilyContextType>({
  familyMembers: [],
  setFamilyMembers: () => {},
  refreshMembers: async () => {},
  isLoading: false,
});

export const useFamilyContext = () => useContext(FamilyContext);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const cached = localStorage.getItem('cached_family_members');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const refreshMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      setIsLoading(true);

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/families/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.data) {
        const mapped: FamilyMember[] = data.data.map((m: any) => ({
          id: m.id,
          name: m.full_name || '',
          avatar: m.avatar || '👤',
          role: m.role ? m.role.toLowerCase() : 'member',
          isCurrentUser: m.id === user.id,
        }));
        setFamilyMembers(mapped);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành viên:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch lần đầu khi Provider mount
  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  // Cập nhật localStorage mỗi khi familyMembers thay đổi
  useEffect(() => {
    localStorage.setItem('cached_family_members', JSON.stringify(familyMembers));
  }, [familyMembers]);

  return (
    <FamilyContext.Provider value={{ familyMembers, setFamilyMembers, refreshMembers, isLoading }}>
      {children}
    </FamilyContext.Provider>
  );
};

export default FamilyContext;
