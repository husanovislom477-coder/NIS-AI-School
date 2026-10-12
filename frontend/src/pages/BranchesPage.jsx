import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { branchAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import {
  FiMapPin, FiUsers, FiSearch, FiPhone, FiChevronRight, FiClock, FiGlobe,
} from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { getImageUrl } from '../utils/image';

export default function BranchesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['branches', search],
    queryFn: () => branchAPI.getAll({ search, limit: 20 }),
  });
  const branches = data?.data?.data || [];

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="campus" variant="network" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiMapPin size={13} /> {t('branches.citiesCount', '3 Shahar')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('branches.title', 'Bizning Filiallar')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-md mx-auto"
          >
            {t('branches.citiesSubtitle', "3 shaharda zamonaviy AI ta'lim markazi")}
          </motion.p>
        </div>
      </div>

      {/* Listings Section — Animated Background */}
      <section className="relative overflow-hidden py-14 bg-slate-50/50">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
        {/* Search */}
        <div className="relative max-w-md mb-10">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('branches.searchPlaceholder', 'Filial qidirish...')}
            className="input-field pl-12"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-3 sm:p-4 animate-pulse flex flex-row lg:flex-col gap-3.5">
                <div className="w-32 xs:w-36 sm:w-48 lg:w-full h-32 sm:h-40 lg:h-52 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-2.5" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {branches.map((b, i) => (
              <motion.div
                key={b._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card overflow-hidden group hover-lift flex flex-row lg:flex-col transition-all duration-300 h-full"
              >
                {/* Image */}
                <div className="relative w-32 xs:w-36 sm:w-48 lg:w-full shrink-0 min-h-[140px] lg:h-52 bg-slate-100 overflow-hidden">
                  {b.coverImage || b.image ? (
                    <img src={getImageUrl(b.coverImage || b.image)} alt={b.name} className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <FiMapPin size={40} className="text-blue-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  {b.featured && (
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
                      <span className="badge-deep text-[10px] sm:text-[11px]">{t('branches.mainCampus', 'Bosh Kampus')}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 xs:p-4 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm sm:text-base lg:text-xl font-bold font-display text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                      {b.shortName || b.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-2 truncate">
                      <FiMapPin size={13} className="text-blue-500 shrink-0" /> {b.address || b.location}
                    </div>

                    {b.description && (
                      <p className="hidden sm:block text-xs sm:text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{b.description}</p>
                    )}

                    {/* Compact Stats Pills */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                      <div className="text-center p-1.5 sm:p-2.5 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100/60">
                        <p className="text-xs sm:text-base font-bold text-blue-700">{b.studentCount || '–'}</p>
                        <p className="text-[9px] sm:text-[11px] text-slate-500">{t('branches.students', "O'quvchi")}</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2.5 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100/60">
                        <p className="text-xs sm:text-base font-bold text-blue-700">{b.teacherCount || '–'}</p>
                        <p className="text-[9px] sm:text-[11px] text-slate-500">{t('branches.teachers', "O'qituvchi")}</p>
                      </div>
                      <div className="text-center p-1.5 sm:p-2.5 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100/60">
                        <p className="text-xs sm:text-base font-bold text-blue-700">{b.established || '–'}</p>
                        <p className="text-[9px] sm:text-[11px] text-slate-500">{t('branches.founded', 'Tashkil')}</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/branches/${b._id}`}
                    className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:gap-2 transition-all duration-200"
                  >
                    {t('branches.viewDetails', "Batafsil ko'rish")} <FiChevronRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && branches.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiMapPin size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">{t('branches.notFound', 'Filial topilmadi')}</p>
          </div>
        )}
        </div>
      </section>

      {/* Facilities Highlight Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('branches.infrastructure', 'Infratuzilma')}</span>
          <h2 className="section-heading mb-4">{t('branches.modernLabs', 'Zamonaviy AI Laboratoriyalari')}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('branches.modernLabsDesc', "Barcha filiallarimiz NVIDIA A100 GPU klasterlari, robototexnika ustaxonalari, aerokosmik AI simulyatorlari hamda zamonaviy coworking zonalar bilan ta'minlangan.")}
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            {t('branches.applyAdmissions', 'Qabulga ariza topshirish')}
          </Link>
        </div>
      </section>
    </div>
  );
}
