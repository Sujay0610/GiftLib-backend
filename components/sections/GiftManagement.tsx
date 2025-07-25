'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { statusIcons, statusColors, formatDate, debounce } from '@/lib/utils';
import { GiftStatus } from '@/types';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface Gift {
  gift_id: string;
  recipient: {
    full_name: string;
    email: string;
    phone?: string;
  };
  gift: {
    type: string;
    message: string;
    delivery_date?: string;
  };
  meta: {
    campaign_id?: string;
    order_source?: string;
  };
  status: GiftStatus;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

const GiftManagement: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [filteredGifts, setFilteredGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Filters
  const [campaignFilter, setCampaignFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<GiftStatus | ''>('');
  const [searchFilter, setSearchFilter] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Filter gifts based on search criteria
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

    if (searchFilter) {
      filtered = filtered.filter(gift => {
        const recipientName = gift.recipient?.full_name || gift.recipient_name || '';
        const recipientEmail = gift.recipient?.email || gift.recipient_email || '';
        return recipientName.toLowerCase().includes(searchFilter.toLowerCase()) ||
               recipientEmail.toLowerCase().includes(searchFilter.toLowerCase()) ||
               gift.gift_id.toLowerCase().includes(searchFilter.toLowerCase());
      });
    }

    setFilteredGifts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [gifts, campaignFilter, statusFilter, searchFilter]);

  const debouncedSearch = debounce((value: string) => {
    setSearchFilter(value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const updateGiftStatus = async (giftId: string, newStatus: GiftStatus) => {
    setIsUpdating(giftId);
    try {
      await apiService.updateGiftStatus({
        giftId: giftId,
        status: newStatus,
        notes: newStatus === 'dispatched' ? 'Updated via web interface' : undefined
      });
      
      // Update local state
      setGifts(prev => prev.map(gift => 
        gift.gift_id === giftId 
          ? { ...gift, status: newStatus, updated_at: new Date().toISOString() }
          : gift
      ));
      
      toast.success(`Gift status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating gift status:', error);
      toast.error('Failed to update gift status');
    } finally {
      setIsUpdating(null);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredGifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGifts = filteredGifts.slice(startIndex, endIndex);

  const statusOptions: GiftStatus[] = ['pending', 'verified', 'cancelled', 'dispatched', 'delivered', 'failed'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gift Management</h1>
        <p className="text-gray-600">View and manage all gifts in your system</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchChange}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign ID
          </label>
          <input
            type="text"
            placeholder="Filter by campaign..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
          />
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

      {/* Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{gifts.length}</div>
          <div className="text-sm text-blue-800">Total Gifts</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{filteredGifts.length}</div>
          <div className="text-sm text-green-800">Filtered Results</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {gifts.filter(g => g.verified).length}
          </div>
          <div className="text-sm text-yellow-800">Verified</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {gifts.filter(g => !g.verified).length}
          </div>
          <div className="text-sm text-red-800">Unverified</div>
        </div>
      </div>

      {/* Gifts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
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
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentGifts.map((gift) => (
                <tr key={gift.gift_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {gift.gift_id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {gift.recipient?.full_name || gift.recipient_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {gift.recipient?.email || gift.recipient_email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(gift.gift?.type || gift.gift_type || 'Unknown').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {gift.meta?.campaign_id || gift.campaign_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(gift.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select
                      value={gift.status}
                      onChange={(e) => updateGiftStatus(gift.gift_id, e.target.value as GiftStatus)}
                      disabled={isUpdating === gift.gift_id}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusIcons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    {isUpdating === gift.gift_id && (
                      <LoadingSpinner size="sm" className="ml-2" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredGifts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">📭</div>
            <div className="text-gray-500">No gifts found matching your criteria</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredGifts.length)} of {filteredGifts.length} results
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftManagement;