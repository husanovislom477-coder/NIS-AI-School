import { Container, Card, Badge, Button } from '../components/ui';
import { FiTrendingUp, FiExternalLink, FiUsers, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '../api';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { useLanguage } from '../context/LanguageContext';

export default function StartupsPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['startups-list'],
    queryFn: () => projectAPI.getAll({ limit: 50 }),
  });

  const startups = data?.data?.data || [];

  return (
    <div>
      {/* Hero — Video + Canvas */}
      <div className="page-hero">
        <PageHeroBackground category="tech" variant="waves" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiTrendingUp size={13} /> {t('projects.acceleratorBadge', 'Akseleratsiya & Inkubator')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('nav.startups', "O'quvchilar Startaplari")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            {t('projects.startupsSubtitle', "Maktab inkubatori doirasida yaratilayotgan, real bozor talablariga javob beruvchi innovatsion texnologik startaplar")}
          </motion.p>
        </div>
      </div>

      {/* Startups Grid — Section 1: Animated Waves */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card p-6 h-64 animate-pulse bg-white/80" />
              ))}
            </div>
          ) : startups.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <FiTrendingUp size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{t('projects.noStartups', 'Hozircha startaplar mavjud emas')}</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{t('projects.noStartupsDesc', "Yangi o'quvchi startaplari inkubatsiya jarayonidan so'ng e'lon qilinadi.")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {startups.map((s, idx) => (
                <motion.div
                  key={s.id || s._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                >
                  <Card variant="bordered" padding="lg" hover className="flex flex-col justify-between h-full bg-white/90 backdrop-blur-xs">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant="blue">{s.category || 'AI & Tech'}</Badge>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {s.status || 'Active'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold font-display text-slate-900 mb-2">
                        {s.title || s.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">Muassis: {s.studentName || s.creator || ''}</span>
                      <span className="text-school-600 font-medium">{s.branch?.name || s.branchName || ''}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Incubation Fund CTA — Section 2: Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('projects.venturesBadge', 'NIS Ventures & Inkubator')}</span>
          <h2 className="section-heading mb-4">{t('projects.startupsCta', "Startap G'oyangizni Moliyalashtiramiz")}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('projects.venturesDesc', "Har bir iqtidorli o'quvchi g'oyasi maktab qoshidagi innovatsiya jamg'armasi orqali grant va mentorlik ko'magiga ega bo'ladi.")}
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            {t('projects.venturesBtn', "Loyiha bilan qabulga topshirish")} <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
