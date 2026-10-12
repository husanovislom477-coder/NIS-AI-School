/**
 * Utility to format image URLs properly for local backend uploads or remote CDN.
 */
export const getImageUrl = (url, fallback = '') => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  // Derive backend base dynamically
  const apiBase = import.meta.env.VITE_API_URL || '';
  const derivedBackend = apiBase.replace(/\/api\/?$/, '');
  const backendBase =
    import.meta.env.VITE_BACKEND_URL ||
    derivedBackend ||
    (import.meta.env.PROD ? 'https://nis-ai-school-kbc1.onrender.com' : 'http://localhost:3001');

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${backendBase}${cleanPath}`;
};

export const getAvatarUrl = (user, size = 64) => {
  if (user?.avatar) return getImageUrl(user.avatar);
  const name = `${user?.firstName || 'User'} ${user?.lastName || ''}`.trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=${size}`;
};
