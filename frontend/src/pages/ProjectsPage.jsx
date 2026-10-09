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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 h-64 animate-pulse bg-white/80" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <Card variant="bordered" padding="lg" hover className="flex flex-col justify-between h-full bg-white/90 backdrop-blur-xs">
                      <div>
                        {img && (
                          <div className="h-44 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl bg-slate-100">
                            <img src={getImageUrl(img)} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <Badge variant="blue" size="sm">{p.category || 'AI'}</Badge>
                          {p.year && <span className="text-xs text-slate-400 font-medium">{p.year}</span>}
                        </div>
                        <h3 className="text-lg font-bold font-display text-slate-900 mb-2 leading-snug">
                          {p.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                          {p.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {tags.map((tag) => (
                            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{p.studentName || p.creator || ''}</span>
                        <span className="text-school-600 font-medium">{p.branch?.name || p.branchName || ''}</span>
                      </div>
                    </Card>
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
