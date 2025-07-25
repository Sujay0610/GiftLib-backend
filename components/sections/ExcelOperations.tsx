'use client';

import React, { useState, useRef } from 'react';
import { apiService } from '@/lib/api';
import { downloadFile } from '@/lib/utils';
import LoadingSpinner from '../LoadingSpinner';
import toast from 'react-hot-toast';

const ExcelOperations: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await apiService.downloadExcelTemplate();
      
      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Download the file
      downloadFile(blob, 'gift_template.xlsx');
      toast.success('Template downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    await handleFileUpload(file);
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const response = await apiService.uploadExcelFile(file, 'default-campaign');
      
      setUploadResult(response);
      toast.success(`Successfully processed ${response.processedGifts || 0} gifts!`);
      
      if (response.invalidRows && response.invalidRows > 0) {
        toast.error(`${response.invalidRows} rows failed to process`);
      }
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      if (error.response?.status === 400) {
        toast.error('Invalid Excel file format or data');
      } else if (error.response?.status === 413) {
        toast.error('File too large. Please use a smaller file.');
      } else {
        toast.error('Failed to upload Excel file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );
    
    if (excelFile) {
      await handleFileUpload(excelFile);
    } else {
      toast.error('Please drop a valid Excel file');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📄 Excel Operations</h2>
        <p className="text-gray-600">Download template and upload Excel files for bulk gift creation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Download Template */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📥 Download Template</h3>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Download the Excel template to see the required format for bulk gift uploads.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Template includes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Recipient information columns</li>
                <li>• Address fields</li>
                <li>• Gift details and message</li>
                <li>• Campaign and metadata fields</li>
                <li>• Sample data for reference</li>
              </ul>
            </div>
            
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Downloading...</span>
                </>
              ) : (
                '📥 Download Excel Template'
              )}
            </button>
          </div>
        </div>

        {/* Upload Excel File */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Upload Excel File</h3>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a completed Excel file to create multiple gifts at once.
            </p>
            
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isUploading 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {isUploading ? (
                <div className="space-y-3">
                  <LoadingSpinner size="lg" />
                  <div className="text-sm text-gray-600">Processing Excel file...</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-4xl">📄</div>
                  <div className="text-sm text-gray-600">
                    Drag and drop your Excel file here, or
                  </div>
                  <button
                    onClick={handleFileSelect}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    📁 Browse Files
                  </button>
                  <div className="text-xs text-gray-500">
                    Supports .xlsx and .xls files (max 10MB)
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Upload Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {uploadResult.processedGifts || 0}
              </div>
              <div className="text-sm text-green-800">Gifts Created</div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {uploadResult.invalidRows || 0}
              </div>
              <div className="text-sm text-red-800">Invalid Rows</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {uploadResult.totalRows || 0}
              </div>
              <div className="text-sm text-blue-800">Total Rows</div>
            </div>
          </div>
          
          {/* Gift IDs */}
          {uploadResult.giftIds && uploadResult.giftIds.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">✅ Created Gift IDs</h4>
              <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                <div className="text-xs font-mono space-y-1">
                  {uploadResult.giftIds.map((id: string, index: number) => (
                    <div key={index} className="text-gray-700">{id}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Errors */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">❌ Errors</h4>
              <div className="bg-red-50 p-3 rounded border max-h-32 overflow-y-auto">
                <div className="text-xs space-y-1">
                  {uploadResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-red-700">{error}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Clear Results */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => setUploadResult(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              🗑️ Clear Results
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Tips for Excel Upload</h3>
        <div className="text-sm text-yellow-800 space-y-2">
          <p>1. <strong>Download the template first</strong> to see the required column format</p>
          <p>2. <strong>Fill in all required fields:</strong> Full Name, Email, Address Line 1, City, State, ZIP, Country, Gift Type, Message</p>
          <p>3. <strong>Use valid gift types:</strong> thank_you_card, congratulations_card, birthday_card, holiday_card, custom_card</p>
          <p>4. <strong>Keep file size under 10MB</strong> for optimal performance</p>
          <p>5. <strong>Check for errors</strong> in the upload results and fix any issues in your Excel file</p>
          <p>6. <strong>Campaign ID and Order Source</strong> are optional but helpful for tracking</p>
        </div>
      </div>
    </div>
  );
};

export default ExcelOperations;