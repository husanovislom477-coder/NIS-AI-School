import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiInfo,
  FiMapPin,
  FiUsers,
  FiGrid,
  FiX,
  FiSearch,
  FiChevronRight,
  FiCheck,
} from 'react-icons/fi';
import { getPublicPages, getPageCategories } from '../../config/pagesConfig';
import { useLanguage } from '../../context/LanguageContext';

export default function MobileBottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const publicPages = useMemo(() => getPublicPages(t), [t]);
  const pageCategories = useMemo(() => getPageCategories(t), [t]);
  const [activeCategory, setActiveCategory] = useState(pageCategories[0] || 'All');

  useEffect(() => {
    setActiveCategory(pageCategories[0] || 'All');
  }, [pageCategories]);

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
    setSearch('');
  }, [location.pathname]);

  const navButtons = [
    { to: '/', label: t('nav.home', 'Home'), icon: FiHome },
    { to: '/about', label: t('nav.about', 'About'), icon: FiInfo },
    { to: '/campuses', label: t('nav.campuses', 'Campuses'), icon: FiMapPin },
    { to: '/teachers', label: t('nav.teachers', 'Teachers'), icon: FiUsers },
  ];

  const filteredPages = publicPages.filter((p) => {
    const isAll = activeCategory === pageCategories[0] || activeCategory === 'All' || activeCategory === 'Barchasi';
    const matchesCategory = isAll || p.category === activeCategory;
    const matchesSearch =
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Floating Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="xl:hidden fixed inset-x-2.5 sm:inset-x-4 max-w-md mx-auto z-40 rounded-[22px] bg-white/50 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 transition-all duration-300"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          backdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        <div className="grid grid-cols-5 h-15 max-w-md mx-auto px-1.5 py-1">
          {navButtons.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-school-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-school-50 text-school-600 scale-105' : ''
                  }`}
                >
                  <Icon size={19} />
                </div>
                <span className="text-[10px] tracking-tight">{label}</span>
              </NavLink>
            );
          })}

          {/* Pages Drawer Trigger */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              sheetOpen ||
              (!navButtons.some((b) => b.to === location.pathname) &&
                location.pathname !== '/')
                ? 'text-school-700 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-label={t('nav.pages', 'Pages')}
          >
            <div
              className={`p-1 rounded-xl transition-all ${
                sheetOpen ? 'bg-school-50 text-school-600 scale-105' : ''
              }`}
            >
              <FiGrid size={19} />
            </div>
            <span className="text-[10px] tracking-tight">{t('nav.pages', 'Pages')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Pages Bottom Sheet / Drawer */}
      {sheetOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          {/* Backdrop Click */}
          <div
            className="flex-1"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet Surface */}
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-slate-100 p-4 pb-8 animate-slide-up">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold font-display text-slate-900 text-base">
                  {t('nav.pages', 'All Pages')}
                </h3>
                <p className="text-xs text-slate-500">
                  NIS AI School
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                aria-label={t('common.close', 'Close')}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3 mb-2">
              <FiSearch
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search', 'Search pages...')}
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 py-1 overflow-x-auto no-scrollbar mb-2">
              {pageCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-school-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scrollable Page List */}
            <div className="overflow-y-auto space-y-1 flex-1 py-1 pr-1">
              {filteredPages.map((page) => {
                const Icon = page.icon;
                const isActive = location.pathname === page.path;

                return (
                  <button
                    key={page.path}
                    type="button"
                    onClick={() => {
                      navigate(page.path);
                      setSheetOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-colors ${
                      isActive
                        ? 'bg-school-50/90 text-school-900 border border-school-200 font-semibold'
                        : 'bg-slate-50/70 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-school-600 text-white'
                            : page.isPrimary
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-white text-slate-600 shadow-xs'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold leading-tight">
                            {page.label}
                          </span>
                          {page.badge && (
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full ${
                                page.isPrimary
                                  ? 'bg-emerald-200/70 text-emerald-800'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {page.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {page.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isActive ? (
                        <FiCheck size={16} className="text-school-600" />
                      ) : (
                        <FiChevronRight size={16} className="text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Direct CTA */}
            <div className="pt-3 mt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigate('/application');
                  setSheetOpen(false);
                }}
                className="btn-primary w-full justify-center py-2.5 text-xs font-semibold"
              >
                {t('nav.application', 'Apply Now')} →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
