import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
  role: string;
  family_id: string | null;
}

export interface Family {
  id: string;
  name: string;
  invite_code: string;
}

interface AuthContextType {
  user: User | null;
  family: Family | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshFamily: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  family: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  refreshFamily: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive isAuthenticated based on the presence of user and token
  const isAuthenticated = !!user;

  const refreshFamily = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/families/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.family) {
        setFamily(data.family);
      } else {
        setFamily(null);
      }
    } catch (err) {
      console.error('Lỗi khi lấy thông tin gia đình:', err);
      setFamily(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Try to get cached user first for faster render
      const cachedUserStr = localStorage.getItem('user');
      if (cachedUserStr) {
        const cachedUser = JSON.parse(cachedUserStr);
        setUser(cachedUser);
        if (cachedUser.family_id) {
          // Fire family fetch asynchronously if we have family_id
          refreshFamily();
        }
      }

      // Then fetch fresh user data
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const freshUser = data.data;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        
        if (freshUser.family_id) {
          await refreshFamily();
        } else {
          setFamily(null);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshFamily]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.family_id) {
      refreshFamily();
    }
  }, [refreshFamily]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cached_notifications');
    localStorage.removeItem('cached_shopping_items');
    
    // Xóa bộ đệm nguyên liệu đã nấu
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('deducted_ingredients_')) {
        localStorage.removeItem(key);
      }
    });

    setUser(null);
    setFamily(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, family, isAuthenticated, isLoading, login, logout, refreshUser, refreshFamily }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
