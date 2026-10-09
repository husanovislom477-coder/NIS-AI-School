import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiCompass, FiAward, FiCheckCircle, FiZap, FiUsers, FiBookOpen,
  FiGlobe, FiCpu, FiArrowRight, FiTarget, FiTrendingUp,
} from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { useLanguage } from '../context/LanguageContext';

const pillars = [
  {
    icon: FiCompass,
    title: 'Bizning Missiyamiz',
    desc: "O'quvchilarga eng zamonaviy texnologiyalar, sun'iy intellekt algoritmlari va fundamental fanlar bo'yicha chuqur bilim berish. Kelajak avlod innovatorlari va ilmiy yetakchilarini tarbiyalash.",
    color: 'from-blue-500 to-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: FiAward,
    title: 'Xalqaro Standartlar',
    desc: "IOI, IAIO, SAT va IELTS bo'yicha jahonning eng nufuzli olimpiadalari va universitetlariga (MIT, Stanford, ETH) yo'l ochish. 47 ta xalqaro medal sovrindori.",
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: FiCheckCircle,
    title: 'Amaliy Natijalar',
    desc: "O'quvchilar tomonidan real startaplar, ilmiy maqolalar va innovatsion dasturiy ta'minot mahsulotlari yaratish. Har bir o'quvchi loyiha portfelini maktabni bitirishiga qadar shakllantirib chiqadi.",
    color: 'from-emerald-500 to-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

const features = [
  { icon: FiCpu,       label: 'GPU Klaster', desc: 'NVIDIA A100 klasterlari' },
  { icon: FiUsers,     label: 'Shaxsiy Mentor', desc: "Har bir o'quvchiga alohida" },
  { icon: FiGlobe,     label: 'Xalqaro Hamkorlik', desc: 'MIT, Stanford, DeepMind' },
  { icon: FiBookOpen,  label: 'Zamonaviy Kutubxona', desc: '10,000+ resurs' },
  { icon: FiTarget,    label: 'Maqsadli Tayyorlov', desc: 'IOI, IAIO, SAT, IELTS' },
  { icon: FiTrendingUp, label: '100% Grant', desc: 'To\'liq davlat granti' },
];

const timeline = [
  { year: '2019', event: "Toshkentda birinchi NIS AI School ochildi", highlight: true },
  { year: '2021', event: "Namangan filiali ishga tushirildi" },
  { year: '2022', event: "IOI 2022 da birinchi xalqaro medal qozonildi", highlight: true },
  { year: '2023', event: "Samarqand filiali va GPU klaster ishga kiritildi" },
  { year: '2024', event: "IAIO 2024 — Oltin medal (AI olimpiadasi)", highlight: true },
  { year: '2025', event: "1,080+ faol o'quvchi, 47 xalqaro medal" },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* Hero */}
      <div className="page-hero">
        <PageHeroBackground category="ambient" variant="network" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiCompass size={13} /> {t('nav.about', 'Maktab haqida')}
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            {t('about.title', 'NIS AI School Haqida')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-xl mx-auto"
          >
            {t('about.subtitle', "O'zbekistonning birinchi sun'iy intellekt yo'nalishidagi maxsus maktabi")}
          </motion.p>
        </div>
      </div>

      {/* Main description — Section 1: Video */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="ai"
          opacity="opacity-10"
          overlayGradient="from-white/94 via-white/86 to-white/96"
        />
        <div className="container-custom max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge-blue mb-4">{t('about.storyBadge', 'Bizning hikoyamiz')}</span>
            <h2 className="section-heading mb-4">
              {t('about.storyTitle', "Sun'iy Intellekt Sohasidagi Birinchi Zamonaviy Maktab")}
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              {t('about.storyDesc', "NIS AI School — O'zbekiston yoshlarini jahon darajasidagi sun'iy intellekt mutaxassislari, olimpiada g'oliblari va innovatsion tadqiqotchilar etib tarbiyalashga qaratilgan ilg'or ta'lim muassasasi. 2019-yildan buyon 3 shahar, 1,080+ o'quvchi va 47 xalqaro medal bilan O'zbekiston ta'limini yangi bosqichga ko'taryapmiz.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3 Pillars — Section 2: Animation */}
      <section className="py-20 bg-slate-50/60 relative overflow-hidden">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card hover-lift flex flex-col overflow-hidden"
              >
                <div className={`h-1 bg-gradient-to-r ${p.color}`} />
                <div className="p-7 flex-1">
                  <div className={`w-12 h-12 rounded-xl ${p.bg} border ${p.border} flex items-center justify-center mb-5`}>
                    <p.icon size={22} className="text-slate-700" />
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 mb-3">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid — Section 3: Video */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge-blue mb-3">{t('about.benefitsBadge', 'Imtiyozlar')}</span>
            <h2 className="section-heading">{t('about.whyChoose', 'Nega NIS AI School?')}</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="card p-5 text-center hover-lift-sm"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <f.icon size={20} className="text-blue-600" />
                </div>
                <p className="font-bold text-slate-900 text-sm">{f.label}</p>
                <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline — Section 4: Animation */}
      <section className="py-20 bg-slate-50/60 relative overflow-hidden">
        <SectionAnimatedBackground variant="shimmer" />
        <div className="container-custom max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="badge-blue mb-3">{t('about.timelineBadge', 'Tarixiy sahifalar')}</span>
            <h2 className="section-heading">{t('about.timelineTitle', "Bizning Yo'limiz")}</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-blue-600 via-blue-300 to-blue-100" />

            <div className="space-y-6">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${item.highlight ? 'bg-blue-600 text-white shadow-glow' : 'bg-white border-2 border-blue-200 text-blue-600'}`}
                    style={item.highlight ? { boxShadow: '0 0 12px rgba(0,102,204,0.4)' } : {}}
                  >
                    {item.year.slice(2)}
                  </div>
                  <div className={`flex-1 card p-4 ${item.highlight ? 'border-blue-200 bg-blue-50/40' : ''}`}>
                    <span className="text-xs font-bold text-blue-600 mb-1 block">{item.year}</span>
                    <p className={`text-sm ${item.highlight ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{item.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA — Section 5: Video */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="ai"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto"
          >
            <h2 className="section-heading mb-4">{t('about.ctaTitle', "Qo'shiling Bizga")}</h2>
            <p className="text-slate-500 mb-8">{t('about.ctaSubtitle', "Kelajakni qurishga tayyor bo'lsangiz, ariza topshiring.")}</p>
            <Link to="/application" className="btn-primary text-base px-10 py-3.5 shadow-glow">
              {t('nav.application', 'Ariza Topshirish')} <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
