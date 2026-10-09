import { Container, Card, Badge, Button } from '../components/ui';
import { FiClock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';

const timelineEvents = [
  {
    year: '2020',
    title: 'NIS AI School Tashkil Etilishi',
    desc: "Toshkent shahrida O'zbekistondagi birinchi ixtisoslashtirilgan sun'iy intellekt maktabi faoliyatiga start berildi.",
  },
  {
    year: '2022',
    title: 'Namangan Filiali Ochilishi',
    desc: "Vodiy yoshlari uchun sun'iy intellekt va robototexnika sohasida ikkinchi zamonaviy kampus ishga tushirildi.",
  },
  {
    year: '2023',
    title: 'Samarqand Kampusi va Xalqaro Hamkorlik',
    desc: "Samarqand filiali ochildi va MIT, Stanford bilan ta'lim almashinuvi memorandumlari imzolandi.",
  },
  {
    year: '2025',
    title: 'IOI va IAIO da Tarixiy Yutuqlar',
    desc: "O'quvchilarimiz xalqaro olimpiadalarda oltin va bronza medallarini qo'lga kiritib, dunyo e'tirofiga sazovor bo'ldi.",
  },
  {
    year: '2026',
    title: 'A100 GPU Klasteri va Digital Profile Platformasi',
    desc: "O'zbekistondagi eng quvvatli ta'lim superkompyuteri va maktabning yangi raqamli profili ishga tushirildi.",
  },
];

export default function TimelinePage() {
  return (
    <div>
      {/* Hero — Video + Canvas */}
      <div className="page-hero">
        <PageHeroBackground category="tech" variant="network" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiClock size={13} /> Tarix & Rivojlanish
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            Maktab Xronologiyasi
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-2xl mx-auto"
          >
            2020-yildan bugungi kungacha bosib o'tilgan shonli yo'l, yangi filiallar ochilishi va muhim burilish nuqtalari
          </motion.p>
        </div>
      </div>

      {/* Timeline Section — Animated Network */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden">
        <SectionAnimatedBackground variant="network" />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto relative pl-6 border-l-2 border-blue-200 space-y-10">
            {timelineEvents.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group card p-6 bg-white/90 backdrop-blur-xs ml-4"
              >
                {/* Dot */}
                <div className="absolute -left-[35px] top-6 w-4 h-4 rounded-full bg-white border-4 border-blue-600 group-hover:scale-125 transition-transform" />

                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {item.year}
                  </span>
                  <h3 className="text-lg font-bold font-display text-slate-900 mt-2 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision 2030 Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">Kelajak strategiyasi</span>
          <h2 className="section-heading mb-4">NIS AI 2030 Konsepsiyasi</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Yaqin 5 yilda viloyatlardagi barcha filiallar tarmog'ini 14 taga yetkazish hamda
            sun'iy intellekt bo'yicha mustaqil ilmiy tadqiqot institutini tashkil etish ko'zda tutilgan.
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            Biz bilan kelajakni quring <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
