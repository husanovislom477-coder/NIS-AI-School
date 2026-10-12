import { Container, Card, Badge, Button } from '../components/ui';
import { FiLayers, FiExternalLink, FiGithub, FiCpu, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '../api';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';

export default function ProjectsPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectAPI.getAll({ limit: 50 }),
  });

  const projects = data?.data?.data || [];

  return (
    <div>
      {/* Hero — Video + Canvas */}
      <div className="page-hero">
        <PageHeroBackground category="ai" variant="network" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiCpu size={13} /> {t('projects.labBadge', 'Ilmiy Laboratoriya')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('projects.title', 'Innovatsion Loyihalar')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-2xl mx-auto"
          >
            {t('projects.subtitle', "O'quvchilarimiz tomonidan yaratilgan sun'iy intellekt, robototexnika, tibbiyot va aerokosmik sohalardagi ilmiy ishlar")}
          </motion.p>
        </div>
      </div>

      {/* Projects Grid — Section 1: Animated Network */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden">
        <SectionAnimatedBackground variant="network" />
        <div className="container-custom relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-3 sm:p-4 h-36 animate-pulse bg-white/80 flex flex-row md:flex-col gap-3" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <FiCpu size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t('projects.noProjects', 'Hozircha loyihalar mavjud emas')}</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{t('projects.noProjectsDesc', "Yangi o'quvchi loyihalari tez orada qo'shiladi.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
              {projects.map((p, idx) => {
                const img = p.image || p.projectImage;
                const tags = Array.isArray(p.tags) ? p.tags : (p.category ? [p.category] : ['AI']);
                return (
                  <motion.div
                    key={p.id || p._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="card overflow-hidden group hover-lift flex flex-row md:flex-col justify-between h-full bg-white/95 backdrop-blur-xs transition-all duration-300">
                      {img && (
                        <div className="w-28 xs:w-36 sm:w-44 md:w-full shrink-0 min-h-[120px] md:h-44 overflow-hidden bg-slate-100 relative">
                          <img src={getImageUrl(img)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 left-2 md:hidden">
                            <span className="badge-blue text-[10px]">{p.category || 'AI'}</span>
                          </div>
                        </div>
                      )}
                      <div className="p-3 xs:p-3.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="hidden md:flex items-center justify-between gap-2 mb-2">
                            <Badge variant="blue" size="sm">{p.category || 'AI'}</Badge>
                            {p.year && <span className="text-xs text-slate-400 font-medium">{p.year}</span>}
                          </div>
                          <h3 className="text-xs sm:text-sm md:text-base font-bold font-display text-slate-900 mb-1 leading-snug line-clamp-2">
                            {p.title}
                          </h3>
                          <p className="hidden sm:block text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2 sm:mb-4">
                            {tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 truncate mr-2">{p.studentName || p.creator || ''}</span>
                          <span className="text-school-600 font-medium shrink-0">{p.branch?.name || p.branchName || ''}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Project Submission / Lab CTA — Section 2: Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('projects.hackathonBadge', 'AI Hackathon & Lab')}</span>
          <h2 className="section-heading mb-4">{t('projects.ctaTitle', "O'z Loyihangizni Yarating")}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('projects.ctaDesc', "Har yili o'quvchilarimiz o'rtasida 50,000$ mukofot jamg'armasiga ega AI Hakaton o'tkaziladi. Eng yaxshi ilmiy ishlar xalqaro jurnallarda nashr etiladi.")}
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            {t('projects.ctaBtn', 'Maktabga ariza topshirish')} <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
