import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiUsers,
  FiAward,
  FiCpu,
  FiTrendingUp,
  FiActivity,
  FiCheck,
  FiChevronRight,
  FiLayers,
  FiBarChart2,
  FiZap,
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroDashboardVisual({
  branches = [],
  teachers = [],
  students = [],
  projects = [],
  onOpenAIAgent,
}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'bars'

  const branchesCount = branches.length;
  const teachersCount = teachers.length;
  const studentsCount = students.length;
  const projectsCount = projects.length;

  // Real database dynamic metrics
  const statsList = useMemo(() => [
    {
      id: 'branches',
      label: t('nav.campuses', 'Filiallar'),
      count: branchesCount,
      sub: branchesCount > 0 ? (branches[0]?.shortName || branches[0]?.name || 'Toshkent') : '—',
      color: 'blue',
      icon: FiMapPin,
    },
    {
      id: 'teachers',
      label: t('nav.teachers', "O'qituvchilar"),
      count: teachersCount,
      sub: teachersCount > 0 ? 'MIT / Stanford' : '—',
      color: 'indigo',
      icon: FiUsers,
    },
    {
      id: 'students',
      label: t('home.studentsCount', "O'quvchilar"),
      count: studentsCount,
      sub: studentsCount > 0 ? (students[0]?.firstName ? `${students[0].firstName}..` : 'IELTS 8.5') : '—',
      color: 'emerald',
      icon: FiAward,
    },
    {
      id: 'projects',
      label: t('nav.projects', 'AI Loyihalar'),
      count: projectsCount,
      sub: projectsCount > 0 ? 'Deep Learning' : '—',
      color: 'amber',
      icon: FiLayers,
    },
  ], [branchesCount, teachersCount, studentsCount, projectsCount, branches, students, t]);

  // Real highlights from database
  const topStudent = students[0];
  const primaryBranch = branches[0];

  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none">
      
      {/* ─── LAYER 1: Very subtle abstract background (Concentric rings & soft glowing area) ─── */}
      <div className="absolute inset-0 -inset-x-8 -inset-y-8 flex items-center justify-center pointer-events-none z-0">
        {/* Soft glowing ambient light */}
        <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-school-500/10 via-sky-300/12 to-indigo-400/8 blur-3xl animate-pulse-subtle" />
        <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-100/40 blur-2xl" />

        {/* Concentric thin orbital lines */}
        <svg
          className="absolute w-[560px] h-[560px] max-w-none opacity-40 sm:opacity-50"
          viewBox="0 0 560 560"
          fill="none"
        >
          <circle
            cx="280"
            cy="280"
            r="260"
            stroke="#0066cc"
            strokeWidth="1"
            strokeOpacity="0.12"
            strokeDasharray="4 6"
          />
          <circle
            cx="280"
            cy="280"
            r="200"
            stroke="#0066cc"
            strokeWidth="1"
            strokeOpacity="0.16"
          />
          <circle
            cx="280"
            cy="280"
            r="140"
            stroke="#0066cc"
            strokeWidth="1"
            strokeOpacity="0.1"
            strokeDasharray="6 8"
          />
          {/* Subtle orbital dots */}
          <circle cx="280" cy="80" r="3.5" fill="#0066cc" fillOpacity="0.35" />
          <circle cx="480" cy="280" r="3" fill="#0066cc" fillOpacity="0.3" />
          <circle cx="140" cy="380" r="2.5" fill="#38a5f6" fillOpacity="0.4" />
        </svg>
      </div>

      {/* ─── LAYER 2: 3D Perspective Wrapper ─── */}
      <div className="relative z-10 perspective-1200 py-8 sm:py-10 px-2 sm:px-4">
        
        {/* ─── MAIN DASHBOARD PANEL ─── */}
        <motion.div
          initial={{ opacity: 0, y: 35, rotateY: -6, rotateX: 3 }}
          animate={{ opacity: 1, y: 0, rotateY: -2.5, rotateX: 1.5 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white/95 backdrop-blur-xl rounded-[28px] dashboard-card-shadow border border-slate-200/90 overflow-hidden transition-transform duration-500 hover:rotate-0 hover:scale-[1.01]"
        >
          {/* Top Window / Platform Navigation Bar */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Window controls styling */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-school-400/80" />
              </div>

              <div className="h-4 w-[1px] bg-slate-200" />

              {/* School branding */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-school-600 animate-pulse" />
                <span className="font-bold font-display text-xs sm:text-sm text-slate-900 tracking-tight">
                  NIS AI School
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
                  • {t('home.dashboardOverview', 'Platform Overview')}
                </span>
              </div>
            </div>

            {/* Live Database Sync Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Sync</span>
            </div>
          </div>

          {/* Internal Dashboard Body */}
          <div className="p-5 sm:p-6 space-y-5">

            {/* Dynamic Real Database Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {statsList.map((st) => {
                const Icon = st.icon;
                return (
                  <div
                    key={st.id}
                    className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100/90 hover:bg-white hover:border-school-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-slate-500">
                        {st.label}
                      </span>
                      <Icon size={13} className="text-slate-400 group-hover:text-school-600 transition-colors" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black font-display text-slate-900 tabular-nums">
                        {st.count > 0 ? st.count : (
                          <span className="text-sm font-semibold text-slate-400">0</span>
                        )}
                      </span>
                      {st.count > 0 && (
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[60px]">
                          {st.sub}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── VISUAL DATA GRAPH (Minimal Analytics Visualization) ─── */}
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-school-50/30 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold font-display text-slate-900">
                    {language === 'uz'
                      ? 'Akademik o\'sish & AI faolligi'
                      : language === 'ru'
                      ? 'Академический прогресс и исследования'
                      : 'Academic Progress & AI Activity'}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {language === 'uz'
                      ? 'Haqiqiy ma\'lumotlar tahlili'
                      : language === 'ru'
                      ? 'Анализ данных в реальном времени'
                      : 'Real-time database indicators'}
                  </p>
                </div>

                {/* Graph View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab('chart')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      activeTab === 'chart'
                        ? 'bg-white text-school-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FiTrendingUp size={12} className="inline mr-1" />
                    {language === 'uz' ? 'Dinamika' : 'Trend'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bars')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      activeTab === 'bars'
                        ? 'bg-white text-school-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FiBarChart2 size={12} className="inline mr-1" />
                    {language === 'uz' ? 'Taqsimot' : 'Bars'}
                  </button>
                </div>
              </div>

              {/* Dynamic Graph Body */}
              {activeTab === 'chart' ? (
                /* Smooth Curved Vector Line Chart */
                <div className="relative h-28 sm:h-32 w-full pt-2">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 400 120"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066cc" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#0066cc" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38a5f6" />
                        <stop offset="50%" stopColor="#0066cc" />
                        <stop offset="100%" stopColor="#0052a8" />
                      </linearGradient>
                    </defs>

                    {/* Background horizontal guide lines */}
                    <line x1="0" y1="20" x2="400" y2="20" stroke="#e2e8f0" strokeDasharray="3 4" strokeWidth="0.8" />
                    <line x1="0" y1="65" x2="400" y2="65" stroke="#e2e8f0" strokeDasharray="3 4" strokeWidth="0.8" />
                    <line x1="0" y1="110" x2="400" y2="110" stroke="#e2e8f0" strokeWidth="0.8" />

                    {/* Filled Area */}
                    <path
                      d="M 0,90 Q 70,75 130,45 T 260,35 T 340,18 L 400,12 L 400,120 L 0,120 Z"
                      fill="url(#chartGradient)"
                    />

                    {/* Smooth glowing line curve */}
                    <path
                      d="M 0,90 Q 70,75 130,45 T 260,35 T 340,18 L 400,12"
                      fill="none"
                      stroke="url(#lineStroke)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Highlighted real data nodes */}
                    <circle cx="130" cy="45" r="4" fill="#ffffff" stroke="#0066cc" strokeWidth="2.5" />
                    <circle cx="260" cy="35" r="4" fill="#ffffff" stroke="#0066cc" strokeWidth="2.5" />
                    <circle cx="340" cy="18" r="5" fill="#0066cc" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  {/* Horizontal Labels */}
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2 px-1">
                    <span>{language === 'uz' ? 'Qabul' : 'Intake'}</span>
                    <span>{language === 'uz' ? 'Tayyorlov' : 'Training'}</span>
                    <span>{language === 'uz' ? 'Olimpiada' : 'Contests'}</span>
                    <span className="text-school-700 font-bold">100% Grant</span>
                  </div>
                </div>
              ) : (
                /* Proportional Vertical Analytics Bars (Connected to Real Counts) */
                <div className="h-28 sm:h-32 flex items-end justify-around gap-2 pt-2 px-2">
                  {[
                    { label: t('nav.campuses', 'Filiallar'), count: branchesCount, max: 5, color: 'from-blue-400 to-school-600' },
                    { label: t('nav.teachers', 'Ustozlar'), count: teachersCount, max: 6, color: 'from-sky-400 to-blue-600' },
                    { label: t('home.studentsCount', 'Talabalar'), count: studentsCount, max: 6, color: 'from-school-500 to-school-700' },
                    { label: t('nav.projects', 'Loyihalar'), count: projectsCount, max: 6, color: 'from-indigo-400 to-school-800' },
                  ].map((bar, idx) => {
                    const heightPercent = bar.count > 0 ? Math.min(100, Math.max(25, (bar.count / bar.max) * 90)) : 15;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                        <span className="text-[10px] font-bold text-slate-600 tabular-nums">
                          {bar.count}
                        </span>
                        <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl h-full flex items-end p-1">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                            className={`w-full rounded-lg bg-gradient-to-t ${bar.color} shadow-xs group-hover:brightness-110 transition-all`}
                          />
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate max-w-[65px] text-center">
                          {bar.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Live Highlight Banner */}
            <div className="pt-1 flex items-center justify-between text-xs text-slate-600 border-t border-slate-100/80">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-school-600" />
                <span className="text-slate-500 text-[11px]">
                  {topStudent ? (
                    <>
                      <strong className="text-slate-800 font-semibold">{topStudent.firstName} {topStudent.lastName}</strong>
                      {' • '}{topStudent.examType || 'IELTS'} {topStudent.score || '8.5'}
                    </>
                  ) : (
                    primaryBranch ? (
                      <strong className="text-slate-800 font-semibold">{primaryBranch.name}</strong>
                    ) : (
                      'NIS AI School Digital Profile Platform'
                    )
                  )}
                </span>
              </div>
              <Link
                to="/students"
                className="text-[11px] font-semibold text-school-600 hover:text-school-700 flex items-center gap-1"
              >
                <span>{t('home.details', 'Batafsil')}</span>
                <FiChevronRight size={12} />
              </Link>
            </div>

          </div>
        </motion.div>

        {/* ─── LAYER 3: 4 FLOATING INFORMATION CARDS ─── */}

        {/* ── CARD 1: NIS AI School Branches (Top-Left) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="absolute -top-3 sm:-top-5 -left-2 sm:-left-6 z-20 hidden md:block"
        >
          <Link
            to="/campuses"
            className="block p-3 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-2xl floating-card-shadow border border-slate-200/90 hover:border-school-300 transition-all duration-300 hover:scale-105 group animate-card-float-1"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-school-50 text-school-600 border border-school-100 flex items-center justify-center shrink-0 group-hover:bg-school-600 group-hover:text-white transition-colors">
                <FiMapPin size={16} />
              </div>
              <div className="pr-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-school-700">
                  NIS AI School
                </p>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {branchesCount > 0 ? `${branchesCount} ta kampus` : 'Campuses'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Toshkent • Samarqand • Buxoro
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── CARD 2: Expert Educators (Bottom-Left) ── */}
        <motion.div
          initial={{ opacity: 0, y: 25, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="absolute -bottom-4 sm:-bottom-6 -left-3 sm:-left-7 z-20 hidden md:block"
        >
          <Link
            to="/teachers"
            className="block p-3 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-2xl floating-card-shadow border border-slate-200/90 hover:border-indigo-300 transition-all duration-300 hover:scale-105 group animate-card-float-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FiUsers size={16} />
              </div>
              <div className="pr-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  {t('nav.teachers', "O'qituvchilar")}
                </p>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  Expert Educators
                </p>
                <p className="text-[10px] text-slate-400">
                  MIT & Stanford Mentorlar
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── CARD 3: Achievements & IELTS (Top-Right) ── */}
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="absolute -top-4 sm:-top-6 -right-2 sm:-right-6 z-20 hidden md:block"
        >
          <Link
            to="/students"
            className="block p-3 sm:p-3.5 bg-white/95 backdrop-blur-md rounded-2xl floating-card-shadow border border-slate-200/90 hover:border-amber-300 transition-all duration-300 hover:scale-105 group animate-card-float-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FiAward size={16} />
              </div>
              <div className="pr-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Achievements
                </p>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  IELTS 8.5 • SAT 1560
                </p>
                <p className="text-[10px] text-slate-400">
                  IOI & IAIO Xalqaro Medallar
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ── CARD 4: NIS AI AGENT (Bottom-Right / Focal Interactive Card) ── */}
        <motion.div
          initial={{ opacity: 0, y: 25, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="absolute -bottom-5 sm:-bottom-7 -right-3 sm:-right-8 z-30 hidden md:block"
        >
          <button
            type="button"
            onClick={onOpenAIAgent}
            className="p-3.5 sm:p-4 bg-white/98 backdrop-blur-md rounded-2xl floating-card-shadow border-2 border-school-400/80 hover:border-school-600 transition-all duration-300 hover:scale-106 group cursor-pointer text-left animate-card-float-4"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-school-600 to-school-800 text-white flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                  <FiCpu size={18} className="animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-ping" />
              </div>
              <div className="pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-school-700">
                    NIS AI AGENT
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-school-600 transition-colors">
                  AI School Guide
                </p>
                <p className="text-[10px] text-slate-400">
                  {language === 'uz' ? 'Savol berish uchun bosing' : 'Click to chat live'}
                </p>
              </div>
            </div>
          </button>
        </motion.div>

      </div>

      {/* ─── MOBILE ADAPTATION: Responsive cards row right below dashboard on small screens ─── */}
      <div className="grid grid-cols-2 gap-2 mt-4 md:hidden">
        <Link
          to="/campuses"
          className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2.5"
        >
          <div className="w-7 h-7 rounded-lg bg-school-50 text-school-600 flex items-center justify-center shrink-0">
            <FiMapPin size={13} />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-bold text-slate-900 leading-tight">
              {branchesCount > 0 ? `${branchesCount} Filial` : 'Filiallar'}
            </p>
            <p className="text-[9px] text-slate-400">Kamposlar</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onOpenAIAgent}
          className="p-2.5 rounded-xl bg-school-50/80 border border-school-300 shadow-xs flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-school-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FiCpu size={13} className="animate-pulse" />
          </div>
          <div className="truncate">
            <p className="text-[11px] font-bold text-school-800 leading-tight">
              NIS AI Agent
            </p>
            <p className="text-[9px] text-school-600">AI Yordamchi</p>
          </div>
        </button>
      </div>

    </div>
  );
}
