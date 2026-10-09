import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  FiGrid, FiMapPin, FiUsers, FiAward, FiFileText,
  FiCalendar, FiUser, FiLogOut, FiMenu, FiX,
  FiChevronLeft, FiCheckSquare, FiGlobe,
} from 'react-icons/fi';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const adminNav = [
    { to: '/admin', label: t('admin.dashboard', 'Dashboard'), icon: FiGrid, exact: true },
    { to: '/admin/applications', label: t('admin.applications', 'Admissions'), icon: FiCheckSquare },
    { to: '/admin/branches', label: t('admin.branches', 'Campuses'), icon: FiMapPin },
    { to: '/admin/teachers', label: t('admin.teachers', 'Teachers'), icon: FiUsers },
    { to: '/admin/students', label: t('admin.results', 'Students & Results'), icon: FiAward },
    { to: '/admin/news', label: t('admin.news', 'News'), icon: FiFileText },
    { to: '/admin/events', label: t('admin.events', 'Events'), icon: FiCalendar },
    { to: '/admin/languages', label: t('admin.languages', 'Languages'), icon: FiGlobe },
    { to: '/admin/users', label: t('admin.users', 'Users'), icon: FiUser },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full bg-slate-900 text-white z-40 transition-all duration-300 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">NIS</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold font-display text-xs truncate">NIS AI School</p>
                <p className="text-xs text-slate-400 truncate">{t('admin.dashboard', 'Admin Panel')}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0 ml-auto"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <FiChevronLeft size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {adminNav.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5
                ${isActive
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-800 p-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <FiX size={14} />
              {sidebarOpen && t('admin.backToSite', 'Back to Site')}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-medium transition-colors"
              title={t('nav.logout', 'Log Out')}
            >
              <FiLogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center px-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="font-semibold text-slate-900 text-sm">{t('admin.dashboard', 'Admin Panel')}</h1>
              <p className="text-xs text-slate-400">NIS AI School Management System</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-blue text-xs">{user?.role?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
