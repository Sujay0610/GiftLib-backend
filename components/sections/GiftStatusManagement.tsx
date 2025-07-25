'use client';

import React, { useState } from 'react';
import { apiService } from '@/lib/api';
import { statusIcons, statusColors } from '@/lib/utils';
import { GiftStatus } from '@/types';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface StatusUpdateForm {
  gift_id: string;
  status: GiftStatus;
  tracking_info?: string;
}

const GiftStatusManagement: React.FC = () => {
  const [form, setForm] = useState<StatusUpdateForm>({
    gift_id: '',
    status: 'pending',
    tracking_info: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  const statusOptions: { value: GiftStatus; label: string; description: string }[] = [
    { value: 'pending', label: 'Pending', description: 'Gift is awaiting processing' },
    { value: 'verified', label: 'Verified', description: 'Recipient has verified their email' },
    { value: 'cancelled', label: 'Cancelled', description: 'Gift has been cancelled' },
    { value: 'dispatched', label: 'Dispatched', description: 'Gift has been sent out' },
    { value: 'delivered', label: 'Delivered', description: 'Gift has been delivered' },
    { value: 'failed', label: 'Failed', description: 'Gift delivery failed' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.gift_id.trim()) {
      toast.error('Please enter a gift ID');
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData: any = {
        giftId: form.gift_id.trim(),
        status: form.status
      };
      
      if (form.tracking_info?.trim()) {
        updateData.notes = form.tracking_info.trim();
      }
      
      const response = await apiService.updateGiftStatus(updateData);
      
      setLastUpdate({
        gift_id: form.gift_id,
        status: form.status,
        tracking_info: form.tracking_info,
        timestamp: new Date().toISOString(),
        response
      });
      
      toast.success(`Gift status updated to "${form.status}"`);
      
      // Reset form
      setForm({
        gift_id: '',
        status: 'pending',
        tracking_info: ''
      });
    } catch (error: any) {
      console.error('Error updating gift status:', error);
      
      if (error.response?.status === 404) {
        toast.error('Gift not found');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Invalid status update');
      } else {
        toast.error('Failed to update gift status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      gift_id: '',
      status: 'pending',
      tracking_info: ''
    });
    setLastUpdate(null);
  };

  const selectedStatusOption = statusOptions.find(option => option.value === form.status);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📦 Gift Status Management</h2>
        <p className="text-gray-600">Update gift fulfillment status and tracking information</p>
      </div>

      {/* Status Update Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gift ID */}
            <div>
              <label htmlFor="gift-id" className="block text-sm font-medium text-gray-700 mb-1">
                Gift ID *
              </label>
              <input
                id="gift-id"
                type="text"
                placeholder="Enter gift ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.gift_id}
                onChange={(e) => setForm({ ...form, gift_id: e.target.value })}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The unique identifier for the gift to update
              </p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                New Status *
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as GiftStatus })}
                disabled={isLoading}
                required
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {selectedStatusOption && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedStatusOption.description}
                </p>
              )}
            </div>
          </div>

          {/* Tracking Info */}
          <div>
            <label htmlFor="tracking-info" className="block text-sm font-medium text-gray-700 mb-1">
              Tracking Information
              <span className="text-gray-400 font-normal"> (Optional)</span>
            </label>
            <textarea
              id="tracking-info"
              rows={3}
              placeholder="Enter tracking number, delivery notes, or other relevant information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              value={form.tracking_info}
              onChange={(e) => setForm({ ...form, tracking_info: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Additional information about the gift status (tracking numbers, delivery notes, etc.)
            </p>
          </div>

          {/* Status Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status Preview</h4>
            <div className="flex items-center">
              <span className={`text-2xl mr-3 ${statusColors[form.status]}`}>
                {statusIcons[form.status]}
              </span>
              <div>
                <div className={`text-lg font-semibold ${statusColors[form.status]}`}>
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedStatusOption?.description}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading || !form.gift_id.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                '📦 Update Status'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              🗑️ Clear
            </button>
          </div>
        </form>
      </div>

      {/* Last Update Result */}
      {lastUpdate && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Last Update Successful</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-green-800 mb-1">Gift ID</div>
              <div className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                {lastUpdate.gift_id}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-green-800 mb-1">New Status</div>
              <div className="flex items-center">
                <span className={`text-lg mr-2 ${statusColors[lastUpdate.status]}`}>
                  {statusIcons[lastUpdate.status]}
                </span>
                <span className="text-sm font-medium text-green-700">
                  {lastUpdate.status.charAt(0).toUpperCase() + lastUpdate.status.slice(1)}
                </span>
              </div>
            </div>
            
            {lastUpdate.tracking_info && (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-green-800 mb-1">Tracking Information</div>
                <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                  {lastUpdate.tracking_info}
                </div>
              </div>
            )}
            
            <div className="md:col-span-2">
              <div className="text-sm font-medium text-green-800 mb-1">Updated At</div>
              <div className="text-sm text-green-700">
                {new Date(lastUpdate.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Guide */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📋 Status Guide</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusOptions.map((option) => (
            <div key={option.value} className="flex items-start space-x-3">
              <span className={`text-xl mt-0.5 ${statusColors[option.value]}`}>
                {statusIcons[option.value]}
              </span>
              <div>
                <div className="text-sm font-semibold text-blue-900">
                  {option.label}
                </div>
                <div className="text-sm text-blue-700">
                  {option.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Use tracking information for "dispatched" and "delivered" statuses</p>
            <p>• Include delivery notes or failure reasons when appropriate</p>
            <p>• Status updates are logged and can be tracked in Gift Management</p>
            <p>• Recipients may receive notifications for certain status changes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftStatusManagement;