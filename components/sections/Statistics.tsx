'use client';

import React, { useState, useEffect } from 'react';
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
  meta: {
    campaign_id?: string;
  };
  status: GiftStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

const Statistics: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [campaignFilter, setCampaignFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<GiftStatus | ''>('');
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    cancelled: 0,
    dispatched: 0,
    delivered: 0,
    failed: 0,
    verifiedCount: 0,
    unverifiedCount: 0,
    statusCounts: {} as Record<string, number>
  });

  const loadGifts = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getAllGifts();
      setGifts(response.gifts || []);
    } catch (error: any) {
      console.error('Error loading gifts:', error);
      toast.error('Failed to load gifts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, []);

  // Filter gifts and calculate statistics
  useEffect(() => {
    let filtered = gifts;

    if (campaignFilter) {
      filtered = filtered.filter(gift => {
        const campaignId = gift.meta?.campaign_id || gift.campaign_id || '';
        return campaignId.toLowerCase().includes(campaignFilter.toLowerCase());
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(gift => gift.status === statusFilter);
    }

    setFilteredGifts(filtered);
    setStats(calculateStatistics(filtered));
  }, [gifts, campaignFilter, statusFilter]);

  // Get recent activity (last 10 gifts)
  const recentActivity = filteredGifts
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  // Get unique campaigns
  const campaigns = Array.from(new Set(
    gifts.map(gift => gift.meta?.campaign_id || gift.campaign_id).filter(Boolean)
  ));

  const statusOptions: GiftStatus[] = ['pending', 'verified', 'cancelled', 'dispatched', 'delivered', 'failed'];

  // Calculate percentages for status breakdown
  const getStatusPercentage = (count: number) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Statistics</h2>
        <p className="text-gray-600">View gift analytics and insights</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign ID
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
          >
            <option value="">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign} value={campaign}>
                {campaign}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as GiftStatus | '')}
          >
            <option value="">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={loadGifts}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
          <div className="text-sm font-medium text-blue-800">Total Gifts</div>
          <div className="text-xs text-blue-600 mt-1">
            {filteredGifts.length !== gifts.length && `(${filteredGifts.length} filtered)`}
          </div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.verifiedCount}</div>
          <div className="text-sm font-medium text-green-800">Verified</div>
          <div className="text-xs text-green-600 mt-1">
            {getStatusPercentage(stats.verifiedCount)}% of total
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.unverifiedCount}</div>
          <div className="text-sm font-medium text-yellow-800">Unverified</div>
          <div className="text-xs text-yellow-600 mt-1">
            {getStatusPercentage(stats.unverifiedCount)}% of total
          </div>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-3xl font-bold text-purple-600 mb-2">{campaigns.length}</div>
          <div className="text-sm font-medium text-purple-800">Campaigns</div>
          <div className="text-xs text-purple-600 mt-1">
            Active campaigns
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Status Breakdown</h3>
          
          <div className="space-y-4">
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
                    <div className="w-24 bg-gray-200 rounded-full h-2">
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
          
          {stats.total === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <div>No data available</div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 Recent Activity</h3>
          
          <div className="space-y-3">
            {recentActivity.map((gift) => (
              <div key={gift.gift_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`text-lg ${statusColors[gift.status]}`}>
                    {statusIcons[gift.status]}
                  </span>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {gift.recipient?.full_name || gift.recipient_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {gift.gift_id.slice(0, 8)}... • {(gift.gift?.type || gift.gift_type || 'Unknown').replace('_', ' ')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-xs font-medium ${statusColors[gift.status]}`}>
                    {gift.status.charAt(0).toUpperCase() + gift.status.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(gift.updated_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📭</div>
              <div>No recent activity</div>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Summary */}
      {campaigns.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Campaign Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => {
              const campaignGifts = filteredGifts.filter(gift => (gift.meta?.campaign_id || gift.campaign_id) === campaign);
              const campaignStats = calculateStatistics(campaignGifts);
              
              return (
                <div key={campaign} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2 truncate" title={campaign}>
                    {campaign}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-1 font-medium">{campaignStats.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Verified:</span>
                      <span className="ml-1 font-medium text-green-600">{campaignStats.verifiedCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Delivered:</span>
                      <span className="ml-1 font-medium text-emerald-600">{campaignStats.delivered}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Pending:</span>
                      <span className="ml-1 font-medium text-yellow-600">{campaignStats.pending}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;