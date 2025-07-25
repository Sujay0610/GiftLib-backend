'use client';

import React, { useState } from 'react';
import { apiService } from '@/lib/api';
import { generateSampleBulkData } from '@/lib/utils';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const BulkOperations: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleLoadSample = () => {
    const sampleData = generateSampleBulkData();
    setJsonInput(JSON.stringify(sampleData, null, 2));
    setValidationError('');
  };

  const validateJson = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Basic structure validation
      if (!data.gifts || !Array.isArray(data.gifts)) {
        return 'JSON must contain a "gifts" array';
      }
      
      if (data.gifts.length === 0) {
        return 'Gifts array cannot be empty';
      }
      
      // Validate each gift
      for (let i = 0; i < data.gifts.length; i++) {
        const gift = data.gifts[i];
        
        if (!gift.recipient) {
          return `Gift ${i + 1}: Missing recipient information`;
        }
        
        if (!gift.recipient.fullName) {
          return `Gift ${i + 1}: Missing recipient full name`;
        }
        
        if (!gift.recipient.email) {
          return `Gift ${i + 1}: Missing recipient email`;
        }
        
        if (!gift.recipient.address) {
          return `Gift ${i + 1}: Missing recipient address`;
        }
        
        if (!gift.recipient.address.line1) {
          return `Gift ${i + 1}: Missing address line 1`;
        }
        
        if (!gift.recipient.address.city) {
          return `Gift ${i + 1}: Missing city`;
        }
        
        if (!gift.recipient.address.state) {
          return `Gift ${i + 1}: Missing state`;
        }
        
        if (!gift.recipient.address.zip) {
          return `Gift ${i + 1}: Missing ZIP code`;
        }
        
        if (!gift.gift) {
          return `Gift ${i + 1}: Missing gift information`;
        }
        
        if (!gift.gift.type) {
          return `Gift ${i + 1}: Missing gift type`;
        }
        
        if (!gift.gift.message) {
          return `Gift ${i + 1}: Missing gift message`;
        }
      }
      
      return null; // No errors
    } catch (error) {
      return 'Invalid JSON format';
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    
    if (value.trim()) {
      const error = validateJson(value);
      setValidationError(error || '');
    } else {
      setValidationError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jsonInput.trim()) {
      toast.error('Please enter JSON data');
      return;
    }
    
    const validationError = validateJson(jsonInput);
    if (validationError) {
      toast.error(`Validation Error: ${validationError}`);
      return;
    }

    setIsLoading(true);
    try {
      const data = JSON.parse(jsonInput);
      
      // Transform the data to match API expectations
      const transformedData = {
        gifts: data.gifts.map((gift: any) => ({
          recipient: {
            full_name: gift.recipient.fullName,
            email: gift.recipient.email,
            phone: gift.recipient.phone || '',
            address: gift.recipient.address
          },
          gift: gift.gift,
          meta: gift.meta || data.meta || {}
        })),
        meta: data.meta || {}
      };
      
      const response = await apiService.bulkInitiateGifts(transformedData);
      
      setLastResult(response);
      toast.success(`Successfully initiated ${response.successful_count || data.gifts.length} gifts!`);
      
      if (response.failed_count && response.failed_count > 0) {
        toast.error(`${response.failed_count} gifts failed to initiate`);
      }
      
      // Clear the input after successful submission
      setJsonInput('');
      setValidationError('');
    } catch (error: any) {
      console.error('Error initiating bulk gifts:', error);
      
      if (error.response?.status === 400) {
        toast.error('Invalid bulk gift data. Please check your JSON format.');
      } else {
        toast.error('Failed to initiate bulk gifts. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setValidationError('');
    setLastResult(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📦 Bulk Operations</h2>
        <p className="text-gray-600">Initiate multiple gifts using JSON data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JSON Input */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Gift Data (JSON)
                </label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-sm text-blue-600 hover:text-blue-500"
                    disabled={isLoading}
                  >
                    📋 Load Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm text-red-600 hover:text-red-500"
                    disabled={isLoading}
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
              
              <textarea
                rows={20}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                  validationError 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Enter JSON data for bulk gift creation..."
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                disabled={isLoading}
              />
              
              {validationError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                  ❌ {validationError}
                </div>
              )}
              
              {jsonInput && !validationError && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ JSON format is valid
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading || !!validationError || !jsonInput.trim()}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Processing...</span>
                  </>
                ) : (
                  '📦 Initiate Bulk Gifts'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Instructions and Sample */}
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📋 Instructions</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>1. Prepare your gift data in JSON format</p>
              <p>2. Each gift must include recipient details, gift information, and optional metadata</p>
              <p>3. Use the "Load Sample" button to see the expected format</p>
              <p>4. Validate your JSON before submitting</p>
              <p>5. Click "Initiate Bulk Gifts" to process all gifts</p>
            </div>
          </div>

          {/* Required Fields */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Required Fields</h3>
            <div className="text-sm text-yellow-800 space-y-1">
              <p><strong>Recipient:</strong> fullName, email, address (line1, city, state, zip, country)</p>
              <p><strong>Gift:</strong> type, templateId, message</p>
              <p><strong>Optional:</strong> phone, address.line2, deliveryDate, campaignId</p>
            </div>
          </div>

          {/* Gift Types */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">🎁 Available Gift Types</h3>
            <div className="text-sm text-green-800 space-y-1">
              <p>• thank_you_card</p>
              <p>• congratulations_card</p>
              <p>• birthday_card</p>
              <p>• holiday_card</p>
              <p>• custom_card</p>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Last Operation Result</h3>
              <div className="text-sm space-y-2">
                {lastResult.successful_count !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Successful:</span>
                    <span className="font-medium text-green-600">{lastResult.successful_count}</span>
                  </div>
                )}
                {lastResult.failed_count !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Failed:</span>
                    <span className="font-medium text-red-600">{lastResult.failed_count}</span>
                  </div>
                )}
                {lastResult.gift_ids && (
                  <div>
                    <div className="text-gray-600 mb-1">Gift IDs:</div>
                    <div className="bg-white p-2 rounded border text-xs font-mono max-h-32 overflow-y-auto">
                      {lastResult.gift_ids.map((id: string, index: number) => (
                        <div key={index}>{id}</div>
                      ))}
                    </div>
                  </div>
                )}
                {lastResult.errors && lastResult.errors.length > 0 && (
                  <div>
                    <div className="text-gray-600 mb-1">Errors:</div>
                    <div className="bg-red-50 p-2 rounded border text-xs max-h-32 overflow-y-auto">
                      {lastResult.errors.map((error: string, index: number) => (
                        <div key={index} className="text-red-700">{error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;