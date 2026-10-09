import axios from 'axios';

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Clean up trailing slashes and ensure it ends with /api
const trimmed = rawApiUrl.replace(/\/+$/, '');
const API_URL = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token and current language
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nis_token') || sessionStorage.getItem('nis_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const lang = localStorage.getItem('nis_language') || 'en';
    config.headers['Accept-Language'] = lang;

    if (!config.params) {
      config.params = {};
    }
    if (!config.params.language && !config.params.lang) {
      config.params.language = lang;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/auth/login') ||
      error.config?.url?.includes('/auth/register') ||
      error.config?.url?.includes('/auth/admin-login');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('nis_token');
      localStorage.removeItem('nis_user');
      sessionStorage.removeItem('nis_token');
      sessionStorage.removeItem('nis_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
