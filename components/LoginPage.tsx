'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { isValidEmail } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  // Login form state
  const [apiKey, setApiKey] = useState('');
  
  // Create user form state
  const [createUserForm, setCreateUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA'
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error('Please enter your API key');
      return;
    }

    setIsLoading(true);
    try {
      // Set the API key temporarily to test it
      apiService.setApiKey(apiKey);
      
      // Try to get user profile to validate the API key
      const userProfile = await apiService.getUserProfile();
      
      // If successful, log the user in
      login(apiKey, userProfile);
    } catch (error: any) {
      console.error('Login error:', error);
      apiService.removeApiKey(); // Remove invalid API key
      
      if (error.response?.status === 401) {
        toast.error('Invalid API key. Please check your credentials.');
      } else if (error.response?.status === 404) {
        toast.error('User not found. Please create a user account first.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!createUserForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    
    if (!createUserForm.email.trim() || !isValidEmail(createUserForm.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (!createUserForm.address.line1.trim()) {
      toast.error('Address line 1 is required');
      return;
    }
    
    if (!createUserForm.address.city.trim()) {
      toast.error('City is required');
      return;
    }
    
    if (!createUserForm.address.state.trim()) {
      toast.error('State is required');
      return;
    }
    
    if (!createUserForm.address.zip.trim()) {
      toast.error('ZIP code is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createUser({
        full_name: createUserForm.fullName,
        email: createUserForm.email,
        phone?: createUserForm.phone,
        address: createUserForm.address
      });
      
      toast.success('User created successfully! Please use your API key to login.');
      
      // Show the API key to the user
      if (response.api_key) {
        toast.success(`Your API key: ${response.api_key}`, { duration: 10000 });
        setApiKey(response.api_key);
      }
      
      setShowCreateUser(false);
    } catch (error: any) {
      console.error('Create user error:', error);
      
      if (error.response?.status === 400) {
        toast.error('Invalid user data. Please check your information.');
      } else if (error.response?.status === 409) {
        toast.error('User with this email already exists.');
      } else {
        toast.error('Failed to create user. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateCreateUserForm = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setCreateUserForm(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setCreateUserForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🎁 GiftLib
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showCreateUser ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>
        
        {!showCreateUser ? (
          // Login Form
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <input
                id="api-key"
                name="api-key"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Sign in'}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowCreateUser(true)}
                className="text-blue-600 hover:text-blue-500 text-sm"
                disabled={isLoading}
              >
                Don't have an account? Create one
              </button>
            </div>
          </form>
        ) : (
          // Create User Form
          <form className="mt-8 space-y-6" onSubmit={handleCreateUser}>
            <div className="space-y-4">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="full-name"
                  name="full-name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={createUserForm.fullName}
                  onChange={(e) => updateCreateUserForm('fullName', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={createUserForm.email}
                  onChange={(e) => updateCreateUserForm('email', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={createUserForm.phone}
                  onChange={(e) => updateCreateUserForm('phone', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="address-line1" className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <input
                  id="address-line1"
                  name="address-line1"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={createUserForm.address.line1}
                  onChange={(e) => updateCreateUserForm('address.line1', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="address-line2" className="block text-sm font-medium text-gray-700">
                  Address Line 2
                </label>
                <input
                  id="address-line2"
                  name="address-line2"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={createUserForm.address.line2}
                  onChange={(e) => updateCreateUserForm('address.line2', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={createUserForm.address.city}
                    onChange={(e) => updateCreateUserForm('address.city', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={createUserForm.address.state}
                    onChange={(e) => updateCreateUserForm('address.state', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={createUserForm.address.zip}
                    onChange={(e) => updateCreateUserForm('address.zip', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country *
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={createUserForm.address.country}
                    onChange={(e) => updateCreateUserForm('address.country', e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowCreateUser(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
