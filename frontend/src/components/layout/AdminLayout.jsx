import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';
import {
  FiGrid, FiMapPin, FiUsers, FiAward, FiFileText,
  FiCalendar, FiUser, FiLogOut, FiMenu, FiX,
  FiChevronLeft, FiCheckSquare, FiGlobe, FiLayers,
  FiImage, FiActivity, FiSettings, FiExternalLink
} from 'react-icons/fi';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const adminNav = [
    { to: '/admin', label: t('admin.dashboard', 'Dashboard'), icon: FiGrid, exact: true },
    { to: '/admin/applications', label: t('admin.applications', 'Admissions'), icon: FiCheckSquare },
    { to: '/admin/branches', label: t('admin.branches', 'Campuses'), icon: FiMapPin },
    { to: '/admin/teachers', label: t('admin.teachers', 'Faculty & Mentors'), icon: FiUsers },
    { to: '/admin/achievements', label: t('nav.achievements', 'Achievements'), icon: FiAward },
    { to: '/admin/projects', label: t('nav.projects', 'Projects & Startups'), icon: FiLayers },
    { to: '/admin/news', label: t('admin.news', 'News & Press'), icon: FiFileText },
    { to: '/admin/events', label: t('admin.events', 'Events'), icon: FiCalendar },
    { to: '/admin/media', label: t('admin.media', 'Media Library'), icon: FiImage },
    { to: '/admin/users', label: t('admin.users', 'Users & Roles'), icon: FiUser },
    { to: '/admin/activities', label: t('admin.activities', 'Activity Logs'), icon: FiActivity },
    { to: '/admin/languages', label: t('admin.languages', 'Languages'), icon: FiGlobe },
    { to: '/admin/settings', label: t('nav.settings', 'Settings'), icon: FiSettings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-slate-900 text-white z-50 transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-16'}
        ${mobileDrawerOpen ? 'translate-x-0 !w-64' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {(sidebarOpen || mobileDrawerOpen) && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-bold text-xs tracking-wider">NIS</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold font-display text-xs truncate">NIS AI School</p>
                <p className="text-[10px] text-blue-400 font-medium truncate uppercase tracking-wider">Management</p>
              </div>
            </div>
          )}
          {/* Close mobile drawer or toggle desktop sidebar */}
          <button
            onClick={() => {
              if (mobileDrawerOpen) setMobileDrawerOpen(false);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex-shrink-0 ml-auto cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {mobileDrawerOpen ? <FiX size={18} /> : sidebarOpen ? <FiChevronLeft size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-3 overflow-y-auto no-scrollbar space-y-0.5">
          {adminNav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setMobileDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 mx-2 rounded-xl text-xs font-medium transition-all duration-200
                ${isActive
                  ? 'bg-blue-600 text-white shadow-glow font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }
              title={!sidebarOpen && !mobileDrawerOpen ? label : ''}
            >
              <Icon size={17} className="flex-shrink-0" />
              {(sidebarOpen || mobileDrawerOpen) && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-800 p-3 bg-slate-900/80">
          {(sidebarOpen || mobileDrawerOpen) && (
            <div className="flex items-center gap-2.5 mb-2.5 px-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white shadow-sm">
                {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'D'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <div className="flex gap-1.5">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
              title="Saytga o'tish"
            >
              <FiExternalLink size={13} />
              {(sidebarOpen || mobileDrawerOpen) && <span>{t('admin.backToSite', 'Saytga o‘tish')}</span>}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-medium transition-colors cursor-pointer"
              title={t('nav.logout', 'Log Out')}
            >
              <FiLogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ml-0 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 shadow-xs">
          <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Mobile drawer hamburger */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Open Admin Menu"
              >
                <FiMenu size={20} />
              </button>

              <div className="min-w-0">
                <h2 className="font-bold font-display text-slate-900 text-xs sm:text-sm leading-tight truncate">
                  {adminNav.find((n) => n.to === location.pathname)?.label || 'Boshqaruv Paneli'}
                </h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">NIS AI School Enterprise Management</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Multilingual Selector */}
              <LanguageSelector variant="compact" />

              {/* Live status badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live DB
              </span>

              {/* Admin Role Tag */}
              <span className="badge-blue text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                {user?.role?.toUpperCase() || 'ADMIN'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3.5 sm:p-6 max-w-7xl mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
