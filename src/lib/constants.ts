// Site URLs for different environments
export const SITE_URLS = {
  DEVELOPMENT: 'http://localhost:3000',
  PRODUCTION: 'https://www.stacknflow.com'
};

// Get the appropriate site URL based on the current environment
export function getSiteUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side, use environment variable or default to production
    return process.env.NEXT_PUBLIC_SITE_URL || SITE_URLS.PRODUCTION;
  }
  
  // Client-side, check hostname
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const port = window.location.port || '3000';
    return `http://localhost:${port}`;
  }
  
  // Production domain or Vercel preview
  if (hostname.includes('stacknflow.com')) {
    return SITE_URLS.PRODUCTION;
  }
  
  // Fallback to current origin
  return window.location.origin;
}
