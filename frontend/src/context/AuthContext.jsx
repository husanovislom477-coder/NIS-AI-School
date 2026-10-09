import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication on startup
  useEffect(() => {
    const token = localStorage.getItem('nis_token') || sessionStorage.getItem('nis_token');
    const savedUser = localStorage.getItem('nis_user') || sessionStorage.getItem('nis_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with backend silently
        authAPI.getMe()
          .then((res) => {
            if (res.data?.data) {
              setUser(res.data.data);
              if (localStorage.getItem('nis_token')) {
                localStorage.setItem('nis_user', JSON.stringify(res.data.data));
              } else {
                sessionStorage.setItem('nis_user', JSON.stringify(res.data.data));
              }
            }
          })
          .catch(() => {
            // Token expired or invalid
          });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const saveAuthSession = (token, userData, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('nis_token', token);
      localStorage.setItem('nis_user', JSON.stringify(userData));
      sessionStorage.removeItem('nis_token');
      sessionStorage.removeItem('nis_user');
    } else {
      sessionStorage.setItem('nis_token', token);
      sessionStorage.setItem('nis_user', JSON.stringify(userData));
      localStorage.removeItem('nis_token');
      localStorage.removeItem('nis_user');
    }

    const userLang = userData?.language || userData?.languageCode;
    if (userLang) {
      try {
        localStorage.setItem('nis_language', userLang);
        document.documentElement.lang = userLang;
      } catch (_) {}
    }

    setUser(userData);
  };

  const login = async (email, password, twoFactorCode, rememberMe = true) => {
    const { data } = await authAPI.login({ email, password, twoFactorCode });
    if (data.requires2FA) {
      return data;
    }
    saveAuthSession(data.token, data.data, rememberMe);
    return data;
  };

  const adminLogin = async (email, password, twoFactorCode, rememberMe = true) => {
    const { data } = await authAPI.adminLogin({ email, password, twoFactorCode });
    if (data.requires2FA) {
      return data;
    }
    saveAuthSession(data.token, data.data, rememberMe);
    return data;
  };

  const register = async (formData, rememberMe = true) => {
    const { data } = await authAPI.register(formData);
    saveAuthSession(data.token, data.data, rememberMe);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('nis_token');
    localStorage.removeItem('nis_user');
    sessionStorage.removeItem('nis_token');
    sessionStorage.removeItem('nis_user');
    setUser(null);
    try {
      authAPI.login ? authAPI.logout?.() : null;
    } catch (_) {}
    toast.success('Tizimdan chiqildi');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (localStorage.getItem('nis_token')) {
      localStorage.setItem('nis_user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('nis_user', JSON.stringify(updatedUser));
    }
  };

  const role = (user?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateUser,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
