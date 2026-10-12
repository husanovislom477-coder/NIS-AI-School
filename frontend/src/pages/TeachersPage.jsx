import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { teacherAPI, branchAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { FiSearch, FiChevronRight, FiFilter, FiUsers, FiBookOpen, FiStar, FiArrowRight } from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { getImageUrl } from '../utils/image';

export default function TeachersPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', search, branchId, page],
    queryFn: () => teacherAPI.getAll({ search, branchId, page, limit: 12 }),
  });
  const { data: branchesData } = useQuery({
    queryKey: ['branches-filter'],
    queryFn: () => branchAPI.getAll({ limit: 20 }),
  });

  const teachers = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;
  const branches = branchesData?.data?.data || [];

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="ai" variant="network" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm">
              <FiUsers size={13} /> {t('teachers.teamBadge', 'Pedagogik Jamoa')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('teachers.title', "O'qituvchilar")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-blue-200 text-lg max-w-lg mx-auto"
          >
            {t('teachers.teamSubtitle', 'MIT, Stanford, ETH Zürich va DeepMind mutaxassislari')}
          </motion.p>
        </div>
      </div>

      {/* Teachers Roster Section — Animated Network Background */}
      <section className="relative overflow-hidden py-14 bg-slate-50/50">
        <SectionAnimatedBackground variant="network" />
        <div className="container-custom relative z-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t('teachers.searchPlaceholder', "O'qituvchi qidirish...")}
              className="input-field pl-12"
            />
          </div>
          <div className="relative">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <select
              value={branchId}
              onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
              className="input-field pl-11 pr-10 min-w-52 appearance-none cursor-pointer"
            >
              <option value="">{t('teachers.allBranches', 'Barcha filiallar')}</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.shortName || b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-8 font-medium">
          <span className="text-slate-700 font-semibold">{total}</span> {t('teachers.teachersFound', "ta o'qituvchi topildi")}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-3 sm:p-4 animate-pulse flex flex-row lg:flex-col gap-3">
                <div className="w-28 xs:w-32 sm:w-40 lg:w-full h-28 xs:h-32 sm:h-36 lg:h-52 bg-slate-200 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-5">
              {teachers.map((teacher, i) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.45 }}
                  className="card overflow-hidden group hover-lift flex flex-row lg:flex-col transition-all duration-300 h-full"
                >
                  <div className="relative w-28 xs:w-32 sm:w-40 lg:w-full shrink-0 min-h-[130px] lg:h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={getImageUrl(teacher.photo) || `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=0066cc&color=fff&size=240`}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=0066cc&color=fff&size=240`; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
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
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {teacher.education && <span className="badge-blue text-[10px] sm:text-[11px]">{teacher.education}</span>}
                        {teacher.experience > 0 && <span className="text-[11px] sm:text-xs text-slate-400">{teacher.experience}+ {t('teachers.yearsShort', 'yil')}</span>}
                      </div>
                      {teacher.university && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{teacher.university}</p>}
                    </div>
                    <Link
                      to={`/teachers/${teacher._id}`}
                      className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-school-600 hover:text-school-800 transition-colors"
                    >
                      <span>{t('teachers.viewDetails', "Batafsil ko'rish")}</span>
                      <FiChevronRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {teachers.length === 0 && (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FiUsers size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">{t('teachers.notFound', "O'qituvchi topilmadi")}</p>
              </div>
            )}

            {/* Pagination */}
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
                    style={p === page ? {} : { boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
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

      {/* Mentorship & Faculty Highlight Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="ai"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('teachers.mentorshipBadge', 'Ustozlik dasturi')}</span>
          <h2 className="section-heading mb-4">{t('teachers.mentorshipHeading', 'Jahon Darajasidagi Ilmiy Muhit')}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('teachers.mentorshipDesc', "Har bir o'quvchiga individual mentor biriktiriladi. Bizning ustozlarimiz Google, Meta, Amazon va Yandex kabi xalqaro korporatsiyalarda amaliyot o'tagan yetakchi muhandislardir.")}
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            {t('teachers.learnWithUs', "Biz bilan o'rganing")} <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
