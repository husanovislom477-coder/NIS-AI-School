import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { dictionaries } from './translations';

const resources = {
  en: { translation: dictionaries.en },
  uz: { translation: dictionaries.uz },
  ru: { translation: dictionaries.ru },
  tr: { translation: dictionaries.tr },
  de: { translation: dictionaries.de },
  fr: { translation: dictionaries.fr },
  es: { translation: dictionaries.es },
  ko: { translation: dictionaries.ko },
  zh: { translation: dictionaries.zh },
  ja: { translation: dictionaries.ja },
};

const initialLang = (() => {
  try {
    return localStorage.getItem('nis_language') || 'uz';
  } catch (_) {
    return 'uz';
  }
})();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'en',
    supportedLngs: ['en', 'uz', 'ru', 'tr', 'de', 'fr', 'es', 'ko', 'zh', 'ja'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'nis_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Keep HTML lang attribute synchronized
if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language || 'uz';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    try {
      localStorage.setItem('nis_language', lng);
    } catch (_) {}
  });
}

export default i18n;
