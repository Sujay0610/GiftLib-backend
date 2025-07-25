'use client';

import React, { useState } from 'react';
import { apiService } from '@/lib/api';
import { isValidEmail } from '@/lib/utils';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const InitiateGift: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Recipient details
    recipient: {
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
    },
    // Gift details
    gift: {
      type: 'thank_you_card' as const,
      templateId: 'template1',
      message: '',
      deliveryDate: ''
    },
    // Meta information
    meta: {
      campaignId: '',
      orderSource: 'Web Interface'
    }
  });

  const giftTypes = [
    { value: 'thank_you_card', label: 'Thank You Card' },
    { value: 'congratulations_card', label: 'Congratulations Card' },
    { value: 'birthday_card', label: 'Birthday Card' },
    { value: 'holiday_card', label: 'Holiday Card' },
    { value: 'custom_card', label: 'Custom Card' }
  ];

  const templates = [
    { value: 'template1', label: 'Template 1 - Classic' },
    { value: 'template2', label: 'Template 2 - Modern' },
    { value: 'template3', label: 'Template 3 - Elegant' },
    { value: 'template4', label: 'Template 4 - Fun' }
  ];

  const updateFormData = (path: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.recipient.fullName.trim()) {
      toast.error('Recipient full name is required');
      return false;
    }
    
    if (!formData.recipient.email.trim() || !isValidEmail(formData.recipient.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!formData.recipient.address.line1.trim()) {
      toast.error('Address line 1 is required');
      return false;
    }
    
    if (!formData.recipient.address.city.trim()) {
      toast.error('City is required');
      return false;
    }
    
    if (!formData.recipient.address.state.trim()) {
      toast.error('State is required');
      return false;
    }
    
    if (!formData.recipient.address.zip.trim()) {
      toast.error('ZIP code is required');
      return false;
    }
    
    if (!formData.gift.message.trim()) {
      toast.error('Gift message is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.initiateGift({
        recipient: {
          fullName: formData.recipient.fullName,
          email: formData.recipient.email,
          phone: formData.recipient.phone,
          address: formData.recipient.address
        },
        gift: formData.gift,
        meta: formData.meta
      });
      
      toast.success(`Gift initiated successfully! Gift ID: ${response.gift_id}`);
      
      // Reset form
      setFormData({
        recipient: {
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
        },
        gift: {
          type: 'thank_you_card',
          templateId: 'template1',
          message: '',
          deliveryDate: ''
        },
        meta: {
          campaignId: '',
          orderSource: 'Web Interface'
        }
      });
    } catch (error: any) {
      console.error('Error initiating gift:', error);
      
      if (error.response?.status === 400) {
        toast.error('Invalid gift data. Please check your information.');
      } else {
        toast.error('Failed to initiate gift. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Initiate Gift</h1>
        <p className="text-gray-600">Send a personalized gift to someone special</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 max-w-4xl mx-auto">
        {/* Recipient Information */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">📋 Recipient Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.fullName}
                onChange={(e) => updateFormData('recipient.fullName', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.email}
                onChange={(e) => updateFormData('recipient.email', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.phone}
                onChange={(e) => updateFormData('recipient.phone', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.address.line1}
                onChange={(e) => updateFormData('recipient.address.line1', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.address.line2}
                onChange={(e) => updateFormData('recipient.address.line2', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.address.city}
                onChange={(e) => updateFormData('recipient.address.city', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.address.state}
                onChange={(e) => updateFormData('recipient.address.state', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.address.zip}
                onChange={(e) => updateFormData('recipient.address.zip', e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.recipient.address.country}
                onChange={(e) => updateFormData('recipient.address.country', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Gift Details & Campaign Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gift Details */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">🎁 Gift Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Gift Type *
                  </label>
                  <select
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.gift.type}
                    onChange={(e) => updateFormData('gift.type', e.target.value)}
                    disabled={isLoading}
                  >
                    {giftTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Template *
                  </label>
                  <select
                    required
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.gift.templateId}
                    onChange={(e) => updateFormData('gift.templateId', e.target.value)}
                    disabled={isLoading}
                  >
                    {templates.map((template) => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.gift.deliveryDate}
                  onChange={(e) => updateFormData('gift.deliveryDate', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your personalized message..."
                  value={formData.gift.message}
                  onChange={(e) => updateFormData('gift.message', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Campaign Information */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">📊 Campaign Info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Campaign ID
                </label>
                <input
                  type="text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional campaign identifier"
                  value={formData.meta.campaignId}
                  onChange={(e) => updateFormData('meta.campaignId', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Order Source
                </label>
                <input
                  type="text"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.meta.orderSource}
                  onChange={(e) => updateFormData('meta.orderSource', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Initiating...</span>
              </>
            ) : (
              '🎁 Initiate Gift'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InitiateGift;