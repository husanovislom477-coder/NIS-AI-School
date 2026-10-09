import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { studentAPI } from '../api';
import { FiSearch, FiAward, FiChevronRight, FiUsers, FiStar, FiArrowRight } from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';

export default function StudentsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, page],
    queryFn: () => studentAPI.getAll({ search, page, limit: 12 }),
  });
  const students = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="ambient" variant="shimmer" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiStar size={13} className="text-yellow-300" /> {t('results.honorsBadge', 'Faxriylar')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('results.title', 'Maktabimiz Faxrlari')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg"
          >
            {t('results.subtitle', 'IOI, IAIO, IELTS, SAT – xalqaro yutuqlar sovrindorlari')}
          </motion.p>
        </div>
      </div>

      {/* Students Roster Section — Animated Shimmer Background */}
      <section className="relative overflow-hidden py-14 bg-slate-50/50">
        <SectionAnimatedBackground variant="shimmer" />
        <div className="container-custom relative z-10">
        {/* Search */}
        <div className="relative max-w-md mb-8">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('results.searchPlaceholder', 'Talaba qidirish...')}
            className="input-field pl-12"
          />
        </div>

        <p className="text-sm text-slate-400 mb-8 font-medium">
          <span className="text-slate-700 font-semibold">{total}</span> {t('results.studentsFound', 'ta talaba topildi')}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse h-72 bg-slate-50" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {students.map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.45 }}
                  className="card overflow-hidden group hover-lift"
                >
                  {/* Top section with avatar */}
                  <div className="p-6 pb-4 bg-gradient-to-br from-blue-50 to-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={getImageUrl(s.photo) || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=0066cc&color=fff&size=120`}
                          alt={s.firstName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                          onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=0066cc&color=fff&size=120`; }}
                        />
                        {s.awards?.length > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                            <FiStar size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 font-display truncate">{s.firstName} {s.lastName}</h3>
                        <p className="text-sm text-blue-600 font-medium">{s.grade}</p>
                        {s.university && (
                          <p className="text-xs text-emerald-600 font-medium truncate mt-0.5">{s.university}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div className="p-5">
                    {/* Test scores */}
                    {s.results?.slice(0, 2).map((r, j) => (
                      <div key={j} className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">{r.type}</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg text-xs">{r.score}</span>
                      </div>
                    ))}

                    {/* Award highlight */}
                    {s.awards?.slice(0, 1).map((a, j) => (
                      <div key={j} className="flex items-center gap-2 mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                        <FiAward size={13} className="text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-slate-700 font-medium truncate">{a.title}</p>
                      </div>
                    ))}

                    <Link to={`/students/${s._id}`} className="mt-4 flex items-center gap-1 text-sm text-blue-600 font-medium hover:gap-2 transition-all duration-200">
                      {t('results.details', 'Batafsil')} <FiChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {students.length === 0 && (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiUsers size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">{t('results.notFound', 'Talaba topilmadi')}</p>
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      p === page
                        ? 'bg-blue-600 text-white shadow-glow'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:-translate-y-0.5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </section>

      {/* Global Results & Scholarships Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('results.globalResults', 'Xalqaro natijalar')}</span>
          <h2 className="section-heading mb-4">{t('results.globalAdmissions', '100% Xalqaro Universitetlar Qabuli')}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('results.globalAdmissionsDesc', "Bitiruvchilarimiz MIT, Harvard, KAIST, NYU va NUS kabi dunyoning eng nufuzli oliygohlariga to'liq grant asosida qabul qilinmoqda. O'rtacha IELTS balli — 7.5, SAT — 1480+.")}
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            {t('results.applyCta', 'Qabulda ishtirok etish')} <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
