import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { eventAPI } from '../api';
import { FiCalendar, FiMapPin, FiClock, FiExternalLink, FiAward, FiArrowRight } from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  { value: 'hackathon', label: 'Hackathon', color: 'blue' },
  { value: 'olympiad', label: 'Olimpiada', color: 'purple' },
  { value: 'seminar', label: 'Seminar', color: 'emerald' },
  { value: 'conference', label: 'Konferensiya', color: 'amber' },
  { value: 'workshop', label: 'Workshop', color: 'pink' },
  { value: 'open-day', label: 'Ochiq eshik kuni', color: 'teal' },
];

const categoryBadge = {
  hackathon: 'badge-blue',
  olympiad: 'badge-purple',
  seminar: 'badge-green',
  conference: 'badge-yellow',
  workshop: 'bg-pink-100 text-pink-700 badge',
  'open-day': 'bg-teal-100 text-teal-700 badge',
};

export default function EventsPage() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getAll({ limit: 20 }),
  });
  const events = data?.data?.data || [];
  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter((e) => new Date(e.date) < now);

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="campus" variant="shimmer" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiCalendar size={13} /> {t('events.badge', 'Dasturlar & Bellashuvlar')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('nav.events', 'Tadbirlar')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            {t('events.subtitle', 'Hackathon, olimpiada, xalqaro seminarlar va ochiq eshiklar kunlari')}
          </motion.p>
        </div>
      </div>

      {/* Events Listing Section — Animated Shimmer */}
      <section className="relative overflow-hidden py-14 bg-slate-50/50">
        <SectionAnimatedBackground variant="shimmer" />
        <div className="container-custom relative z-10">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-6 animate-pulse h-36" />)}
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold font-display text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" /> {t('events.upcoming', 'Kelayotgan Tadbirlar')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {upcoming.map((e, i) => (
                    <motion.div key={e._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                    >
                      {e.coverImage && (
                        <div className="h-44 overflow-hidden">
                          <img src={e.coverImage} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={categoryBadge[e.category] || 'badge-blue'}>{e.category}</span>
                            <h3 className="font-bold text-slate-900 font-display text-lg mt-2">{e.title}</h3>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                          <div className="flex items-center gap-2"><FiCalendar size={14} className="text-blue-500" /> {new Date(e.date).toLocaleDateString()}</div>
                          {e.time && <div className="flex items-center gap-2"><FiClock size={14} className="text-blue-500" /> {e.time}</div>}
                          {e.location && <div className="flex items-center gap-2"><FiMapPin size={14} className="text-blue-500" /> {e.location}</div>}
                        </div>
                        {e.shortDescription && <p className="text-sm text-slate-500 mt-3">{e.shortDescription}</p>}
                        {e.registrationLink && (
                          <a href={e.registrationLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                            {t('events.register', "Ro'yxatdan o'tish")} <FiExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-display text-slate-900 mb-6 text-slate-500">{t('events.past', "O'tgan Tadbirlar")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map((e, i) => (
                    <div key={e._id} className="card p-5 opacity-70">
                      <span className={categoryBadge[e.category] || 'badge-blue'}>{e.category}</span>
                      <h3 className="font-semibold text-slate-700 mt-2">{e.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><FiCalendar size={11} /> {new Date(e.date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {events.length === 0 && <div className="text-center py-20 text-slate-400">{t('events.none', "Hozircha tadbir yo'q")}</div>}
          </>
        )}
        </div>
      </section>

      {/* Annual AI Festival & Hackathon Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">Tadbir tashkilotchiligi</span>
          <h2 className="section-heading mb-4">O'z Tadbiringizni Maktabimizda O'tkazing</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            NIS AI School kampuslarida 500+ kishilik konferens-zallar va yuqori tezlikdagi
            internet infratuzilmasi mavjud. Hamkorlikdagi ta'lim va AI loyihalarini qo'llab-quvvatlaymiz.
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            Biz bilan bog'lanish <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
