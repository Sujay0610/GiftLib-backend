'use client';

import React, { useState } from 'react';
import { formatApiKey } from '@/lib/utils';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface FulfillmentConfigForm {
  api_url: string;
  api_key: string;
}

const FulfillmentConfiguration: React.FC = () => {
  const [form, setForm] = useState<FulfillmentConfigForm>({
    api_url: '',
    api_key: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [lastTest, setLastTest] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.api_url.trim()) {
      toast.error('API URL is required');
      return;
    }
    
    if (!form.api_key.trim()) {
      toast.error('API Key is required');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(form.api_url.trim());
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call for fulfillment configuration
      // In a real implementation, this would call an actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastUpdate({
        timestamp: new Date().toISOString(),
        config: {
          api_url: form.api_url.trim(),
          api_key: form.api_key.trim()
        }
      });
      
      toast.success('Fulfillment configuration updated successfully');
    } catch (error: any) {
      console.error('Error updating fulfillment config:', error);
      toast.error('Failed to update fulfillment configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!form.api_url.trim() || !form.api_key.trim()) {
      toast.error('Please configure API URL and Key before testing');
      return;
    }

    setIsTesting(true);
    
    try {
      // Simulate API test call
      // In a real implementation, this would test the actual fulfillment API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setLastTest({
          timestamp: new Date().toISOString(),
          status: 'success',
          response: {
            status: 'connected',
            message: 'Fulfillment API is responding correctly',
            response_time: Math.floor(Math.random() * 500) + 100
          }
        });
        toast.success('Fulfillment API test successful');
      } else {
        setLastTest({
          timestamp: new Date().toISOString(),
          status: 'error',
          error: 'Connection timeout or invalid credentials'
        });
        toast.error('Fulfillment API test failed');
      }
    } catch (error: any) {
      console.error('Error testing fulfillment API:', error);
      setLastTest({
        timestamp: new Date().toISOString(),
        status: 'error',
        error: 'Network error or invalid configuration'
      });
      toast.error('Failed to test fulfillment API');
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    setForm({
      api_url: '',
      api_key: ''
    });
    setLastUpdate(null);
    setLastTest(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🚚 Fulfillment Configuration</h2>
        <p className="text-gray-600">Configure external fulfillment API for gift delivery</p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">⚙️ API Configuration</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API URL */}
          <div>
            <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-1">
              Fulfillment API URL *
            </label>
            <input
              id="api-url"
              type="url"
              placeholder="https://api.fulfillment-provider.com/v1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.api_url}
              onChange={(e) => setForm({ ...form, api_url: e.target.value })}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The base URL for your fulfillment provider's API
            </p>
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
              API Key *
            </label>
            <div className="relative">
              <input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter your fulfillment API key..."
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your authentication key for the fulfillment API
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                '💾 Update Configuration'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !form.api_url.trim() || !form.api_key.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isTesting ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Testing...</span>
                </div>
              ) : (
                '🧪 Test Connection'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading || isTesting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              🗑️ Clear
            </button>
          </div>
        </form>
      </div>

      {/* Current Configuration Preview */}
      {(form.api_url || form.api_key) && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Configuration Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">API URL</div>
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border font-mono">
                {form.api_url || 'Not configured'}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">API Key</div>
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border font-mono">
                {form.api_key ? formatApiKey(form.api_key) : 'Not configured'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Update Result */}
      {lastUpdate && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Configuration Updated</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-green-800 mb-1">API URL</div>
              <div className="text-sm text-green-700 bg-green-100 px-2 py-1 rounded font-mono">
                {lastUpdate.config.api_url}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-green-800 mb-1">Updated At</div>
              <div className="text-sm text-green-700">
                {new Date(lastUpdate.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Last Test Result */}
      {lastTest && (
        <div className={`p-6 rounded-lg border mb-8 ${
          lastTest.status === 'success' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            lastTest.status === 'success' ? 'text-green-900' : 'text-red-900'
          }`}>
            {lastTest.status === 'success' ? '✅' : '❌'} 
            Connection Test {lastTest.status === 'success' ? 'Successful' : 'Failed'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className={`text-sm font-medium mb-1 ${
                lastTest.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                Status
              </div>
              <div className={`text-sm px-2 py-1 rounded ${
                lastTest.status === 'success' 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {lastTest.status === 'success' ? 'Connected' : 'Failed'}
              </div>
            </div>
            
            <div>
              <div className={`text-sm font-medium mb-1 ${
                lastTest.status === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                Tested At
              </div>
              <div className={`text-sm ${
                lastTest.status === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {new Date(lastTest.timestamp).toLocaleString()}
              </div>
            </div>
            
            {lastTest.response && (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-green-800 mb-1">Response</div>
                <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded">
                  {lastTest.response.message}
                  {lastTest.response.response_time && (
                    <span className="ml-2 text-green-600">
                      ({lastTest.response.response_time}ms)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {lastTest.error && (
              <div className="md:col-span-2">
                <div className="text-sm font-medium text-red-800 mb-1">Error</div>
                <div className="text-sm text-red-700 bg-red-100 px-3 py-2 rounded">
                  {lastTest.error}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Fulfillment Integration Guide</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔗 API Integration</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Configure your fulfillment provider's API endpoint</p>
              <p>• Ensure the API supports gift delivery and tracking</p>
              <p>• Use the test connection feature to verify setup</p>
              <p>• API should support standard REST operations</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔑 Authentication</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Obtain API credentials from your fulfillment provider</p>
              <p>• Ensure the API key has necessary permissions</p>
              <p>• Keep your API credentials secure and private</p>
              <p>• Rotate keys regularly for security</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📦 Supported Operations</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Create fulfillment orders for verified gifts</p>
              <p>• Track delivery status and updates</p>
              <p>• Handle cancellations and returns</p>
              <p>• Receive delivery confirmations</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">🔧 Troubleshooting</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Verify API URL is correct and accessible</p>
              <p>• Check API key permissions and validity</p>
              <p>• Ensure network connectivity to the API endpoint</p>
              <p>• Review API documentation for required headers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FulfillmentConfiguration;