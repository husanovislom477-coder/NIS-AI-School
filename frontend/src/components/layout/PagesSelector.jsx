import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronDown, FiGrid, FiSearch, FiCheck, FiArrowRight } from 'react-icons/fi';
import { getPublicPages, getPageCategories } from '../../config/pagesConfig';
import { useLanguage } from '../../context/LanguageContext';

export default function PagesSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const publicPages = useMemo(() => getPublicPages(t), [t]);
  const pageCategories = useMemo(() => getPageCategories(t), [t]);
  const [activeCategory, setActiveCategory] = useState(pageCategories[0] || 'All');

  useEffect(() => {
    setActiveCategory(pageCategories[0] || 'All');
  }, [pageCategories]);

  // Filter pages
  const filteredPages = publicPages.filter((p) => {
    const isAll = activeCategory === pageCategories[0] || activeCategory === 'All' || activeCategory === 'Barchasi';
    const matchesCategory = isAll || p.category === activeCategory;
    const matchesSearch =
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.path.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
    setSearch('');
  }, [location.pathname]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < filteredPages.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : filteredPages.length - 1));
    } else if (e.key === 'Enter' && filteredPages[focusedIndex]) {
      e.preventDefault();
      navigate(filteredPages[focusedIndex].path);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef} onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={t('nav.pages', 'Pages')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
          isOpen
            ? 'text-school-700 bg-school-50 font-semibold'
            : 'text-slate-600 hover:text-school-600 hover:bg-slate-50'
        }`}
      >
        <FiGrid size={14} className={isOpen ? 'text-school-600' : 'text-slate-400'} />
        <span>{t('nav.pages', 'Pages')}</span>
        <FiChevronDown
          size={13}
          className={`transition-transform duration-200 text-slate-400 ${
            isOpen ? 'rotate-180 text-school-600' : ''
          }`}
        />
      </button>

      {/* Pages Modal Dialog Dropdown */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t('nav.pages', 'Pages')}
          className="absolute right-0 top-full mt-2 w-[420px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 z-50 animate-slide-up origin-top-right"
          style={{
            boxShadow: '0 20px 45px -10px rgba(15,23,42,0.18), 0 0 1px 1px rgba(15,23,42,0.06)',
          }}
        >
          {/* Search Header */}
          <div className="relative mb-2">
            <FiSearch
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFocusedIndex(0);
              }}
              placeholder={t('common.search', 'Search pages...')}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800 placeholder-slate-400 transition-all font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar">
            {pageCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setFocusedIndex(0);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-school-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Scrollable List of Pages */}
          <div className="max-h-[340px] overflow-y-auto space-y-1 py-1.5 pr-0.5 mt-1">
            {filteredPages.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {t('common.empty', 'No matching pages found.')}
              </div>
            ) : (
              filteredPages.map((page, idx) => {
                const Icon = page.icon;
                const isActive = location.pathname === page.path;
                const isFocused = idx === focusedIndex;

                return (
                  <button
                    key={page.path}
                    type="button"
                    onClick={() => {
                      navigate(page.path);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setFocusedIndex(idx)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-school-50 text-school-900 border border-school-200/70'
                        : isFocused
                        ? 'bg-slate-50 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                          isActive
                            ? 'bg-school-600 text-white'
                            : page.isPrimary
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-school-100 group-hover:text-school-700'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">
                            {page.label}
                          </span>
                          {page.badge && (
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full shrink-0 ${
                                page.isPrimary
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {page.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.2">
                          {page.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isActive ? (
                        <FiCheck size={14} className="text-school-600" />
                      ) : (
                        <FiArrowRight
                          size={13}
                          className="text-slate-300 group-hover:text-school-600 group-hover:translate-x-0.5 transition-all"
                        />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Quick Link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>NIS AI School</span>
            <button
              type="button"
              onClick={() => {
                navigate('/application');
                setIsOpen(false);
              }}
              className="text-school-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('nav.application', 'Apply Now')}</span>
              <FiArrowRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
