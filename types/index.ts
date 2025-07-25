// User types
export interface User {
  user_id: string;
  email: string;
  full_name: string;
  company_name?: string;
  api_key: string;
  created_at: string;
}

export interface UserInfo {
  email: string;
  user_id: string;
  full_name: string;
}

// Gift types
export interface Address {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Recipient {
  fullName: string;
  email: string;
  phone: string;
  address: Address;
}

export interface Gift {
  type: 'thank_you_card' | 'birthday_card' | 'congratulations_card' | 'holiday_card';
  templateId: string;
  message: string;
  deliveryDate: string;
}

export interface Meta {
  campaignId: string;
  orderSource: string;
}

export interface GiftData {
  recipient: Recipient;
  gift: Gift;
  meta: Meta;
}

export interface GiftResponse {
  gift_id: string;
  recipient_name: string;
  recipient_email: string;
  gift_type: string;
  status: GiftStatus;
  campaign_id: string;
  verified: boolean;
  created_at: string;
  updated_at?: string;
  // Legacy nested structure for backward compatibility
  recipient?: {
    full_name: string;
    email: string;
  };
  gift?: {
    type: string;
  };
  meta?: {
    campaign_id: string;
  };
}

// Bulk operations
export interface BulkGiftData {
  gifts: GiftData[];
  meta: Meta;
}

export interface BulkGiftResponse {
  success: boolean;
  totalGifts: number;
  successfulGifts: number;
  failedGifts: number;
  results: Array<{
    success: boolean;
    giftId?: string;
    error?: string;
  }>;
}

// Campaign types
export interface CampaignResponse {
  success: boolean;
  totalGifts: number;
  gifts: GiftResponse[];
}

// Status types
export type GiftStatus = 'pending' | 'verified' | 'cancelled' | 'dispatched' | 'delivered' | 'failed';

export interface StatusUpdate {
  giftId: string;
  status: GiftStatus;
  notes?: string;
}

// Email configuration
export interface EmailConfig {
  resend_api_key: string;
  from_email: string;
  sending_domain?: string;
}

export interface EmailConfigResponse {
  resend_configured: boolean;
  from_email_configured: boolean;
  sending_domain_configured: boolean;
  from_email?: string;
  sending_domain?: string;
  is_custom_config: boolean;
  email_enabled: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Statistics types
export interface GiftStatistics {
  total: number;
  pending: number;
  verified: number;
  cancelled: number;
  dispatched: number;
  delivered: number;
  failed: number;
  verifiedCount: number;
  unverifiedCount: number;
}

// Form types
export interface CreateUserForm {
  email: string;
  full_name: string;
  company_name?: string;
}

export interface LoginForm {
  api_key: string;
}

// Navigation types
export type PageType = 
  | 'Gift Operations'
  | 'Gift Management'
  | 'Statistics'
  | 'Bulk Operations'
  | 'Excel Operations'
  | 'Mock Verification'
  | 'Email Configuration'
  | 'Fulfillment Configuration'
  | 'API Status';

// Loading states
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Error types
export interface ErrorState {
  hasError: boolean;
  message?: string;
}