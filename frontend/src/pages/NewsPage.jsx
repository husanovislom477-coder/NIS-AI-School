import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { newsAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { FiSearch, FiCalendar, FiEye, FiChevronRight, FiRadio, FiArrowRight } from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { getImageUrl } from '../utils/image';

export default function NewsPage() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const categories = [
    { value: '', label: t('common.all', 'Barchasi') },
    { value: 'general', label: t('news.catGeneral', 'Umumiy') },
    { value: 'academic', label: t('news.catAcademic', 'Akademik') },
    { value: 'olympiad', label: t('news.catOlympiad', 'Olimpiada') },
    { value: 'achievement', label: t('news.catAchievement', 'Yutuq') },
    { value: 'announcement', label: t('news.catAnnouncement', "E'lon") },
    { value: 'event', label: t('news.catEvent', 'Tadbir') },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['news', search, category, page],
    queryFn: () => newsAPI.getAll({ search, category, page, limit: 9 }),
  });
  const news = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="campus" variant="waves" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiRadio size={13} /> {t('news.officialPress', 'Rasmiy Axborot')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('news.title', 'Yangiliklar')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            {t('news.subtitle', "NIS AI School hayotidagi eng muhim xabarlar, olimpiada g'alabalari va e'lonlar")}
          </motion.p>
        </div>
      </div>

      {/* News Grid Section — Animated Waves */}
      <section className="relative overflow-hidden py-14 bg-slate-50/50">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={t('news.searchPlaceholder', 'Yangilik qidirish...')} className="input-field pl-12" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c.value} onClick={() => { setCategory(c.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === c.value ? 'bg-blue-600 text-white shadow-glow' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
              >{c.label}</button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-400 mb-6">{total} {t('news.newsCount', 'ta yangilik')}</p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-3 sm:p-4 animate-pulse h-32 flex flex-row md:flex-col gap-3" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {news.map((n, i) => (
                <motion.div key={n._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-row md:flex-col h-full"
                >
                  <div className="relative w-28 xs:w-32 sm:w-40 md:w-full shrink-0 min-h-[110px] md:h-48 bg-slate-100 overflow-hidden">
                    {n.coverImage ? (
                      <img src={getImageUrl(n.coverImage)} alt={n.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100" />
                    )}
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
                      <span className="badge-blue text-[10px] sm:text-[11px] capitalize">{n.category}</span>
                    </div>
                  </div>
                  <div className="p-3 xs:p-3.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-400 mb-1.5">
                        <div className="flex items-center gap-1">
                          <FiCalendar size={11} />
                          {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uz-UZ') : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiEye size={11} /> {n.views || 0}
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm md:text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">{n.title}</h3>
                      {n.shortDescription && <p className="hidden sm:block text-xs sm:text-sm text-slate-500 mt-1.5 line-clamp-2">{n.shortDescription}</p>}
                    </div>
                    <Link to={`/news/${n.slug || n._id || n.id}`} className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1 text-xs sm:text-sm text-blue-600 font-medium hover:gap-2 transition-all">
                      {t('home.read', "O'qish")} <FiChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            {news.length === 0 && <div className="text-center py-20 text-slate-400">{t('news.notFound', 'Yangilik topilmadi')}</div>}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>{p}</button>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </section>

      {/* Press & Media Subscription Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">{t('news.pressService', 'Matbuot xizmati')}</span>
          <h2 className="section-heading mb-4">{t('news.stayUpdatedHeading', "Eng So'nggi Xabarlardan Xabardor Bo'ling")}</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            {t('news.stayUpdatedDesc', "Rasmiy Telegram kanalimiz va ijtimoiy tarmoqlarimiz orqali maktabimizning kundalik hayoti, olimpiadalar va e'lonlarni birinchilardan bo'lib kuzatib boring.")}
          </p>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-8 py-3 shadow-glow"
          >
            {t('news.subscribeTelegram', "Telegram kanalimizga obuna bo'lish")} <FiArrowRight className="inline ml-1" />
          </a>
        </div>
      </section>
    </div>
  );
}
