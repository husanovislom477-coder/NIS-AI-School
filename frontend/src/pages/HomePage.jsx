import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { branchAPI, teacherAPI, studentAPI, projectAPI, newsAPI } from '../api';
import {
  FiArrowRight, FiAward, FiUsers, FiMapPin, FiBookOpen,
  FiStar, FiCalendar, FiCheck, FiChevronRight, FiChevronDown, FiZap, FiGlobe, FiCpu,
} from 'react-icons/fi';
import HeroBackground from '../components/home/HeroBackground';
import HeroDashboardVisual from '../components/home/HeroDashboardVisual';
import AIAgentChatDrawer from '../components/home/AIAgentChatDrawer';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import CircularCarousel from '../components/home/CircularCarousel';
import SchoolGallerySwiper from '../components/home/SchoolGallerySwiper';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';

// ─── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(target.replace(/[^0-9]/g, ''), 10);
    let start = 0;
    const steps = 60;
    const step = num / steps;
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 18);
    return () => clearInterval(timer);
  }, [inView, target]);

  const prefix = target.includes('+') ? '' : '';
  const hasPlusSign = target.includes('+');

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{hasPlusSign ? '+' : ''}{suffix}
    </span>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color, index }) {
  const colors = {
    blue:    'bg-blue-600 text-white',
    purple:  'bg-purple-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber:   'bg-amber-600 text-white',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="card p-3.5 sm:p-5 flex items-center gap-3.5 sm:gap-4 cursor-default group"
    >
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${colors[color]} flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xl sm:text-2xl font-bold font-display text-slate-900 leading-none">
          <Counter target={value} />
        </p>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 truncate">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Teacher card with Expand Animation (Compact Horizontal Layout on Responsive Screens) ───────
function TeacherCard({ teacher, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card overflow-hidden group hover-lift flex flex-row lg:flex-col transition-all duration-300 h-full"
    >
      <div className="relative w-28 xs:w-32 sm:w-40 lg:w-full shrink-0 min-h-[140px] lg:h-52 overflow-hidden bg-slate-100">
        <img
          src={getImageUrl(teacher.photo) || `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=0066cc&color=fff&size=240`}
          alt={`${teacher.firstName} ${teacher.lastName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=0066cc&color=fff&size=240`; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {teacher.branch && (
          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
            <span className="badge-blue text-[10px] sm:text-[11px] backdrop-blur-sm bg-white/90">
              {teacher.branch}
            </span>
          </div>
        )}
      </div>

      <div className="p-3 xs:p-3.5 sm:p-4 lg:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-bold text-slate-900 font-display text-xs sm:text-sm lg:text-base leading-tight truncate">
            {teacher.firstName} {teacher.lastName}
          </h3>
          <p className="text-xs sm:text-sm text-blue-600 font-medium mt-0.5 truncate">{teacher.subject}</p>

          <div className="flex items-center gap-1.5 mt-2 sm:mt-2.5 flex-wrap">
            {teacher.education && (
              <span className="badge-blue text-[10px] sm:text-[11px]">{teacher.education}</span>
            )}
            {teacher.experience > 0 && (
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">{teacher.experience}+ {t('home.yearsExperience', 'yil tajriba')}</span>
            )}
          </div>
        </div>

        {/* Expand Trigger Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-school-600 hover:text-school-800 transition-colors w-full cursor-pointer"
        >
          <span>{isExpanded ? t('home.closeDetails', "Ma'lumotlarni yopish") : t('home.viewDetails', "To'liq ko'rsatkichlar")}</span>
          <FiChevronDown
            size={14}
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Expandable Details Drawer */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-2 pt-2 border-t border-slate-100/80 space-y-1.5 text-[11px] sm:text-xs text-slate-600"
            >
              {teacher.branch && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('home.branchLabel', 'Filial:')}</span>
                  <span className="font-semibold text-slate-800">{teacher.branch}</span>
                </div>
              )}
              {teacher.ielts && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('home.ieltsScore', 'IELTS darajasi:')}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {teacher.ielts}
                  </span>
                </div>
              )}
              {teacher.age && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{t('home.age', 'Yoshi:')}</span>
                  <span className="font-medium text-slate-700">{teacher.age} {t('home.yearsOld', 'yosh')}</span>
                </div>
              )}
              {teacher.certificates && (
                <div className="pt-0.5">
                  <span className="text-slate-400 block mb-0.5">{t('home.certificates', 'Sertifikatlar:')}</span>
                  <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium">
                    {Array.isArray(teacher.certificates) ? teacher.certificates.join(', ') : teacher.certificates}
                  </span>
                </div>
              )}
              {teacher.results && (
                <div className="pt-0.5">
                  <span className="text-slate-400 block mb-0.5">{t('home.resultsAndAwards', 'Natijalar & Yutuqlar:')}</span>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 italic">
                    {Array.isArray(teacher.results) ? teacher.results.join(' • ') : teacher.results}
                  </p>
                </div>
              )}
              <Link
                to={`/teachers/${teacher._id}`}
                className="mt-2 text-school-600 font-bold flex items-center gap-1 hover:gap-2 transition-all block pt-1.5"
              >
                {t('home.viewTeacherProfile', "Ustoz profiliga o'tish")} <FiChevronRight size={13} />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── News card (Compact Horizontal Layout on Responsive Screens) ─────────────────
function NewsCard({ news, index }) {
  const { t, language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="card overflow-hidden group hover-lift flex flex-row md:flex-col h-full"
    >
      <div className="relative w-28 xs:w-32 sm:w-40 md:w-full shrink-0 min-h-[110px] md:h-48 overflow-hidden bg-slate-100">
        {news.coverImage ? (
          <img src={getImageUrl(news.coverImage)} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <FiBookOpen size={32} className="text-blue-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
          <span className="badge-blue text-[10px] sm:text-[11px] capitalize backdrop-blur-sm">{news.category}</span>
        </div>
      </div>
      <div className="p-3 xs:p-3.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mb-1.5">
            <FiCalendar size={11} />
            {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uz-UZ') : ''}
          </div>
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
            {news.title}
          </h3>
          {news.shortDescription && (
            <p className="hidden sm:block text-xs sm:text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{news.shortDescription}</p>
          )}
        </div>
        <Link to={`/news/${news.slug || news._id || news.id}`} className="mt-3 flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-medium hover:gap-2 transition-all duration-200 self-start">
          {t('home.read', "O'qish")} <FiChevronRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, language } = useLanguage();
  const [isAIAgentOpen, setIsAIAgentOpen] = useState(false);

  // Real backend queries
  const { data: branchesRes } = useQuery({ queryKey: ['branches'], queryFn: () => branchAPI.getAll({ limit: 10 }) });
  const { data: teachersRes } = useQuery({ queryKey: ['teachers-home'], queryFn: () => teacherAPI.getAll({ limit: 10 }) });
  const { data: studentsRes } = useQuery({ queryKey: ['students-home'], queryFn: () => studentAPI.getAll({ limit: 10 }) });
  const { data: projectsRes } = useQuery({ queryKey: ['projects-home'], queryFn: () => projectAPI.getAll({ limit: 10 }) });
  const { data: newsRes } = useQuery({ queryKey: ['news-home'], queryFn: () => newsAPI.getAll({ limit: 12 }) });

  const branches = branchesRes?.data?.data || [];
  const teachers = teachersRes?.data?.data || [];
  const students = studentsRes?.data?.data || [];
  const projects = projectsRes?.data?.data || [];
  const newsList = newsRes?.data?.data || [];

  // Random 5-6 news items on visit
  const randomNews = useMemo(() => {
    if (!newsList || newsList.length === 0) return [];
    const shuffled = [...newsList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  }, [newsList]);

  // 2 Main Campuses
  const mainCampuses = branches.slice(0, 2);

  const stats = [
    { icon: FiUsers,   value: String(students.length || 0), label: t('home.activeStudents', "Faol o'quvchilar"), color: 'blue' },
    { icon: FiMapPin,  value: String(branches.length || 0), label: t('home.cityCampuses', 'Shahar filiali'),   color: 'purple' },
    { icon: FiAward,   value: String(teachers.length || 0), label: t('home.teachersSectionTitle', "Tajribali O'qituvchilar"), color: 'emerald' },
    { icon: FiGlobe,   value: String(newsList.length || 0), label: t('nav.news', "Yangiliklar"), color: 'amber' },
  ];

  const heroFeatures = [
    t('home.grantFeature', '100% grant'),
    t('home.certFeature', 'Xalqaro sertifikat'),
    t('home.mentorFeature', 'Shaxsiy mentor'),
    t('home.gpuFeature', 'GPU klaster'),
  ];

  return (
    <div className="relative overflow-x-hidden">

      {/* ─── HERO: 2-COLUMN MODERN SAAS PRESENTATION ─────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-white pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 lg:pb-24">
        {/* Layer 1 to 4: Video, Canvas Fallback, Ambient Orbs & Restored Edge Rectangles */}
        <HeroBackground />

        <div className="container-custom relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 items-center">

            {/* Left Column: Hero Text & CTAs (approx. 50% width on Desktop) */}
            <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-6 shadow-elevation-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  {t('home.heroBadge', "O'zbekistondagi №1 AI Maktabi")}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12 }}
                className="text-4xl sm:text-5xl xl:text-6xl font-black font-display text-slate-900 leading-[1.08] mb-5 tracking-tight"
              >
                {t('home.heroTitleLead', 'Kelajakni')}{' '}
                <span className="text-gradient">{t('home.heroTitleHighlight', "Sun'iy Intellekt")}</span>
                {' '}{t('home.heroTitleTrail', 'Bilan Qur')}
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.22 }}
                className="text-base sm:text-lg text-slate-500 max-w-xl mb-8 leading-relaxed"
              >
                {t('home.heroSubtitle', "IOI, IAIO, IELTS, SAT va top xalqaro universitetlar (MIT, Stanford, ETH Zürich) uchun professional tayyorlov. 3 shahar, 1080+ o'quvchi, 47 xalqaro medal.")}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="flex flex-col sm:flex-row items-center gap-3.5 mb-8 w-full sm:w-auto"
              >
                <Link to="/application" className="btn-primary text-sm sm:text-base px-8 py-3.5 shadow-glow w-full sm:w-auto justify-center">
                  {t('home.applyNowBtn', 'Ariza Topshirish')} <FiArrowRight />
                </Link>
                <Link to="/campuses" className="btn-outline text-sm sm:text-base px-7 py-3.5 w-full sm:w-auto justify-center">
                  {t('home.viewBranches', 'Filiallarimiz')}
                </Link>
              </motion.div>

              {/* Feature checks */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-5"
              >
                {heroFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-600">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <FiCheck size={10} className="text-white" />
                    </div>
                    {f}
                  </div>
                ))}
              </motion.div>

              {/* Mini stats row (Desktop) */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="hidden lg:flex items-center gap-8 mt-10 pt-6 border-t border-slate-100"
              >
                {[
                  { v: String(students.length || 0), l: t('home.studentsCount', "O'quvchi") },
                  { v: String(branches.length || 0), l: t('home.branchesCount', 'Filial') },
                  { v: String(teachers.length || 0), l: t('home.teachersSectionTitle', "O'qituvchi") },
                  { v: String(projects.length || 0), l: t('nav.projects', "Loyiha") },
                ].map(({ v, l }) => (
                  <div key={l} className="text-left">
                    <p className="text-2xl font-black font-display text-blue-600 tabular-nums">{v}</p>
                    <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </motion.div>

            </div>

            {/* Right Column: Premium Dashboard Visual (approx. 50% width on Desktop) */}
            <div className="lg:col-span-6 xl:col-span-6 w-full flex justify-center">
              <HeroDashboardVisual
                branches={branches}
                teachers={teachers}
                students={students}
                projects={projects}
                onOpenAIAgent={() => window.dispatchEvent(new CustomEvent('nis:open-ai-agent'))}
              />
            </div>

          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2 }}
          className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-slate-300 pointer-events-none"
        >
          <div className="w-5 h-8 border-2 border-slate-300 rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-2 bg-blue-500 rounded-full animate-bounce" />
          </div>
        </motion.div>
      </section>


      {/* ─── STATS ─────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white section-divider">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ─── 2-SECTION: CIRCULAR IMAGE CAROUSEL (REACT BITS) ─ */}
      <CircularCarousel />

      {/* ─── 3-SECTION: TEACHERS (VIDEO BACKGROUND) ────────── */}
      <section className="py-16 sm:py-20 relative overflow-hidden bg-white">
        <SectionVideoBackground
          category="teachers"
          opacity="opacity-14"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom relative z-10">
          <div className="flex items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <span className="badge-blue mb-2.5 sm:mb-3">{t('home.teamBadge', 'Jamoamiz')}</span>
              <h2 className="section-heading">{t('home.teachersSectionTitle', "Tajribali O'qituvchilar")}</h2>
              <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-sm">{t('home.mitGrads', 'MIT, Stanford, ETH Zürich bitiruvchilari')}</p>
            </div>
            <Link to="/teachers" className="btn-outline hidden sm:flex flex-shrink-0">
              {t('home.viewAll', 'Barchasi')} <FiArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {teachers.length > 0
              ? teachers.map((tItem, i) => <TeacherCard key={tItem._id || tItem.id} teacher={tItem} index={i} />)
              : Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="card p-4 animate-pulse">
                    <div className="h-52 bg-slate-200 rounded-xl mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))
            }
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Link to="/teachers" className="btn-primary">{t('home.viewAllTeachers', "Barcha o'qituvchilar")}</Link>
          </div>
        </div>
      </section>

      {/* ─── 4-SECTION: ACHIEVEMENTS (ANIMATION BACKGROUND) ── */}
      {students.length > 0 && (
        <section className="py-16 sm:py-20 relative overflow-hidden">
          {/* Rich blue base background with animated shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800" />
          <SectionAnimatedBackground variant="shimmer" theme="blue" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-800/40 rounded-full blur-3xl pointer-events-none" />

          <div className="container-custom relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-12"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs sm:text-sm font-semibold mb-3 backdrop-blur-sm border border-white/20">
                <FiAward size={14} className="text-yellow-300" /> {t('home.achievementsBadge', 'Yutuqlar')}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white">{t('home.schoolPride', 'Maktabimiz Faxrlari')}</h2>
              <p className="text-blue-200 mt-2 text-xs sm:text-sm max-w-xl mx-auto">{t('home.olympiadWinners', "IOI, IAIO, xalqaro olimpiadalar g'oliblari")}</p>
            </motion.div>

            {/* Compact Horizontal Pride Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
              {students.slice(0, 3).map((s, i) => (
                <motion.div
                  key={s._id || s.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 sm:p-5 border border-white/15 hover:bg-white/18 transition-all duration-300 hover:-translate-y-1 flex flex-row items-center gap-3.5 sm:gap-4"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
                >
                  <img
                    src={getImageUrl(s.photo) || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=ffffff&color=2563eb&size=100`}
                    alt={s.firstName}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/40 shadow-sm shrink-0"
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=ffffff&color=2563eb&size=100`; }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-xs sm:text-sm md:text-base truncate">{s.firstName} {s.lastName}</h3>
                    <p className="text-[11px] sm:text-xs text-blue-200 truncate">{s.grade}</p>
                    {s.awards?.slice(0, 1).map((a, j) => (
                      <div key={j} className="flex items-center gap-1.5 mt-1">
                        <FiAward size={12} className="text-yellow-300 shrink-0" />
                        <p className="text-[11px] sm:text-xs text-blue-100 truncate">{a.title}</p>
                      </div>
                    ))}
                    {s.results?.slice(0, 1).map((r, j) => (
                      <div key={j} className="mt-1.5">
                        <span className="text-[10px] sm:text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white inline-block">
                          {r.type}: {r.score}
                        </span>
                      </div>
                    ))}
                    <Link to={`/students/${s._id || s.id}`} className="mt-2 flex items-center gap-1 text-[11px] sm:text-xs font-medium text-white/80 hover:text-white transition-colors">
                      {t('home.details', 'Batafsil')} <FiChevronRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-10">
              <Link to="/students" className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-white text-blue-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-glow-lg hover:-translate-y-0.5">
                {t('home.allStudents', 'Barcha Talabalar')} <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 5-SECTION: BRANCHES (VIDEO BACKGROUND) ────────── */}
      {branches.length > 0 && (
        <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
          <SectionVideoBackground
            videoUrl="https://assets.mixkit.co/videos/preview/mixkit-modern-architecture-of-a-building-low-angle-shot-44171-large.mp4"
            opacity="opacity-12"
            overlayGradient="from-white/94 via-white/84 to-white/96"
          />
          <div className="container-custom relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="badge-blue mb-2.5 sm:mb-3">{t('home.branchesCount', 'Filiallar')}</span>
              <h2 className="section-heading">{t('home.branchesSectionTitle', 'Bizning Filiallar')}</h2>
              <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-sm">
                {t('home.branchesSectionSubtitle', "3 shahar, 1 maqsad — zamonaviy AI laboratoriyalari va xalqaro standartdagi infratuzilma")}
              </p>
            </div>

            {/* 2 Main Campus Cards (Compact Horizontal on Responsive Screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {mainCampuses.map((b, i) => (
                <motion.div
                  key={b._id || b.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card overflow-hidden group hover-lift flex flex-row md:flex-col"
                >
                  <div className="relative w-32 xs:w-36 sm:w-48 md:w-full shrink-0 min-h-[140px] md:h-56 bg-slate-100 overflow-hidden">
                    {b.coverImage || b.image ? (
                      <img
                        src={getImageUrl(b.coverImage || b.image)}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                        <FiMapPin size={40} className="text-blue-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
                      <span className="badge-blue backdrop-blur-sm bg-white/90 text-[10px] sm:text-xs font-semibold">
                        {t('home.mainCampus', 'Asosiy Filial')}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 xs:p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-bold text-slate-900 font-display text-sm sm:text-lg md:text-xl truncate">{b.shortName || b.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-slate-500 truncate">
                        <FiMapPin size={13} className="text-blue-500 shrink-0" /> {b.location || b.address}
                      </div>
                      <div className="flex gap-4 sm:gap-6 mt-2.5 sm:mt-4 pt-2.5 sm:pt-4 border-t border-slate-100 flex-wrap">
                        <div>
                          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 font-display">{b.studentCount}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{t('home.studentsCount', "O'quvchi")}</p>
                        </div>
                        <div>
                          <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 font-display">{b.teacherCount}</p>
                          <p className="text-[10px] sm:text-xs text-slate-400">{t('home.teachersLabel', "O'qituvchi")}</p>
                        </div>
                        {b.established && (
                          <div>
                            <p className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 font-display">{b.established}</p>
                            <p className="text-[10px] sm:text-xs text-slate-400">{t('home.foundedLabel', 'Tashkil yili')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/branches/${b._id || b.id}`}
                      className="mt-3 sm:mt-5 flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:gap-2 transition-all self-start"
                    >
                      {t('home.aboutCampus', 'Filial haqida batafsil')} <FiChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Barchasini ko'rish Button */}
            <div className="text-center mt-12">
              <Link
                to="/campuses"
                className="btn-outline px-9 py-3.5 text-sm font-semibold inline-flex items-center gap-2 shadow-xs hover:shadow-sm"
              >
                {t('home.viewAll', "Barchasini ko'rish")} <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 5.5-SECTION: SCHOOL GALLERY SWIPER SLIDER (SWIPER STUDIO INSPIRED) ─── */}
      <SchoolGallerySwiper />

      {/* ─── 6-SECTION: NEWS (ANIMATION BACKGROUND) ────────── */}
      {randomNews.length > 0 && (
        <section className="py-20 bg-slate-50/70 relative overflow-hidden">
          <SectionAnimatedBackground variant="waves" />
          <div className="container-custom relative z-10">
            <div className="flex items-end justify-between mb-12 gap-4">
              <div>
                <span className="badge-blue mb-3">{t('home.latestNews', "So'nggi yangiliklar")}</span>
                <h2 className="section-heading">{t('home.schoolNews', 'Maktab Yangiliklari')}</h2>
                <p className="text-slate-500 mt-2">{t('home.newsSubtitle', "Eng so'nggi tadbirlar, yutuqlar va e'lonlar")}</p>
              </div>
              <Link to="/news" className="btn-outline hidden sm:flex flex-shrink-0">
                {t('home.viewAllNews', 'Barcha yangiliklar')} <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {randomNews.map((n, i) => (
                <NewsCard key={n._id || n.id} news={n} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 7-SECTION: CTA (VIDEO BACKGROUND) ─────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-15"
          overlayGradient="from-white/92 via-white/82 to-white/94"
        />

        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <span className="badge-blue mb-4">{t('home.admissionsOpen', 'Qabul ochiq')}</span>
            <h2 className="text-4xl md:text-5xl font-black font-display text-slate-900 mb-6 tracking-tight">
              {t('home.ctaTitleLead', 'Kelajagingizni')}{' '}
              <span className="text-gradient">{t('home.ctaTitleHighlight', 'Bugun')}</span>{' '}
              {t('home.ctaTitleTrail', 'Boshlang')}
            </h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              {t('home.ctaDescription', "100% prezident granti bilan. Barcha xarajatlar qoplanadi. Faqat 240 o'rin.")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5 mb-10">
              {heroFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FiCheck size={15} className="text-blue-600 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>

            <Link to="/application" className="btn-primary text-base px-12 py-4 shadow-glow-lg">
              {t('home.applyNowBtn', 'Ariza Topshirish')} <FiArrowRight />
            </Link>

            <p className="text-xs text-slate-400 mt-4">
              {t('home.freeNoHidden', "Bepul. Hech qanday yashirin to'lovlar yo'q.")}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
