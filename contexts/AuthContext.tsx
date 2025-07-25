'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo } from '@/types';
import { apiService } from '@/lib/api';
import { storage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AuthContextType {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  apiKey: string;
  login: (apiKey: string, userInfo: UserInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedApiKey = apiService.getApiKey();
        const storedUserInfo = storage.get('giftlib_user_info');

        if (storedApiKey && storedUserInfo) {
          // Verify the API key is still valid
          try {
            const profile = await apiService.getUserProfile();
            setApiKey(storedApiKey);
            setUserInfo(storedUserInfo);
            setIsLoggedIn(true);
          } catch (error) {
            // API key is invalid, clear stored data
            apiService.removeApiKey();
            storage.remove('giftlib_user_info');
            toast.error('Session expired. Please login again.');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newApiKey: string, newUserInfo: UserInfo) => {
    setApiKey(newApiKey);
    setUserInfo(newUserInfo);
    setIsLoggedIn(true);
    
    // Store in localStorage
    apiService.setApiKey(newApiKey);
    storage.set('giftlib_user_info', newUserInfo);
    
    toast.success(`Welcome back, ${newUserInfo.full_name}!`);
  };

  const logout = () => {
    setApiKey('');
    setUserInfo(null);
    setIsLoggedIn(false);
    
    // Clear localStorage
    apiService.removeApiKey();
    storage.remove('giftlib_user_info');
    
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    isLoggedIn,
    userInfo,
    apiKey,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}