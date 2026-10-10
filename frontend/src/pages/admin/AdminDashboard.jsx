import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FiMapPin, FiUsers, FiAward, FiFileText, FiCalendar,
  FiUser, FiArrowRight, FiTrendingUp, FiCheckSquare,
  FiLayers, FiImage, FiActivity, FiSettings,
  FiRefreshCw, FiClock,
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [dateFilter, setDateFilter] = useState('all');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminAPI.getStats,
  });

  const { data: activitiesData } = useQuery({
    queryKey: ['admin-recent-activities'],
    queryFn: () => adminAPI.getActivities({ limit: 10 }),
  });

  const stats = data?.data?.data;
  const rawActivities = activitiesData?.data?.data || [];

  const recentActivities = useMemo(() => {
    if (dateFilter === 'all') return rawActivities;
    const now = new Date();
    return rawActivities.filter((act) => {
      const actDate = new Date(act.createdAt);
      if (dateFilter === 'today') {
        return actDate.toDateString() === now.toDateString();
      }
      if (dateFilter === 'week') {
        const diffDays = (now - actDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      if (dateFilter === 'month') {
        const diffDays = (now - actDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      return true;
    });
  }, [rawActivities, dateFilter]);

  const branches = stats?.branchBreakdown || [];
  const pending = stats?.pendingApproval || { total: 0, applications: 0, newsDrafts: 0, achievementsDrafts: 0 };
  const translations = stats?.translationIndicators || { itemsNeedingTranslation: 0, requiredLanguages: ['uz', 'en', 'ru'] };

  const statCards = stats ? [
    {
      icon: FiCheckSquare,
      label: 'Qabul Arizalari (Admissions)',
      value: stats.applications?.total || 0,
      sub: `${stats.applications?.new || 0} ta yangi ariza`,
      color: 'teal',
      badge: `${stats.applications?.accepted || 0} qabul`,
      to: '/admin/applications',
    },
    {
      icon: FiAward,
      label: 'Yutuqlar (Achievements)',
      value: stats.achievements || stats.students || 0,
      sub: 'Olimpiada, IELTS, SAT & Grantlar',
      color: 'amber',
      to: '/admin/achievements',
    },
    {
      icon: FiMapPin,
      label: 'Filiallar (Campuses)',
      value: stats.branches || 0,
      sub: 'Toshkent, Samarqand, Buxoro',
      color: 'blue',
      to: '/admin/branches',
    },
    {
      icon: FiUsers,
      label: "O'qituvchilar (Faculty)",
      value: stats.teachers || 0,
      sub: 'MIT, Stanford, ETH Zürich',
      color: 'purple',
      to: '/admin/teachers',
    },
    {
      icon: FiLayers,
      label: 'Loyihalar & Startaplar',
      value: stats.projects || 0,
      sub: 'AI, Dronlar & Robototexnika',
      color: 'indigo',
      to: '/admin/projects',
    },
    {
      icon: FiFileText,
      label: 'Yangiliklar (News)',
      value: stats.news?.total || 0,
      sub: `${stats.news?.published || 0} nashr etilgan`,
      color: 'emerald',
      to: '/admin/news',
    },
    {
      icon: FiCalendar,
      label: 'Tadbirlar (Events)',
      value: stats.events?.total || 0,
      sub: `${stats.events?.published || 0} ta faol tadbir`,
      color: 'rose',
      to: '/admin/events',
    },
    {
      icon: FiUser,
      label: 'Foydalanuvchilar (Users)',
      value: stats.users || 0,
      sub: "Ro'yxatdan o'tgan o'quvchilar",
      color: 'sky',
      to: '/admin/users',
    },
  ] : [];

  const gradientColors = {
    teal: 'from-teal-500 to-teal-700 text-teal-600 bg-teal-50',
    amber: 'from-amber-500 to-amber-700 text-amber-600 bg-amber-50',
    blue: 'from-blue-600 to-blue-800 text-blue-600 bg-blue-50',
    purple: 'from-purple-600 to-purple-800 text-purple-600 bg-purple-50',
    indigo: 'from-indigo-500 to-indigo-700 text-indigo-600 bg-indigo-50',
    emerald: 'from-emerald-500 to-emerald-700 text-emerald-600 bg-emerald-50',
    rose: 'from-rose-500 to-rose-700 text-rose-600 bg-rose-50',
    sky: 'from-sky-500 to-sky-700 text-sky-600 bg-sky-50',
  };

  // Pipeline calculations
  const totalApps = stats?.applications?.total || 1;
  const newCount = stats?.applications?.new || 0;
  const reviewingCount = stats?.applications?.reviewing || 0;
  const acceptedCount = stats?.applications?.accepted || 0;
  const rejectedCount = stats?.applications?.rejected || 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 rounded-3xl p-6 text-white shadow-elevation-2 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              Enterprise Dashboard
            </span>
            <span className="text-xs text-blue-200">NIS AI School CMS</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Xush kelibsiz, Admin!
          </h1>
          <p className="text-xs text-blue-100 max-w-xl mt-1 leading-relaxed">
            Maktabning barcha filiallari, o'qituvchilar tarkibi, o'quvchilar yutuqlari va qabul arizalari bo'yicha real-vaqt ma'lumotlar bazasi ko'rsatkichlari.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FiRefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>{isFetching ? 'Yangilanmoqda...' : 'Yangilash'}</span>
          </button>
          <Link
            to="/admin/applications"
            className="btn-primary text-xs py-2 px-3.5 shadow-sm bg-white text-blue-700 hover:bg-blue-50 font-bold"
          >
            <FiCheckSquare size={14} />
            <span>Arizalarni ko'rish</span>
          </Link>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Actionable Alerts & Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Content Awaiting Approval Card */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FiClock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-900 font-display">
                Tasdiqlash & Nashr Kutilayotgan Materiallar
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {pending.total > 0
                  ? `Jami ${pending.total} ta obyekt ma'muriy e'tiborni talab qilmoqda:`
                  : 'Hozirda barcha materiallar ko‘rib chiqilgan va tasdiqlangan.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Link
                  to="/admin/applications"
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {pending.applications} ta yangi ariza
                </Link>
                <Link
                  to="/admin/news"
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {pending.newsDrafts} ta qoralama yangilik
                </Link>
                <Link
                  to="/admin/achievements"
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  {pending.achievementsDrafts} ta tasdiqlanmagan yutuq
                </Link>
              </div>
            </div>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 shrink-0 mt-1"
          >
            <span>Ko'rish</span>
            <FiArrowRight size={12} />
          </Link>
        </div>

        {/* Translation Coverage Indicator Card */}
        <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FiLayers size={20} />
            </div>
            <div>
              <h4 className="font-bold text-xs text-indigo-900 font-display">
                Ko‘p Tillilik (i18n) Qamrovi
              </h4>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                {translations.itemsNeedingTranslation > 0
                  ? `${translations.itemsNeedingTranslation} ta obyektda ${translations.requiredLanguages.join(', ')} tillarida tarjima yetishmaydi.`
                  : 'Barcha asosiy tillar (UZ, EN, RU) to‘liq tarjima qilingan.'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-indigo-300 text-indigo-800">
                  Faol tillar: 10 ta
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-indigo-300 text-indigo-800">
                  Standart til: UZ
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/admin/languages"
            className="text-xs font-bold text-indigo-800 hover:text-indigo-900 flex items-center gap-1 shrink-0 mt-1"
          >
            <span>Tillar</span>
            <FiArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Grid of Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 animate-pulse bg-white border border-slate-200/80" />
          ))
        ) : (
          statCards.map((c) => {
            const Icon = c.icon;
            const style = gradientColors[c.color] || gradientColors.blue;
            return (
              <motion.div
                key={c.label}
                whileHover={{ y: -3 }}
                className="card p-5 bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium truncate">{c.label}</p>
                    <p className="text-2xl font-bold font-display text-slate-900 mt-1">{c.value}</p>
                    {c.sub && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{c.sub}</p>}
                  </div>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${style.split(' ')[2]}`}>
                    <Icon size={20} className={style.split(' ')[1]} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    to={c.to}
                    className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:gap-1.5 transition-all"
                  >
                    <span>Boshqarish</span>
                    <FiArrowRight size={12} />
                  </Link>
                  {c.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {c.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Interactive Charts & Real Branch Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admissions Funnel & Pipeline Chart */}
        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-display">
                Qabul Jarayoni Holati (Admissions Pipeline)
              </h3>
              <p className="text-xs text-slate-400">Jami kelib tushgan arizalar bosqichlar bo'yicha</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">
              {stats?.applications?.total || 0} ta ariza
            </span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Yangi (Ko'rib chiqilmagan)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {newCount} ta ({Math.round((newCount / totalApps) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, (newCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Suhbat bosqichida (Reviewing)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {reviewingCount} ta ({Math.round((reviewingCount / totalApps) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, (reviewingCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Qabul qilingan (Accepted)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {acceptedCount} ta ({Math.round((acceptedCount / totalApps) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, (acceptedCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Rad etilgan (Rejected)
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {rejectedCount} ta ({Math.round((rejectedCount / totalApps) * 100)}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, (rejectedCount / totalApps) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Har bir ariza shaxsiy ID (#NIS-XXXXXX) bilan himoyalangan</span>
            <Link to="/admin/applications" className="font-semibold text-blue-600 hover:underline">
              Barcha arizalarni saralash &gt;
            </Link>
          </div>
        </div>

        {/* Real Database Branches Summary */}
        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Filiallar Statistikasi
                </h3>
                <p className="text-xs text-slate-400">Ma'lumotlar bazasidagi real ko'rsatkichlar</p>
              </div>
              <FiMapPin className="text-blue-600" size={18} />
            </div>

            <div className="space-y-3 pt-1">
              {branches.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Filiallar bazada topilmadi.
                </div>
              ) : (
                branches.slice(0, 4).map((b) => (
                  <div key={b.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 text-xs truncate max-w-[180px]">{b.name}</p>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded-full shrink-0">
                        {b.teacherCount || 0} ustoz
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span className="truncate max-w-[150px]">{b.address || 'Amir Temur 108'}</span>
                      <span className="font-semibold text-slate-600">{b.achievementCount || 0} yutuq</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/admin/branches"
            className="mt-4 pt-3 border-t border-slate-100 font-semibold text-blue-600 hover:text-blue-700 text-xs flex items-center justify-between"
          >
            <span>Barcha filiallarni boshqarish</span>
            <FiArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recent Activities & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admin Activities Stream with Date Filters */}
        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FiActivity className="text-blue-600" size={18} />
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  So'nggi Ma'muriy Amallar (Activity Logs)
                </h3>
                <p className="text-xs text-slate-400">Tizimda bajarilgan amallar auditi</p>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px]">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'today', label: 'Bugun' },
                { id: 'week', label: '7 kun' },
                { id: 'month', label: '30 kun' },
              ].map((df) => (
                <button
                  key={df.id}
                  type="button"
                  onClick={() => setDateFilter(df.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    dateFilter === df.id
                      ? 'bg-white text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Tanlangan muddat bo'yicha faoliyat qaydlari mavjud emas.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
              {recentActivities.map((act) => (
                <div key={act.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {act.action?.[0] || 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{act.details || act.action}</p>
                      <p className="text-[11px] text-slate-400">
                        {act.userName || 'Admin'} • <span className="font-mono">{act.entity}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">Xavfsizlik maqsadida har bir ma'muriy amal audit qilinadi</span>
            <Link to="/admin/activities" className="font-semibold text-blue-600 hover:underline">
              Barcha jurnallarni ko'rish &gt;
            </Link>
          </div>
        </div>

        {/* Quick Operations Tiles */}
        <div className="card p-5 bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <FiTrendingUp className="text-blue-600" size={18} />
            <h3 className="font-bold text-slate-900 text-sm font-display">Tezkor Havolalar</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {[
              { to: '/admin/applications', label: 'Qabul Arizalari', icon: FiCheckSquare },
              { to: '/admin/achievements', label: 'Yutuqlar', icon: FiAward },
              { to: '/admin/branches', label: 'Filiallar', icon: FiMapPin },
              { to: '/admin/teachers', label: "O'qituvchilar", icon: FiUsers },
              { to: '/admin/projects', label: 'AI Loyihalar', icon: FiLayers },
              { to: '/admin/media', label: 'Media Galereya', icon: FiImage },
              { to: '/admin/news', label: 'Yangiliklar', icon: FiFileText },
              { to: '/admin/settings', label: 'Sozlamalar', icon: FiSettings },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.to}
                  className="p-3 rounded-xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/60 transition-all text-center flex flex-col items-center gap-1.5 group"
                >
                  <Icon size={18} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                  <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
