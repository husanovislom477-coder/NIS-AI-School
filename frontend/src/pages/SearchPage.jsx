import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Section, Card, Badge } from '../components/ui';
import { motion } from 'framer-motion';
import { searchAPI } from '../api';
import {
  FiSearch,
  FiLayers,
  FiUsers,
  FiMapPin,
  FiAward,
  FiFileText,
  FiCalendar,
  FiArrowRight,
  FiChevronRight,
} from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { useLanguage } from '../context/LanguageContext';

export default function SearchPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute global search API
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      return;
    }

    const doSearch = async () => {
      setLoading(true);
      try {
        const res = await searchAPI.search({ q: debouncedQuery, type: filter, limit: 12 });
        if (res.data?.success) {
          setResults(res.data);
        }
      } catch {
        // graceful empty
        setResults({ total: 0, results: {} });
      } finally {
        setLoading(false);
      }
    };

    doSearch();
  }, [debouncedQuery, filter]);

  const filterTabs = [
    { id: 'all', label: t('common.all', 'Barchasi') },
    { id: 'campuses', label: t('nav.campuses', 'Filiallar') },
    { id: 'teachers', label: t('nav.teachers', "O'qituvchilar") },
    { id: 'students', label: t('nav.results', 'Talabalar & Yutuqlar') },
    { id: 'news', label: t('nav.news', 'Yangiliklar') },
    { id: 'events', label: t('nav.events', 'Tadbirlar') },
  ];

  return (
    <div className="bg-white min-h-[85vh]">
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="ai" variant="network" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiSearch size={13} /> {t('search.globalSearch', 'Global Qidiruv')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('search.title', 'Markaziy Qidiruv Tizimi')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            {t('search.subtitle', "O'qituvchilar, filiallar, talabalar, IELTS natijalari, yangiliklar va tadbirlar ichidan kerakli ma'lumotni tezkor toping")}
          </motion.p>
        </div>
      </div>

      <div className="relative overflow-hidden bg-slate-50/40">
        <SectionAnimatedBackground variant="network" />
        <div className="relative z-10">
          <Section py="md">
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <FiSearch
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder', 'Masalan: IELTS, Deep Learning, Toshkent, Python, olimpiada...')}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-500/20 focus:border-school-600 shadow-sm transition-all"
            />
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{t('search.suggestions', 'Tavsiyalar:')}</span>
            {['IELTS', 'Toshkent', 'Deep Learning', 'Namangan', 'Robototexnika'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-school-50 hover:text-school-700 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          {debouncedQuery.length >= 2 && (
            <div className="flex items-center gap-1.5 mt-5 overflow-x-auto no-scrollbar pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors ${
                    filter === tab.id
                      ? 'bg-school-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── SEARCH RESULTS ─── */}
        {loading ? (
          <div className="max-w-3xl mx-auto py-16 text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-xs text-slate-400">{t('search.searching', 'Natijalar qidirilmoqda...')}</p>
          </div>
        ) : results ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <p className="text-xs text-slate-500">
                "<strong className="text-slate-800">{debouncedQuery}</strong>" —{' '}
                <strong className="text-school-600">{results.total}</strong> {t('search.resultsFound', 'ta natija topildi')}
              </p>
            </div>

            {results.total === 0 ? (
              <div className="card p-12 text-center">
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  {t('search.notFound', 'Hech qanday natija topilmadi')}
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {t('search.notFoundDesc', "Iltimos, boshqa kalit so'zlarni sinab ko'ring yoki yuqoridagi toifalardan birini tanlang.")}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Branches results */}
                {results.results?.branches?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiMapPin size={13} className="text-school-600" /> Filiallar ({results.results.branches.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.results.branches.map((b) => (
                        <Link
                          key={b._id}
                          to={`/campuses/${b._id}`}
                          className="card p-4 hover:border-school-300 transition-all flex items-start gap-3 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-school-600 flex items-center justify-center shrink-0">
                            <FiMapPin size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-school-600 transition-colors truncate">
                              {b.shortName || b.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{b.location} · {b.address}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teachers results */}
                {results.results?.teachers?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiUsers size={13} className="text-school-600" /> O'qituvchilar ({results.results.teachers.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.results.teachers.map((t) => (
                        <Link
                          key={t._id}
                          to={`/teachers/${t._id}`}
                          className="card p-4 hover:border-school-300 transition-all flex items-start gap-3 group"
                        >
                          <img
                            src={t.photo || `https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=2563eb&color=fff&size=100`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-school-600 transition-colors truncate">
                              {t.firstName} {t.lastName}
                            </h4>
                            <p className="text-[11px] text-school-600 font-medium truncate mt-0.5">{t.subject}</p>
                            <p className="text-[10px] text-slate-400 truncate">{t.university}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Students results */}
                {results.results?.students?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiAward size={13} className="text-school-600" /> Talabalar & Yutuqlar ({results.results.students.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {results.results.students.map((s) => (
                        <Link
                          key={s._id}
                          to={`/students/${s._id}`}
                          className="card p-4 hover:border-school-300 transition-all flex items-start gap-3 group"
                        >
                          <img
                            src={s.photo || `https://ui-avatars.com/api/?name=${s.firstName}+${s.lastName}&background=2563eb&color=fff&size=100`}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-school-600 transition-colors truncate">
                              {s.firstName} {s.lastName}
                            </h4>
                            <p className="text-[11px] text-blue-600 font-medium">{s.grade} sinf</p>
                            {s.university && <p className="text-[10px] text-emerald-600 truncate">{s.university}</p>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* News results */}
                {results.results?.news?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiFileText size={13} className="text-school-600" /> Yangiliklar ({results.results.news.length})
                    </h3>
                    <div className="space-y-2">
                      {results.results.news.map((n) => (
                        <Link
                          key={n._id}
                          to={`/news/${n._id}`}
                          className="card p-3.5 hover:border-school-300 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-school-600 transition-colors line-clamp-1">
                              {n.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{n.shortDescription}</p>
                          </div>
                          <FiChevronRight size={14} className="text-slate-300 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events results */}
                {results.results?.events?.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-bold font-display text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiCalendar size={13} className="text-school-600" /> Tadbirlar ({results.results.events.length})
                    </h3>
                    <div className="space-y-2">
                      {results.results.events.map((ev) => (
                        <Link
                          key={ev._id}
                          to="/events"
                          className="card p-3.5 hover:border-school-300 transition-all flex items-center justify-between gap-3 group"
                        >
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 group-hover:text-school-600 transition-colors line-clamp-1">
                              {ev.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{ev.location} · {ev.date}</p>
                          </div>
                          <FiChevronRight size={14} className="text-slate-300 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Default Quick Helper Navigation */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card variant="bordered" padding="md" hover to="/teachers" className="text-center">
              <FiUsers className="mx-auto text-school-600 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-900">O'qituvchilar</h4>
              <p className="text-xs text-slate-500 mt-1">40+ xalqaro mutaxassis</p>
            </Card>
            <Card variant="bordered" padding="md" hover to="/campuses" className="text-center">
              <FiMapPin className="mx-auto text-school-600 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-900">Filiallar</h4>
              <p className="text-xs text-slate-500 mt-1">3 ta zamonaviy kampus</p>
            </Card>
            <Card variant="bordered" padding="md" hover to="/students" className="text-center">
              <FiAward className="mx-auto text-school-600 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-900">Yutuqlar & IELTS</h4>
              <p className="text-xs text-slate-500 mt-1">Olimpiada va sertifikatlar</p>
            </Card>
            <Card variant="bordered" padding="md" hover to="/projects" className="text-center">
              <FiLayers className="mx-auto text-school-600 mb-2" size={24} />
              <h4 className="font-bold text-sm text-slate-900">Loyihalar</h4>
              <p className="text-xs text-slate-500 mt-1">AI & Ilmiy ishlar</p>
            </Card>
          </div>
        )}
      </Section>
        </div>
      </div>
    </div>
  );
}
