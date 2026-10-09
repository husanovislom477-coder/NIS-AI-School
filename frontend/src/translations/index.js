import en from './en.json';
import uz from './uz.json';
import ru from './ru.json';
import tr from './tr.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';
import ko from './ko.json';
import zh from './zh.json';
import ja from './ja.json';

export const dictionaries = {
  en,
  uz,
  ru,
  tr,
  de,
  fr,
  es,
  ko,
  zh,
  ja,
};

export const availableLanguages = [
  {
    code: 'en',
    flag: '🇬🇧',
    label: 'English',
    nativeName: 'English (US / UK)',
    short: 'EN',
    description: 'International language interface for NIS AI School',
  },
  {
    code: 'uz',
    flag: '🇺🇿',
    label: "O'zbekcha",
    nativeName: "O'zbek tili (Lotin)",
    short: 'UZ',
    description: "Platformaning asosiy davlat tili interfeysi",
  },
  {
    code: 'ru',
    flag: '🇷🇺',
    label: 'Русский',
    nativeName: 'Русский язык',
    short: 'RU',
    description: 'Интерфейс платформы на русском языке',
  },
  {
    code: 'tr',
    flag: '🇹🇷',
    label: 'Türkçe',
    nativeName: 'Türkçe',
    short: 'TR',
    description: 'NIS AI School Türkçe arayüzü',
  },
  {
    code: 'de',
    flag: '🇩🇪',
    label: 'Deutsch',
    nativeName: 'Deutsch',
    short: 'DE',
    description: 'Deutsche Benutzeroberfläche für NIS AI School',
  },
  {
    code: 'fr',
    flag: '🇫🇷',
    label: 'Français',
    nativeName: 'Français',
    short: 'FR',
    description: 'Interface en français pour NIS AI School',
  },
  {
    code: 'es',
    flag: '🇪🇸',
    label: 'Español',
    nativeName: 'Español',
    short: 'ES',
    description: 'Interfaz en español para NIS AI School',
  },
  {
    code: 'ko',
    flag: '🇰🇷',
    label: '한국어',
    nativeName: '한국어',
    short: 'KO',
    description: 'NIS AI School 한국어 인터페이스',
  },
  {
    code: 'zh',
    flag: '🇨🇳',
    label: '中文',
    nativeName: '简体中文',
    short: 'ZH',
    description: 'NIS AI School 中文界面',
  },
  {
    code: 'ja',
    flag: '🇯🇵',
    label: '日本語',
    nativeName: '日本語',
    short: 'JA',
    description: 'NIS AI School 日本語インターフェース',
  },
];

/**
 * Resolves a key (e.g. 'nav.home' or 'home' or 'settings.language') from dictionary
 */
export function resolveTranslation(dict, key) {
  if (!dict || !key) return undefined;

  // 1. Direct key match: dict['nav.home'] or dict['home']
  if (dict[key] !== undefined && typeof dict[key] === 'string') {
    return dict[key];
  }

  // 2. Nested path: 'nav.home' -> dict.nav?.home
  if (key.includes('.')) {
    const parts = key.split('.');
    let cur = dict;
    for (const p of parts) {
      if (cur === undefined || cur === null) break;
      cur = cur[p];
    }
    if (typeof cur === 'string') {
      return cur;
    }
  }

  // 3. Flat lookup if key without namespace: search all top-level objects
  for (const group of Object.keys(dict)) {
    if (dict[group] && typeof dict[group] === 'object' && dict[group][key] !== undefined) {
      if (typeof dict[group][key] === 'string') {
        return dict[group][key];
      }
    }
  }

  return undefined;
}
