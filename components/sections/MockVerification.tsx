'use client';

import React, { useState } from 'react';
import { apiService } from '@/lib/api';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface VerificationForm {
  gift_id: string;
  action: 'accept' | 'decline';
}

const MockVerification: React.FC = () => {
  const [form, setForm] = useState<VerificationForm>({
    gift_id: '',
    action: 'accept'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastVerification, setLastVerification] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.gift_id.trim()) {
      toast.error('Please enter a gift ID');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiService.verifyGift(form.gift_id.trim(), form.action);
      
      setLastVerification({
        gift_id: form.gift_id,
        action: form.action,
        timestamp: new Date().toISOString(),
        response
      });
      
      const actionText = form.action === 'accept' ? 'accepted' : 'declined';
      toast.success(`Gift verification ${actionText} successfully`);
      
      // Reset form
      setForm({
        gift_id: '',
        action: 'accept'
      });
    } catch (error: any) {
      console.error('Error verifying gift:', error);
      
      if (error.response?.status === 404) {
        toast.error('Gift not found');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Invalid verification request');
      } else {
        toast.error('Failed to process verification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      gift_id: '',
      action: 'accept'
    });
    setLastVerification(null);
  };

  const handleQuickAction = async (giftId: string, action: 'accept' | 'decline') => {
    if (!giftId.trim()) {
      toast.error('Please enter a gift ID first');
      return;
    }

    setForm({ gift_id: giftId, action });
    
    // Auto-submit
    setIsLoading(true);
    
    try {
      const response = await apiService.verifyGift(giftId.trim(), action);
      
      setLastVerification({
        gift_id: giftId,
        action,
        timestamp: new Date().toISOString(),
        response
      });
      
      const actionText = action === 'accept' ? 'accepted' : 'declined';
      toast.success(`Gift verification ${actionText} successfully`);
      
      // Reset form
      setForm({
        gift_id: '',
        action: 'accept'
      });
    } catch (error: any) {
      console.error('Error verifying gift:', error);
      
      if (error.response?.status === 404) {
        toast.error('Gift not found');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Invalid verification request');
      } else {
        toast.error('Failed to process verification');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🧪 Mock Verification</h2>
        <p className="text-gray-600">Simulate email verification responses for testing purposes</p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <div className="text-yellow-400 text-xl mr-3 mt-0.5">⚠️</div>
          <div>
            <h3 className="text-sm font-semibold text-yellow-800 mb-1">
              Testing Environment Only
            </h3>
            <p className="text-sm text-yellow-700">
              This feature is designed for testing and development purposes. 
              It simulates recipient email verification responses without sending actual emails.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Form */}
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
                placeholder="Enter gift ID to verify..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.gift_id}
                onChange={(e) => setForm({ ...form, gift_id: e.target.value })}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The unique identifier for the gift to verify
              </p>
            </div>

            {/* Action */}
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Action *
              </label>
              <select
                id="action"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value as 'accept' | 'decline' })}
                disabled={isLoading}
                required
              >
                <option value="accept">Accept Gift</option>
                <option value="decline">Decline Gift</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {form.action === 'accept' 
                  ? 'Simulate recipient accepting the gift'
                  : 'Simulate recipient declining the gift'
                }
              </p>
            </div>
          </div>

          {/* Action Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Action Preview</h4>
            <div className="flex items-center">
              <span className={`text-2xl mr-3 ${
                form.action === 'accept' ? 'text-green-500' : 'text-red-500'
              }`}>
                {form.action === 'accept' ? '✅' : '❌'}
              </span>
              <div>
                <div className={`text-lg font-semibold ${
                  form.action === 'accept' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {form.action === 'accept' ? 'Accept Gift' : 'Decline Gift'}
                </div>
                <div className="text-sm text-gray-600">
                  {form.action === 'accept' 
                    ? 'The recipient will accept the gift and it will be marked as verified'
                    : 'The recipient will decline the gift and it may be cancelled'
                  }
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
                  <span className="ml-2">Processing...</span>
                </div>
              ) : (
                `🧪 Simulate ${form.action === 'accept' ? 'Accept' : 'Decline'}`
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

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">⚡ Quick Actions</h4>
          <div className="flex space-x-3">
            <button
              onClick={() => handleQuickAction(form.gift_id, 'accept')}
              disabled={isLoading || !form.gift_id.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              ✅ Quick Accept
            </button>
            
            <button
              onClick={() => handleQuickAction(form.gift_id, 'decline')}
              disabled={isLoading || !form.gift_id.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              ❌ Quick Decline
            </button>
          </div>
        </div>
      </div>

      {/* Last Verification Result */}
      {lastVerification && (
        <div className={`p-6 rounded-lg border mb-8 ${
          lastVerification.action === 'accept' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            lastVerification.action === 'accept' ? 'text-green-900' : 'text-red-900'
          }`}>
            {lastVerification.action === 'accept' ? '✅' : '❌'} 
            Last Verification {lastVerification.action === 'accept' ? 'Accepted' : 'Declined'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className={`text-sm font-medium mb-1 ${
                lastVerification.action === 'accept' ? 'text-green-800' : 'text-red-800'
              }`}>
                Gift ID
              </div>
              <div className={`text-sm font-mono px-2 py-1 rounded ${
                lastVerification.action === 'accept' 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {lastVerification.gift_id}
              </div>
            </div>
            
            <div>
              <div className={`text-sm font-medium mb-1 ${
                lastVerification.action === 'accept' ? 'text-green-800' : 'text-red-800'
              }`}>
                Action
              </div>
              <div className="flex items-center">
                <span className={`text-lg mr-2 ${
                  lastVerification.action === 'accept' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {lastVerification.action === 'accept' ? '✅' : '❌'}
                </span>
                <span className={`text-sm font-medium ${
                  lastVerification.action === 'accept' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {lastVerification.action === 'accept' ? 'Accepted' : 'Declined'}
                </span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <div className={`text-sm font-medium mb-1 ${
                lastVerification.action === 'accept' ? 'text-green-800' : 'text-red-800'
              }`}>
                Processed At
              </div>
              <div className={`text-sm ${
                lastVerification.action === 'accept' ? 'text-green-700' : 'text-red-700'
              }`}>
                {new Date(lastVerification.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Guide */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">📖 Usage Guide</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🎯 Purpose</h4>
            <p className="text-sm text-blue-800">
              This tool simulates recipient responses to gift verification emails, 
              allowing you to test the complete gift workflow without sending real emails.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 How to Use</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. Enter the Gift ID you want to test</p>
              <p>2. Choose whether to simulate "Accept" or "Decline"</p>
              <p>3. Click "Simulate" or use Quick Actions</p>
              <p>4. Check the gift status in Gift Management to see the changes</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">⚡ Quick Actions</h4>
            <p className="text-sm text-blue-800">
              Use Quick Accept/Decline buttons for faster testing. 
              These automatically submit the verification with the current Gift ID.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔍 Testing Scenarios</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Test gift acceptance flow and status updates</p>
              <p>• Test gift decline handling and potential cancellation</p>
              <p>• Verify email verification workflow without sending emails</p>
              <p>• Test error handling for invalid or non-existent gift IDs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockVerification;