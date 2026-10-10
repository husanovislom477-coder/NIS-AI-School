import { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSelector({ variant = 'default', className = '' }) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeLang = languages.find(
    (l) => (l.code || '').toLowerCase() === (language || '').toLowerCase()
  ) || {
    code: language,
    flag: '🌐',
    label: (language || 'EN').toUpperCase(),
    nativeName: (language || 'EN').toUpperCase(),
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors border border-slate-200"
          aria-label={t('settings.language', 'Language')}
        >
          <span className="text-sm">{activeLang.flag || '🌐'}</span>
          <span className="uppercase text-[11px] font-bold">{activeLang.code}</span>
          <FiChevronDown size={11} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-slide-up">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 mb-1">
              {t('settings.language', 'Tilni tanlang')}
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {languages.map((l) => {
                const isSelected = (l.code || '').toLowerCase() === (language || '').toLowerCase();
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelect(l.code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{l.flag || '🌐'}</span>
                      <span className="truncate">{l.nativeName || l.label || l.name}</span>
                    </div>
                    {isSelected && <FiCheck size={12} className="text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default Navbar / Topbar button
  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
        aria-label={t('settings.language', 'Tilni tanlash')}
      >
        <span className="text-sm">{activeLang.flag || '🌐'}</span>
        <span className="uppercase text-[11px] font-bold tracking-wider">{activeLang.code}</span>
        <FiChevronDown
          size={12}
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up origin-top-right"
          style={{
            boxShadow: '0 16px 40px -10px rgba(15,23,42,0.18), 0 0 1px 1px rgba(15,23,42,0.06)',
          }}
        >
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between mb-1">
            <span>{t('settings.language', 'Tilni tanlang')}</span>
            <FiGlobe size={11} className="text-slate-400" />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5 px-1">
            {languages.map((l) => {
              const isSelected = (l.code || '').toLowerCase() === (language || '').toLowerCase();
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelect(l.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{l.flag || '🌐'}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{l.nativeName || l.label || l.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{l.code}</p>
                    </div>
                  </div>
                  {isSelected && <FiCheck size={14} className="text-blue-600 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
