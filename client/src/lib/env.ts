/**
 * Environment variable helper to ensure consistent access across development and production
 */

// Stripe public key - must be prefixed with VITE_ to be accessible in the browser
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string;

// Helper to check if we're in a production environment
export const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Helper to check if we're in a Vercel environment
export const isVercel = typeof process.env.VERCEL !== 'undefined' || 
                       typeof process.env.VERCEL_URL !== 'undefined';

// Helper to get the base URL for API requests
export function getBaseUrl() {
  // For browser requests, use relative paths
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // For server-side rendering on Vercel
  if (isVercel) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Local development
  return 'http://localhost:5000';
}