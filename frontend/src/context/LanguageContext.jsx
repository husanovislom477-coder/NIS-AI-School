import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { dictionaries, availableLanguages as initialLanguages, resolveTranslation } from '../translations';
import { getLocalized } from '../utils/localize';
import { authAPI, translationAPI, languageAPI } from '../api';

const LanguageContext = createContext(null);

export { initialLanguages as availableLanguages };

export function LanguageProvider({ children }) {
  const queryClient = useQueryClient();
  const { t: i18nT, i18n: i18nInstance } = useTranslation();

  // 1. Initial language: active i18n language, or localStorage, or 'uz'
  const [language, setLanguageState] = useState(() => {
    return i18nInstance.language || localStorage.getItem('nis_language') || 'uz';
  });

  // Dynamic Languages list (loaded from database / backend)
  const [languages, setLanguages] = useState(() => {
    try {
      const cached = localStorage.getItem('nis_enabled_languages');
      return cached ? JSON.parse(cached) : initialLanguages;
    } catch {
      return initialLanguages;
    }
  });

  // Dynamic Translations loaded from Backend API (if available)
  const [dynamicTranslations, setDynamicTranslations] = useState(() => {
    try {
      const cached = localStorage.getItem('nis_backend_translations');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [loadingBackend, setLoadingBackend] = useState(false);

  // Fetch enabled languages list from backend database
  const reloadLanguages = useCallback(async () => {
    try {
      const res = await languageAPI.getAll({ all: false });
      if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
        setLanguages(res.data.data);
        try {
          localStorage.setItem('nis_enabled_languages', JSON.stringify(res.data.data));
        } catch (_) {}
      }
    } catch (_) {
      // Offline fallback: keep current / initial languages
    }
  }, []);

  useEffect(() => {
    reloadLanguages();
  }, [reloadLanguages]);

  // Fetch translation dictionary from backend API
  const fetchBackendTranslations = useCallback(async (lang) => {
    setLoadingBackend(true);
    try {
      const res = await translationAPI.getByLang(lang);
      if (res.data?.success && res.data?.translations) {
        setDynamicTranslations((prev) => {
          const updated = {
            ...prev,
            [lang]: res.data.translations,
          };
          try {
            localStorage.setItem('nis_backend_translations', JSON.stringify(updated));
          } catch {
            // Storage quota safe
          }
          return updated;
        });
      }
    } catch (_) {
      // Offline fallback: static dictionaries handle everything
    } finally {
      setLoadingBackend(false);
    }
  }, []);

  // Update HTML lang attribute and fetch backend updates whenever language changes
  useEffect(() => {
    document.documentElement.lang = language;
    fetchBackendTranslations(language);
  }, [language, fetchBackendTranslations]);

  // Set Language: immediate change, save in localStorage, sync with backend for authenticated user, and invalidate all queries
  const setLanguage = useCallback((lang) => {
    if (!lang) return;
    const cleanLang = String(lang).toLowerCase().trim();

    setLanguageState(cleanLang);
    i18n.changeLanguage(cleanLang);
    try {
      localStorage.setItem('nis_language', cleanLang);
    } catch {
      // Storage safe
    }
    document.documentElement.lang = cleanLang;

    // Invalidate and refetch all active queries immediately with the new language header
    if (queryClient) {
      queryClient.invalidateQueries();
    }

    // Synchronize with backend profile if authenticated
    const token = localStorage.getItem('nis_token') || sessionStorage.getItem('nis_token');
    if (token) {
      const fd = new FormData();
      fd.append('language', cleanLang);
      fd.append('languageCode', cleanLang);
      authAPI.updateProfile(fd).catch(() => {
        // Silent fail for guest or offline
      });
    }

    fetchBackendTranslations(cleanLang);
  }, [queryClient, fetchBackendTranslations]);

  /**
   * Main Translation function
   * @param {string} key - e.g. 'nav.home' or 'home'
   * @param {string|object} fallbackOrParams - fallback string or interpolation params
   */
  const t = useCallback((key, fallbackOrParams = '') => {
    if (!key) return '';

    let fallback = '';
    let params = null;
    if (typeof fallbackOrParams === 'string') {
      fallback = fallbackOrParams;
    } else if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      params = fallbackOrParams;
    }

    let result = '';

    // 0. Try react-i18next
    try {
      if (i18nT && typeof i18nT === 'function') {
        const translated = i18nT(key, params || {});
        if (translated && translated !== key) {
          result = translated;
        }
      }
    } catch (_) {}

    // 1. Try backend fetched translation next
    if (!result) {
      const fromBackend = resolveTranslation(dynamicTranslations[language], key);
      if (typeof fromBackend === 'string' && fromBackend !== '') {
        result = fromBackend;
      }
    }

    // 2. Try static dictionary for current language
    if (!result) {
      const currentDict = dictionaries[language] || dictionaries.en;
      const resolvedCurrent = resolveTranslation(currentDict, key);
      if (typeof resolvedCurrent === 'string' && resolvedCurrent !== '') {
        result = resolvedCurrent;
      }
    }

    // 3. Fallback to English (en) dictionary
    if (!result && language !== 'en') {
      const enDict = dictionaries.en;
      const resolvedEn = resolveTranslation(enDict, key);
      if (typeof resolvedEn === 'string' && resolvedEn !== '') {
        result = resolvedEn;
      }
    }

    // 4. Fallback to Uzbek (uz) dictionary
    if (!result && language !== 'uz') {
      const uzDict = dictionaries.uz;
      const resolvedUz = resolveTranslation(uzDict, key);
      if (typeof resolvedUz === 'string' && resolvedUz !== '') {
        result = resolvedUz;
      }
    }

    // 5. Fallback parameter, or return cleaned key (never undefined/null/object)
    if (!result) {
      if (typeof fallback === 'string' && fallback !== '') {
        result = fallback;
      } else {
        const segments = key.split('.');
        result = segments[segments.length - 1] || key;
      }
    }

    // Ensure result is strictly a string (prevent any object rendering crash)
    if (typeof result !== 'string' && typeof result !== 'number') {
      result = typeof fallback === 'string' && fallback ? fallback : String(key);
    }

    // Interpolation if params provided (e.g. { count: 5, name: 'Alex' })
    if (params && typeof result === 'string') {
      for (const [pKey, pVal] of Object.entries(params)) {
        result = result.replace(new RegExp(`{${pKey}}`, 'g'), pVal);
      }
    }

    return String(result);
  }, [language, dynamicTranslations]);

  /**
   * Database item localizer
   * e.g. tDb(branch, 'name') or tDb(news, 'title')
   */
  const tDb = useCallback((item, field) => {
    return getLocalized(item, field, language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tDb,
        languages,
        reloadLanguages,
        loadingBackend,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    const fallbackLang = localStorage.getItem('nis_language') || 'en';
    const fallbackDict = dictionaries[fallbackLang] || dictionaries.en;
    return {
      language: fallbackLang,
      setLanguage: (l) => {
        try {
          localStorage.setItem('nis_language', l);
        } catch {
          // safe
        }
      },
      t: (key, fallback = '') => resolveTranslation(fallbackDict, key) || fallback || key,
      tDb: (item, field) => getLocalized(item, field, fallbackLang),
      languages: initialLanguages,
      reloadLanguages: () => {},
      loadingBackend: false,
    };
  }
  return ctx;
}

export default LanguageContext;
