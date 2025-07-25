'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatApiKey } from '@/lib/utils';
import InitiateGift from '../components/sections/InitiateGift';
import GiftManagement from '../components/sections/GiftManagement';
import Statistics from '../components/sections/Statistics';
import BulkOperations from '../components/sections/BulkOperations';
import ExcelOperations from '../components/sections/ExcelOperations';
import CampaignManagement from '../components/sections/CampaignManagement';
import GiftStatusManagement from '../components/sections/GiftStatusManagement';
import MockVerification from '../components/sections/MockVerification';
import EmailConfiguration from '../components/sections/EmailConfiguration';
import FulfillmentConfiguration from '../components/sections/FulfillmentConfiguration';
import ApiStatus from '../components/sections/ApiStatus';


type Section = 
  | 'initiate'
  | 'management'
  | 'statistics'
  | 'bulk'
  | 'excel'
  | 'campaign'
  | 'status'
  | 'mock'
  | 'email'
  | 'fulfillment'
  | 'api';

const MainApp: React.FC = () => {
  const { userInfo, logout, apiKey } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('initiate');

  const sections = [
    { id: 'initiate' as Section, label: '🎁 Initiate Gift', icon: '🎁' },
    { id: 'management' as Section, label: '📋 Gift Management', icon: '📋' },
    { id: 'statistics' as Section, label: '📊 Statistics', icon: '📊' },
    { id: 'bulk' as Section, label: '📦 Bulk Operations', icon: '📦' },
    { id: 'excel' as Section, label: '📄 Excel Operations', icon: '📄' },
    // { id: 'campaign' as Section, label: '🎯 Campaign Management', icon: '🎯' },
    // { id: 'status' as Section, label: '🔄 Gift Status Management', icon: '🔄' },
    { id: 'mock' as Section, label: '🧪 Mock Verification (Sandbox Testing only)', icon: '🧪' },
    { id: 'email' as Section, label: '📧 Email Configuration', icon: '📧' },
    { id: 'fulfillment' as Section, label: '🚚 Fulfillment Configuration', icon: '🚚' },
    { id: 'api' as Section, label: '⚙️ API Status', icon: '⚙️' }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'initiate':
        return <InitiateGift />;
      case 'management':
        return <GiftManagement />;
      case 'statistics':
        return <Statistics />;
      case 'bulk':
        return <BulkOperations />;
      case 'excel':
        return <ExcelOperations />;
      // case 'campaign':
      //   return <CampaignManagement />;
      // case 'status':
      //   return <GiftStatusManagement />;
      case 'mock':
        return <MockVerification />;
      case 'email':
        return <EmailConfiguration />;
      case 'fulfillment':
        return <FulfillmentConfiguration />;
      case 'api':
        return <ApiStatus />;
      default:
        return <InitiateGift />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="w-full px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <h1 className="text-2xl font-bold text-white">GiftLib</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-blue-700 bg-opacity-50 px-3 py-1 rounded-full">
                <span className="text-xs text-blue-100">API:</span>
                <span className="text-xs font-mono text-white">{formatApiKey(apiKey)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {userInfo?.full_name}
                </div>
                <div className="text-xs text-blue-100">
                  {userInfo?.email}
                </div>
              </div>
              
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-white border-opacity-20 text-sm font-medium rounded-lg text-white bg-white bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.label.replace(/^[^\s]+ /, '')}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
