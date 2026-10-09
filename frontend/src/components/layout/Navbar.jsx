import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu,
  FiX,
  FiSearch,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiShield,
  FiFileText,
  FiCheckSquare,
  FiSettings,
} from 'react-icons/fi';
import Button from '../ui/Button';
import PagesSelector from './PagesSelector';
import { useLanguage } from '../../context/LanguageContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const primaryNavItems = [
    { to: '/', label: t('nav.home', 'Bosh sahifa') },
    { to: '/about', label: t('nav.about', 'Maktab haqida') },
    { to: '/campuses', label: t('nav.campuses', 'Filiallar') },
    { to: '/teachers', label: t('nav.teachers', "O'qituvchilar") },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] max-w-7xl z-50 rounded-[20px] transition-all duration-300 ${
        isScrolled
          ? 'bg-white/96 backdrop-blur-xl py-2.5 border border-slate-200/80 shadow-elevation-2'
          : 'bg-white/90 backdrop-blur-md border border-slate-200/70 py-3.5 shadow-elevation-1'
      }`}
    >
      <div className="w-full px-3.5 sm:px-5 lg:px-7">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-school-500 rounded-xl"
            aria-label="NIS AI School Bosh sahifa"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center shadow-elevation-1 group-hover:shadow-glow group-hover:scale-105 transition-all duration-200">
              <span className="text-white font-black font-display text-sm tracking-wider">
                NIS
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold font-display text-slate-900 text-base leading-tight tracking-tight">
                  NIS AI School
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-school-600" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none tracking-normal">
                Digital Profile Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation: Home | About | Campuses | Teachers | Pages */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Asosiy menyu"
          >
            {primaryNavItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'text-school-700 bg-school-50 font-semibold'
                      : 'text-slate-600 hover:text-school-600 hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* Custom Accessible Pages Selector */}
            <PagesSelector />
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-school-600 bg-slate-50 hover:bg-school-50 border border-slate-200/80 rounded-xl transition-all duration-150"
              title={t('nav.search', 'Search')}
              aria-label={t('nav.search', 'Search')}
            >
              <FiSearch size={14} className="text-slate-400" />
              <span className="hidden sm:inline">{t('nav.search', 'Search')}</span>
            </button>

            {/* Application Direct Button */}
            <Link
              to="/application"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-school-50 text-school-700 hover:bg-school-100 border border-school-200 text-xs font-semibold transition-all shadow-xs"
            >
              <FiCheckSquare size={14} className="text-school-600" />
              <span>{t('nav.application', 'Apply Now')}</span>
            </Link>

            {/* User Profile / Authentication Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-school-600 to-school-800 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.firstName?.[0] || 'U'}
                  </div>
                  <span className="hidden md:inline text-xs font-semibold text-slate-800">
                    {user.firstName}
                  </span>
                  <FiChevronDown
                    size={13}
                    className={`text-slate-400 transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-100 py-2 z-50 animate-slide-up"
                    style={{ boxShadow: '0 16px 48px -8px rgba(15,23,42,0.16), 0 4px 16px rgba(0,0,0,0.06)' }}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-semibold text-slate-900 text-xs">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-school-50 hover:text-school-700 transition-colors"
                    >
                      <FiUser size={14} /> {t('nav.profile', 'Shaxsiy profilim')}
                    </Link>
                    <Link
                      to="/profile"
                      state={{ defaultTab: 'applications' }}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-school-50 hover:text-school-700 transition-colors"
                    >
                      <FiFileText size={14} /> {t('nav.myApplications', 'Mening arizalarim')}
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-school-50 hover:text-school-700 transition-colors"
                    >
                      <FiSettings size={14} /> {t('nav.settings', 'Sozlamalar')}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-school-700 bg-school-50/70 hover:bg-school-50 font-medium transition-colors"
                      >
                        <FiShield size={14} /> {t('adminPanel', 'Admin boshqaruvi')}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        navigate('/login', { replace: true });
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <FiLogOut size={14} /> {t('logout', 'Tizimdan chiqish')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className="text-xs py-1.5 px-3"
                >
                  {t('login', 'Kirish')}
                </Button>
                <Button
                  to="/register"
                  variant="primary"
                  size="sm"
                  className="hidden sm:inline-flex text-xs py-1.5 px-3"
                >
                  {t('register', "Ro'yxatdan o'tish")}
                </Button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-school-600 hover:bg-slate-100 transition-colors"
              aria-label="Menyu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Accessible from top hamburger) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-md border-t border-slate-100 rounded-b-[18px] shadow-xl py-3 px-4 animate-slide-up">
          <div className="flex flex-col gap-1">
            {primaryNavItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-school-700 bg-school-50 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/application"
              className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 flex items-center justify-between"
            >
              <span>{t('applyNow', 'Ariza topshirish portali')}</span>
              <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full">2026-2027</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
