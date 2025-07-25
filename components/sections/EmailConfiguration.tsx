'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { formatApiKey, isValidEmail } from '@/lib/utils';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface EmailConfig {
  resend_api_key: string;
  from_email: string;
  sending_domain: string;
}

interface EmailConfigForm {
  resend_api_key: string;
  from_email: string;
  sending_domain: string;
}

const EmailConfiguration: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [form, setForm] = useState<EmailConfigForm>({
    resend_api_key: '',
    from_email: '',
    sending_domain: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<any>(null);
  const [lastTest, setLastTest] = useState<any>(null);

  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const response = await apiService.getEmailConfig();
      setConfig(response);
      setForm({
        resend_api_key: response.resend_api_key || '',
        from_email: response.from_email || '',
        sending_domain: response.sending_domain || ''
      });
    } catch (error: any) {
      console.error('Error loading email config:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load email configuration');
      }
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!form.resend_api_key.trim()) {
      toast.error('Resend API key is required');
      return;
    }
    
    if (!form.from_email.trim()) {
      toast.error('From email is required');
      return;
    }
    
    if (!isValidEmail(form.from_email)) {
      toast.error('Please enter a valid from email address');
      return;
    }
    
    if (!form.sending_domain.trim()) {
      toast.error('Sending domain is required');
      return;
    }

    setIsLoading(true);
    
    try {
      const updateData = {
        resend_api_key: form.resend_api_key.trim(),
        from_email: form.from_email.trim(),
        sending_domain: form.sending_domain.trim()
      };
      
      const response = await apiService.updateEmailConfig(updateData);
      
      setConfig(response);
      setLastUpdate({
        timestamp: new Date().toISOString(),
        config: updateData
      });
      
      toast.success('Email configuration updated successfully');
    } catch (error: any) {
      console.error('Error updating email config:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Invalid configuration');
      } else {
        toast.error('Failed to update email configuration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testEmail.trim()) {
      toast.error('Please enter a test email address');
      return;
    }
    
    if (!isValidEmail(testEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsTestingEmail(true);
    
    try {
      const response = await apiService.testEmailConfig(testEmail.trim());
      
      setLastTest({
        email: testEmail,
        timestamp: new Date().toISOString(),
        response
      });
      
      toast.success(`Test email sent successfully to ${testEmail}`);
      setTestEmail('');
    } catch (error: any) {
      console.error('Error sending test email:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data?.detail || 'Failed to send test email');
      } else if (error.response?.status === 500) {
        toast.error('Email service configuration error');
      } else {
        toast.error('Failed to send test email');
      }
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setForm({
        resend_api_key: config.resend_api_key || '',
        from_email: config.from_email || '',
        sending_domain: config.sending_domain || ''
      });
    }
    setLastUpdate(null);
  };

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading email configuration...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📧 Email Configuration</h2>
        <p className="text-gray-600">Configure Resend API settings for sending gift emails</p>
      </div>

      {/* Current Configuration */}
      {config && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Current Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Resend API Key</div>
              <div className="text-sm text-gray-600 font-mono bg-white px-3 py-2 rounded border">
                {config.resend_api_key ? formatApiKey(config.resend_api_key) : 'Not configured'}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">From Email</div>
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                {config.from_email || 'Not configured'}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Sending Domain</div>
              <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                {config.sending_domain || 'Not configured'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">⚙️ Update Configuration</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resend API Key */}
          <div>
            <label htmlFor="resend-api-key" className="block text-sm font-medium text-gray-700 mb-1">
              Resend API Key *
            </label>
            <div className="relative">
              <input
                id="resend-api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                value={form.resend_api_key}
                onChange={(e) => setForm({ ...form, resend_api_key: e.target.value })}
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
              Your Resend API key (starts with "re_")
            </p>
          </div>

          {/* From Email */}
          <div>
            <label htmlFor="from-email" className="block text-sm font-medium text-gray-700 mb-1">
              From Email *
            </label>
            <input
              id="from-email"
              type="email"
              placeholder="noreply@yourdomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.from_email}
              onChange={(e) => setForm({ ...form, from_email: e.target.value })}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The email address that will appear as the sender
            </p>
          </div>

          {/* Sending Domain */}
          <div>
            <label htmlFor="sending-domain" className="block text-sm font-medium text-gray-700 mb-1">
              Sending Domain *
            </label>
            <input
              id="sending-domain"
              type="text"
              placeholder="yourdomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.sending_domain}
              onChange={(e) => setForm({ ...form, sending_domain: e.target.value })}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The domain configured in your Resend account
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
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      {/* Test Email */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">🧪 Test Email Configuration</h3>
        
        <form onSubmit={handleTestEmail} className="space-y-4">
          <div>
            <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-1">
              Test Email Address
            </label>
            <input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={isTestingEmail}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Send a test email to verify your configuration
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isTestingEmail || !testEmail.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isTestingEmail ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Sending...</span>
              </div>
            ) : (
              '📤 Send Test Email'
            )}
          </button>
        </form>
      </div>

      {/* Last Update Result */}
      {lastUpdate && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-4">✅ Configuration Updated</h3>
          
          <div className="text-sm text-green-800">
            <p>Email configuration was successfully updated at {new Date(lastUpdate.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Last Test Result */}
      {lastTest && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">📧 Test Email Sent</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-blue-800 mb-1">Test Email</div>
              <div className="text-sm text-blue-700 bg-blue-100 px-2 py-1 rounded">
                {lastTest.email}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-blue-800 mb-1">Sent At</div>
              <div className="text-sm text-blue-700">
                {new Date(lastTest.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">💡 Resend Setup Help</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">🔑 Getting Your API Key</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>1. Sign up for a Resend account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></p>
              <p>2. Go to your dashboard and navigate to "API Keys"</p>
              <p>3. Create a new API key with sending permissions</p>
              <p>4. Copy the API key (it starts with "re_")</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">🌐 Domain Setup</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>1. Add your domain in the Resend dashboard</p>
              <p>2. Verify your domain by adding the required DNS records</p>
              <p>3. Use a verified domain for the "From Email" and "Sending Domain"</p>
              <p>4. For testing, you can use the Resend sandbox domain</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-yellow-900 mb-2">🔧 Troubleshooting</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• Ensure your API key has the correct permissions</p>
              <p>• Verify that your domain is properly configured in Resend</p>
              <p>• Check that the from email matches your verified domain</p>
              <p>• Use the test email feature to verify your setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfiguration;