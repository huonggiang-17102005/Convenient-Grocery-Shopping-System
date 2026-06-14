import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FamilyMember } from '../features/profile/components/FamilySection';

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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) return;

      const currentUser = JSON.parse(userStr);
      setIsLoading(true);

      const res = await fetch('http://localhost:5000/api/families/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.data) {
        const mapped: FamilyMember[] = data.data.map((m: any) => ({
          id: m.id,
          name: m.full_name || '',
          avatar: m.avatar || '👤',
          role: m.role ? m.role.toLowerCase() : 'member',
          isCurrentUser: m.id === currentUser.id,
        }));
        setFamilyMembers(mapped);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành viên:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch lần đầu khi Provider mount
  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  return (
    <FamilyContext.Provider value={{ familyMembers, setFamilyMembers, refreshMembers, isLoading }}>
      {children}
    </FamilyContext.Provider>
  );
};

export default FamilyContext;
