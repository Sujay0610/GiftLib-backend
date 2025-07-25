import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GiftStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status icon mapping
export const statusIcons: Record<GiftStatus, string> = {
  pending: "⏳",
  verified: "✅",
  cancelled: "❌",
  dispatched: "🚚",
  delivered: "📦",
  failed: "💥"
};

// Status color mapping
export const statusColors: Record<GiftStatus, string> = {
  pending: "text-yellow-600",
  verified: "text-green-600",
  cancelled: "text-red-600",
  dispatched: "text-blue-600",
  delivered: "text-emerald-600",
  failed: "text-red-700"
};

// Format date string
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString.slice(0, 19); // Fallback to first 19 characters
  }
}

// Format API key for display (masked)
export function formatApiKey(apiKey: string): string {
  if (!apiKey) return '';
  if (apiKey.length <= 16) return apiKey;
  return `${apiKey.slice(0, 12)}...${apiKey.slice(-4)}`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate sample bulk data
export function generateSampleBulkData() {
  return {
    gifts: [
      {
        recipient: {
          fullName: "Alice Johnson",
          email: "alice@example.com",
          phone: "+1234567891",
          address: {
            line1: "456 Oak Ave",
            city: "Los Angeles",
            state: "CA",
            zip: "90210",
            country: "USA"
          }
        },
        gift: {
          type: "thank_you_card" as const,
          templateId: "template1",
          message: "Thank you for your hard work!",
          deliveryDate: "2025-08-01"
        },
        meta: {
          campaignId: "bulk_campaign_001",
          orderSource: "Bulk Upload"
        }
      },
      {
        recipient: {
          fullName: "Bob Wilson",
          email: "bob@example.com",
          phone: "+1234567892",
          address: {
            line1: "789 Pine St",
            city: "Chicago",
            state: "IL",
            zip: "60601",
            country: "USA"
          }
        },
        gift: {
          type: "congratulations_card" as const,
          templateId: "template2",
          message: "Congratulations on your achievement!",
          deliveryDate: "2025-08-01"
        },
        meta: {
          campaignId: "bulk_campaign_001",
          orderSource: "Bulk Upload"
        }
      }
    ],
    meta: {
      campaignId: "bulk_campaign_001",
      orderSource: "Bulk Upload"
    }
  };
}

// Download file helper
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Calculate statistics from gifts array
export function calculateStatistics(gifts: any[]) {
  const total = gifts.length;
  const statusCounts = gifts.reduce((acc, gift) => {
    const status = gift.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const verifiedCount = gifts.filter(gift => gift.verified).length;
  const unverifiedCount = total - verifiedCount;
  
  return {
    total,
    pending: statusCounts.pending || 0,
    verified: statusCounts.verified || 0,
    cancelled: statusCounts.cancelled || 0,
    dispatched: statusCounts.dispatched || 0,
    delivered: statusCounts.delivered || 0,
    failed: statusCounts.failed || 0,
    verifiedCount,
    unverifiedCount,
    statusCounts
  };
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Local storage helpers
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage errors silently
    }
  },
  
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  }
};