const LOCAL_API_BASE_URL = 'http://localhost:3000/api';
const RAILWAY_API_BASE_URL = 'https://3p41kfcp.up.railway.app/api';
const PRODUCTION_API_BASE_URL = 'https://api.platform.com.ge/api';

export function resolveApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return RAILWAY_API_BASE_URL;
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return LOCAL_API_BASE_URL;
  }

  if (hostname.endsWith('vercel.app')) {
    return RAILWAY_API_BASE_URL;
  }

  if (
    hostname === 'platform.com.ge' ||
    hostname === 'www.platform.com.ge' ||
    hostname === 'dashboard.platform.com.ge'
  ) {
    return PRODUCTION_API_BASE_URL;
  }

  if (hostname === 'api.platform.com.ge') {
    return `${window.location.protocol}//${hostname}/api`;
  }

  return RAILWAY_API_BASE_URL;
}
