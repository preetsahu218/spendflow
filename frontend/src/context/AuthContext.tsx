import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, currency?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('spendflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('spendflow_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      const savedToken = localStorage.getItem('spendflow_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('spendflow_user', JSON.stringify(res.data.data));
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('spendflow_token');
          localStorage.removeItem('spendflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    fetchCurrentProfile();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: jwtToken } = res.data.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('spendflow_token', jwtToken);
    localStorage.setItem('spendflow_user', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, password: string, currency: string = 'USD') => {
    const res = await api.post('/auth/register', { name, email, password, currency });
    const { user: userData, token: jwtToken } = res.data.data;
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('spendflow_token', jwtToken);
    localStorage.setItem('spendflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('spendflow_token');
    localStorage.removeItem('spendflow_user');
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('spendflow_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
