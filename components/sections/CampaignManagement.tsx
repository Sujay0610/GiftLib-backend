'use client';

import React, { useState } from 'react';
import { apiService } from '@/lib/api';
import { statusIcons, statusColors, formatDate, calculateStatistics } from '@/lib/utils';
import { GiftStatus } from '@/types';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface Gift {
  gift_id: string;
  recipient: {
    full_name: string;
    email: string;
  };
  gift: {
    type: string;
  };
  status: GiftStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

const CampaignManagement: React.FC = () => {
  const [campaignId, setCampaignId] = useState('');
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!campaignId.trim()) {
      toast.error('Please enter a campaign ID');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const response = await apiService.getCampaignGifts(campaignId.trim());
      setGifts(response.gifts || []);
      
      if (response.gifts && response.gifts.length > 0) {
        toast.success(`Found ${response.gifts.length} gifts for campaign "${campaignId}"`);
      } else {
        toast.info(`No gifts found for campaign "${campaignId}"`);
      }
    } catch (error: any) {
      console.error('Error fetching campaign gifts:', error);
      
      if (error.response?.status === 404) {
        toast.error('Campaign not found');
        setGifts([]);
      } else {
        toast.error('Failed to fetch campaign gifts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCampaignId('');
    setGifts([]);
    setHasSearched(false);
  };

  const stats = calculateStatistics(gifts);
  const statusOptions: GiftStatus[] = ['pending', 'verified', 'cancelled', 'dispatched', 'delivered', 'failed'];

  // Calculate percentages for status breakdown
  const getStatusPercentage = (count: number) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Campaign Management</h2>
        <p className="text-gray-600">View and analyze gifts by campaign ID</p>
      </div>

      {/* Search Form */}
      <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="campaign-id" className="block text-sm font-medium text-gray-700 mb-1">
              Campaign ID
            </label>
            <input
              id="campaign-id"
              type="text"
              placeholder="Enter campaign ID to search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-end space-x-2">
            <button
              type="submit"
              disabled={isLoading || !campaignId.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : '🔍 Search'}
            </button>
            
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              🗑️ Clear
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-8">
          {/* Summary Statistics */}
          {gifts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Campaign Summary: "{campaignId}"
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-blue-800">Total Gifts</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats.verifiedCount}</div>
                  <div className="text-sm text-green-800">Verified</div>
                  <div className="text-xs text-green-600">
                    {getStatusPercentage(stats.verifiedCount)}%
                  </div>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="text-2xl font-bold text-emerald-600">{stats.delivered}</div>
                  <div className="text-sm text-emerald-800">Delivered</div>
                  <div className="text-xs text-emerald-600">
                    {getStatusPercentage(stats.delivered)}%
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-yellow-800">Pending</div>
                  <div className="text-xs text-yellow-600">
                    {getStatusPercentage(stats.pending)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Distribution Chart */}
          {gifts.length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Status Distribution</h4>
              
              <div className="space-y-3">
                {statusOptions.map((status) => {
                  const count = stats[status] || 0;
                  const percentage = getStatusPercentage(count);
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className={`text-lg mr-3 ${statusColors[status]}`}>
                          {statusIcons[status]}
                        </span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              status === 'pending' ? 'bg-yellow-500' :
                              status === 'verified' ? 'bg-green-500' :
                              status === 'cancelled' ? 'bg-red-500' :
                              status === 'dispatched' ? 'bg-blue-500' :
                              status === 'delivered' ? 'bg-emerald-500' :
                              'bg-red-700'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <div className="text-right min-w-[60px]">
                          <div className="text-sm font-semibold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-500">{percentage}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Gifts List */}
          {gifts.length > 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900">🎁 Campaign Gifts</h4>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gift ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gift Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gifts.map((gift) => (
                      <tr key={gift.gift_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {gift.gift_id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {gift.recipient.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {gift.recipient.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {gift.gift.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-lg mr-2 ${statusColors[gift.status]}`}>
                              {statusIcons[gift.status]}
                            </span>
                            <span className={`text-sm font-medium ${statusColors[gift.status]}`}>
                              {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                            </span>
                            {gift.verified && (
                              <span className="ml-2 text-green-500" title="Verified">
                                ✅
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(gift.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(gift.updated_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No gifts found
              </h3>
              <p className="text-gray-500">
                {campaignId ? `No gifts found for campaign "${campaignId}"` : 'Enter a campaign ID to search for gifts'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!hasSearched && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 How to use Campaign Management</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>1. Enter a campaign ID in the search field above</p>
            <p>2. Click "Search" to find all gifts associated with that campaign</p>
            <p>3. View summary statistics and status distribution</p>
            <p>4. Browse the detailed list of gifts in the campaign</p>
            <p>5. Use this to track campaign performance and gift delivery status</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManagement;