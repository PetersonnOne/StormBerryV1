/**
 * Polar Payment Gateway Utilities
 * 
 * This module provides utilities for integrating with Polar payment gateway
 * including checkout URL generation and customer management.
 */

export interface CheckoutParams {
  products: string; // Product ID from Polar
  customerId?: string;
  customerExternalId?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
}

/**
 * Generate a checkout URL for Polar payment processing
 * 
 * @param params - Checkout parameters including product ID and customer info
 * @returns Complete checkout URL
 */
export function generateCheckoutUrl(params: CheckoutParams): string {
  const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/billing/checkout`;
  const searchParams = new URLSearchParams();
  
  // Required parameter
  searchParams.append('products', params.products);
  
  // Optional parameters
  if (params.customerId) {
    searchParams.append('customerId', params.customerId);
  }
  
  if (params.customerExternalId) {
    searchParams.append('customerExternalId', params.customerExternalId);
  }
  
  if (params.customerEmail) {
    searchParams.append('customerEmail', params.customerEmail);
  }
  
  if (params.customerName) {
    searchParams.append('customerName', params.customerName);
  }
  
  if (params.metadata) {
    // URL-encode the JSON metadata
    searchParams.append('metadata', encodeURIComponent(JSON.stringify(params.metadata)));
  }
  
  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Generate a customer portal URL for managing subscriptions
 * 
 * @returns Customer portal URL
 */
export function generateCustomerPortalUrl(): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/billing/portal`;
}

/**
 * Product IDs for different subscription tiers
 * These should match your Polar product configuration
 */
export const POLAR_PRODUCTS = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID || 'your-pro-monthly-product-id',
  PRO_YEARLY: process.env.NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID || 'your-pro-yearly-product-id',
} as const;

/**
 * Subscription tiers configuration
 */
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    gptCalls: 5,
    ossCalls: 10,
    features: ['Basic AI access', 'Community support'],
  },
  PRO: {
    name: 'Pro',
    price: 29,
    gptCalls: 50,
    ossCalls: 50,
    features: [
      '50 GPT-5 calls per day',
      '50 OSS AI calls per day',
      'Priority support',
      'Advanced AI models access',
      'Enhanced productivity features',
    ],
  },
} as const;