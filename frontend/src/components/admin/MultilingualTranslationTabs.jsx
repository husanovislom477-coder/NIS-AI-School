import { useState } from 'react';
import { FiCheck, FiAlertTriangle, FiGlobe, FiCopy } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Reusable dynamic multilingual translation editor for Admin Panel.
 * Dynamically renders tabs and fields for whatever languages are enabled in the database.
 * Shows translation completion status badges (e.g. English ✓, Uzbek ✓, German ⚠ Missing).
 *
 * Props:
 * - fields: Array<{ key: string, label: string, type?: 'text'|'textarea'|'number', required?: boolean, placeholder?: string, rows?: number }>
 * - translations: Object { [langCode]: { [fieldKey]: value } }
 * - onChange: (langCode: string, fieldKey: string, value: any) => void
 * - onBulkSet?: (newTranslations: Object) => void
 */
export default function MultilingualTranslationTabs({
  fields = [],
  translations = {},
  onChange,
  onBulkSet,
}) {
  const { languages: allLanguages, t } = useLanguage();

  // Filter only enabled languages dynamically (no hardcoded count!)
  const enabledLanguages = (allLanguages || []).filter((l) => l.isEnabled !== false);

  const [activeLang, setActiveLang] = useState(
    enabledLanguages[0]?.code || 'en'
  );

  // Check if a language has all required fields completed
  const checkStatus = (langCode) => {
    const langData = translations[langCode] || {};
    const requiredFields = fields.filter((f) => f.required);
    if (requiredFields.length === 0) {
      // If none explicitly marked required, check if at least primary (first) field is filled
      const firstField = fields[0]?.key;
      return !!(firstField && langData[firstField]?.toString().trim());
    }
    return requiredFields.every((f) => {
      const v = langData[f.key];
      return v !== undefined && v !== null && v.toString().trim() !== '';
    });
  };

  const completedCount = enabledLanguages.filter((l) => checkStatus(l.code)).length;
  const totalCount = enabledLanguages.length;
  const isAllComplete = completedCount === totalCount;

  // Copy values from English into current language
  const handleCopyFromEn = () => {
    const enData = translations.en || translations.uz || {};
    fields.forEach((f) => {
      if (enData[f.key] && !(translations[activeLang]?.[f.key])) {
        onChange(activeLang, f.key, enData[f.key]);
      }
    });
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
      {/* Header bar with summary & completion status */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiGlobe className="text-school-600" size={16} />
          <span className="text-xs font-bold text-slate-800">
            {t('admin.multilingualContent', 'Ko‘p Tillik Tarjimalar (Multilingual Content)')}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isAllComplete
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {completedCount} / {totalCount} {t('admin.completed', 'tayyor')}
          </span>
        </div>

        {activeLang !== 'en' && translations.en && (
          <button
            type="button"
            onClick={handleCopyFromEn}
            className="text-[11px] font-medium text-school-600 hover:text-school-800 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50"
          >
            <FiCopy size={12} />
            {t('admin.copyFromEn', 'Inglizchadan nusxalash')}
          </button>
        )}
      </div>

      {/* Dynamic Languages Tabs */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100/70 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {enabledLanguages.map((lang) => {
          const isComplete = checkStatus(lang.code);
          const isActive = activeLang === lang.code;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-white text-school-700 shadow-xs border border-school-200'
                  : 'text-slate-600 hover:bg-white/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span>{lang.flag || '🌐'}</span>
              <span>{lang.name || lang.code.toUpperCase()}</span>

              {isComplete ? (
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                  <FiCheck size={10} />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]" title="Missing translation">
                  <FiAlertTriangle size={9} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Translation completion status preview chips */}
      <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-slate-500 font-medium">Status:</span>
        {enabledLanguages.map((lang) => {
          const isComplete = checkStatus(lang.code);
          return (
            <span
              key={lang.code}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                isComplete
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {lang.name}: {isComplete ? '✓' : '⚠ Missing'}
            </span>
          );
        })}
      </div>

      {/* Active Language Form Fields */}
      <div className="p-4 space-y-3.5">
        {fields.map((field) => {
          const value = translations[activeLang]?.[field.key] || '';

          return (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {field.label} ({enabledLanguages.find((l) => l.code === activeLang)?.name || activeLang})
                {field.required && <span className="text-rose-500 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  rows={field.rows || 3}
                  value={value}
                  onChange={(e) => onChange(activeLang, field.key, e.target.value)}
                  placeholder={field.placeholder || `${field.label} in ${activeLang}...`}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800 resize-none font-medium"
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  value={value}
                  onChange={(e) => onChange(activeLang, field.key, e.target.value)}
                  placeholder={field.placeholder || `${field.label} in ${activeLang}...`}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800 font-medium"
                />
              )}
            </div>
          );
        })}
      </div>

      {!isAllComplete && (
        <div className="p-3 bg-amber-50/60 border-t border-amber-100 flex items-center gap-2 text-[11px] text-amber-800">
          <FiAlertTriangle className="text-amber-600 shrink-0" size={14} />
          <span>
            {t('admin.incompleteTranslationsWarning', 'Ba’zi tillarda tarjimalar to‘ldirilmagan. Saqlash mumkin, ammo barcha tillar to‘ldirilsa xalqaro ko‘rinish to‘liq bo‘ladi.')}
          </span>
        </div>
      )}
    </div>
  );
}
