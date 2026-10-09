import { motion } from 'framer-motion';
import { FiAward, FiStar, FiGlobe, FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../api';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { useLanguage } from '../context/LanguageContext';

const medalColors = {
  yellow: {
    badge: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    icon: 'text-yellow-500',
    result: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    accent: 'bg-yellow-500',
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: 'text-amber-500',
    result: 'bg-amber-50 border-amber-200 text-amber-800',
    accent: 'bg-amber-500',
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: 'text-blue-500',
    result: 'bg-blue-50 border-blue-200 text-blue-800',
    accent: 'bg-blue-600',
  },
};

export default function AchievementsPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['achievements-results'],
    queryFn: () => studentAPI.getAll({ limit: 50 }),
  });

  const dbResults = data?.data?.data || [];
  const achievements = dbResults.map((r, i) => ({
    id: r.id || r._id,
    title: r.description || `${r.examType} Natijasi — ${r.score}`,
    winner: r.studentName,
    result: `${r.examType}: ${r.score}`,
    level: r.examType === 'IOI' || r.examType === 'IAIO' ? 'Xalqaro' : 'Respublika',
    year: String(r.year || 2026),
    location: r.branch?.name || "NIS Kampus",
    color: i % 3 === 0 ? 'yellow' : i % 3 === 1 ? 'amber' : 'blue',
    desc: r.description || `${r.studentName} ${r.year || 2026}-yilda ${r.examType} bo'yicha ${r.score} natijaga erishdi.`,
  }));

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="ambient" variant="shimmer" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiAward size={13} className="text-yellow-300" /> {t('nav.achievements', 'Yutuqlar')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('achievements.title', 'Maktabimiz Yutuqlari')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            {t('achievements.subtitle', 'Xalqaro fan olimpiadalari, musobaqalar va ilmiy tanlovlardagi yuksak natijalar')}
          </motion.p>
        </div>
      </div>

      {/* Summary stats — Section 1: Animated Waves */}
      <section className="py-12 bg-slate-50/60 border-b border-slate-100 relative overflow-hidden">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: t('achievements.totalResults', 'Jami natijalar'), value: String(dbResults.length), icon: FiStar },
              { label: t('achievements.competitions', "Imtihon turlari"), value: String(new Set(dbResults.map(r => r.examType)).size || (dbResults.length > 0 ? 1 : 0)), icon: FiAward },
              { label: t('achievements.studentsCount', "G'olib o'quvchilar"), value: String(dbResults.length), icon: FiGlobe },
              { label: t('achievements.academicYear', 'O‘quv yili'), value: '2025-2026', icon: FiCalendar },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-4 text-center"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <s.icon size={18} className="text-blue-600" />
                </div>
                <p className="text-xl font-bold font-display text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement cards — Section 2: Animated Shimmer (Gold particles) */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionAnimatedBackground variant="shimmer" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center max-w-xl mx-auto"
          >
            <span className="badge-blue mb-3">{t('achievements.recentResults', "So'nggi natijalar")}</span>
            <h2 className="section-heading">{t('achievements.resultsList', "G'alabalar Ro'yxati")}</h2>
            <p className="text-slate-500 text-sm mt-2">{t('achievements.competitionsDesc', "Dunyodagi eng qiyin informatika va sun'iy intellekt bellashuvlari")}</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 h-64 animate-pulse bg-slate-50" />
              ))}
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <FiAward size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t('achievements.noResults', 'Hozircha natijalar kiritilmagan')}</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{t('achievements.noResultsDesc', "O'quvchilar yutuqlari rasmiy imtihon natijalari e'lon qilingach bu yerda ko'rinadi.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((item, idx) => {
                const col = medalColors[item.color] || medalColors.blue;
                return (
                  <motion.div
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.12, duration: 0.5 }}
                    className="card hover-lift flex flex-col overflow-hidden"
                  >
                    {/* Accent bar */}
                    <div className={`h-1 ${col.accent}`} />

                    <div className="p-6 flex-1 flex flex-col">
                      {/* Level & Year */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${col.badge}`}>
                          <FiGlobe size={11} /> {item.level}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <FiMapPin size={11} /> {item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiCalendar size={11} /> {item.year}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold font-display text-slate-900 mb-3 leading-snug flex-1">
                        {item.title}
                      </h3>

                      {/* Result highlight */}
                      <div className={`px-4 py-3 rounded-xl border ${col.result} mb-4`}>
                        <div className="flex items-center gap-2">
                          <FiAward size={16} className={col.icon} />
                          <div>
                            <p className="text-sm font-bold">{item.result}</p>
                            <p className="text-xs font-medium opacity-75 mt-0.5">{item.winner}</p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Global Olympiad Preparation — Section 3: Video Background */}
      <section className="py-20 bg-slate-50/60 relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('achievements.campBadge', 'Tayyorgarlik tizimi')}</span>
          <h2 className="section-heading mb-4">{t('achievements.campTitle', 'Olimpiada Maxsus Lageri')}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('achievements.campDesc', "NIS AI School o'quvchilari xalqaro olimpiadalarga tayyorgarlik uchun intensiv o'quv-mashg'ulot yig'inlarida qatnashadilar. Xalqaro hakamlar va sobiq IOI g'oliblari bevosita dars berishadi.")}
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            {t('achievements.applyBtn', "Biz bilan g'olib bo'ling")} <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
