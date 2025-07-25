'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/utils';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

interface HealthCheck {
  status: string;
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: {
    status: string;
    response_time?: number;
  };
  email_service?: {
    status: string;
    provider?: string;
  };
  fulfillment_service?: {
    status: string;
    provider?: string;
  };
}

interface ProductionReadiness {
  overall_status: string;
  checks: {
    database: boolean;
    email_config: boolean;
    fulfillment_config: boolean;
    api_security: boolean;
  };
  recommendations: string[];
}

const APIStatus: React.FC = () => {
  const { user, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState<HealthCheck | null>(null);
  const [productionStatus, setProductionStatus] = useState<ProductionReadiness | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingProduction, setIsLoadingProduction] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadHealthStatus();
    loadProductionReadiness();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadHealthStatus();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const loadHealthStatus = async () => {
    setIsLoadingHealth(true);
    try {
      const response = await apiService.healthCheck();
      setHealthStatus(response);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error('Error loading health status:', error);
      setHealthStatus({
        status: 'error',
        timestamp: new Date().toISOString()
      });
      if (!autoRefresh) {
        toast.error('Failed to load API health status');
      }
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const loadProductionReadiness = async () => {
    setIsLoadingProduction(true);
    try {
      // Simulate production readiness check
      // In a real implementation, this would call an actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProductionStatus: ProductionReadiness = {
        overall_status: Math.random() > 0.3 ? 'ready' : 'not_ready',
        checks: {
          database: Math.random() > 0.1,
          email_config: Math.random() > 0.2,
          fulfillment_config: Math.random() > 0.4,
          api_security: Math.random() > 0.1
        },
        recommendations: []
      };
      
      // Generate recommendations based on failed checks
      if (!mockProductionStatus.checks.database) {
        mockProductionStatus.recommendations.push('Configure database connection');
      }
      if (!mockProductionStatus.checks.email_config) {
        mockProductionStatus.recommendations.push('Set up email service configuration');
      }
      if (!mockProductionStatus.checks.fulfillment_config) {
        mockProductionStatus.recommendations.push('Configure fulfillment API');
      }
      if (!mockProductionStatus.checks.api_security) {
        mockProductionStatus.recommendations.push('Review API security settings');
      }
      
      setProductionStatus(mockProductionStatus);
    } catch (error: any) {
      console.error('Error loading production readiness:', error);
      toast.error('Failed to load production readiness status');
    } finally {
      setIsLoadingProduction(false);
    }
  };

  const handleRefresh = () => {
    loadHealthStatus();
    loadProductionReadiness();
  };

  const handleClearSession = () => {
    // Clear any session-specific data
    setHealthStatus(null);
    setProductionStatus(null);
    setLastRefresh(null);
    toast.success('Session data cleared');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'ready':
        return 'text-green-600';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600';
      case 'error':
      case 'unhealthy':
      case 'not_ready':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'ready':
        return '✅';
      case 'warning':
      case 'degraded':
        return '⚠️';
      case 'error':
      case 'unhealthy':
      case 'not_ready':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 API Status</h2>
        <p className="text-gray-600">Monitor API health and production readiness</p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoadingHealth || isLoadingProduction}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {(isLoadingHealth || isLoadingProduction) ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Refreshing...</span>
                </div>
              ) : (
                '🔄 Refresh'
              )}
            </button>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-4">
            {lastRefresh && (
              <span className="text-sm text-gray-500">
                Last updated: {formatDate(lastRefresh.toISOString())}
              </span>
            )}
            
            <button
              onClick={handleClearSession}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            >
              🗑️ Clear Session
            </button>
          </div>
        </div>
      </div>

      {/* API Health Status */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏥 API Health Check</h3>
        
        {healthStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Status</span>
                  <span className="text-2xl">{getStatusIcon(healthStatus.status)}</span>
                </div>
                <div className={`text-lg font-semibold ${getStatusColor(healthStatus.status)}`}>
                  {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
                </div>
              </div>
              
              {healthStatus.version && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">API Version</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {healthStatus.version}
                  </div>
                </div>
              )}
              
              {healthStatus.uptime && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-2">Uptime</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatUptime(healthStatus.uptime)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Service Status */}
            {(healthStatus.database || healthStatus.email_service || healthStatus.fulfillment_service) && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Service Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {healthStatus.database && (
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Database</span>
                        <span className="text-lg">{getStatusIcon(healthStatus.database.status)}</span>
                      </div>
                      <div className={`text-sm font-semibold ${getStatusColor(healthStatus.database.status)}`}>
                        {healthStatus.database.status}
                      </div>
                      {healthStatus.database.response_time && (
                        <div className="text-xs text-gray-500 mt-1">
                          {healthStatus.database.response_time}ms
                        </div>
                      )}
                    </div>
                  )}
                  
                  {healthStatus.email_service && (
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Email Service</span>
                        <span className="text-lg">{getStatusIcon(healthStatus.email_service.status)}</span>
                      </div>
                      <div className={`text-sm font-semibold ${getStatusColor(healthStatus.email_service.status)}`}>
                        {healthStatus.email_service.status}
                      </div>
                      {healthStatus.email_service.provider && (
                        <div className="text-xs text-gray-500 mt-1">
                          {healthStatus.email_service.provider}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {healthStatus.fulfillment_service && (
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Fulfillment</span>
                        <span className="text-lg">{getStatusIcon(healthStatus.fulfillment_service.status)}</span>
                      </div>
                      <div className={`text-sm font-semibold ${getStatusColor(healthStatus.fulfillment_service.status)}`}>
                        {healthStatus.fulfillment_service.status}
                      </div>
                      {healthStatus.fulfillment_service.provider && (
                        <div className="text-xs text-gray-500 mt-1">
                          {healthStatus.fulfillment_service.provider}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-500">Click "Refresh" to check API health status</p>
          </div>
        )}
      </div>

      {/* Production Readiness */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Production Readiness</h3>
        
        {productionStatus ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Readiness</span>
                <span className="text-2xl">{getStatusIcon(productionStatus.overall_status)}</span>
              </div>
              <div className={`text-lg font-semibold ${getStatusColor(productionStatus.overall_status)}`}>
                {productionStatus.overall_status === 'ready' ? 'Production Ready' : 'Not Ready'}
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Readiness Checks</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(productionStatus.checks).map(([check, passed]) => (
                  <div key={check} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {check.replace('_', ' ')}
                    </span>
                    <div className="flex items-center">
                      <span className={`text-lg mr-2 ${passed ? 'text-green-500' : 'text-red-500'}`}>
                        {passed ? '✅' : '❌'}
                      </span>
                      <span className={`text-sm font-medium ${passed ? 'text-green-600' : 'text-red-600'}`}>
                        {passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {productionStatus.recommendations.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <ul className="space-y-2">
                    {productionStatus.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-500 mr-2 mt-0.5">⚠️</span>
                        <span className="text-sm text-yellow-800">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <p className="text-gray-500">Click "Refresh" to check production readiness</p>
          </div>
        )}
      </div>

      {/* Session Information */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Session Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Current User</div>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
              {user?.username || 'Not logged in'}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">User Role</div>
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
              {user?.role || 'N/A'}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Session Status</div>
            <div className="flex items-center">
              <span className="text-green-500 text-lg mr-2">✅</span>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Actions</div>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIStatus;