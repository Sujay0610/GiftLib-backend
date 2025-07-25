'use client';

import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/LoginPage';
import MainApp from '@/components/MainApp';
import LoadingSpinner from '@/components/LoadingSpinner';

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn ? <MainApp /> : <LoginPage />}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}