import { Container, Card, Badge, Button } from '../components/ui';
import { FiSmile, FiActivity, FiCpu, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';

export default function SchoolLifePage() {
  return (
    <div>
      {/* Hero — Video + Canvas */}
      <div className="page-hero">
        <PageHeroBackground category="campus" variant="shimmer" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiSmile size={13} /> Muhit & Madaniyat
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            Maktab Hayoti
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-2xl mx-auto"
          >
            Zamonaviy robototexnika laboratoriyalari, GPU klasterlari, ilmiy to'garaklar va sport tadbirlari bilan boy muhit
          </motion.p>
        </div>
      </div>

      {/* Facilities & Clubs Grid — Section 1: Animated Shimmer */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden">
        <SectionAnimatedBackground variant="shimmer" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card variant="bordered" padding="lg" hover className="h-full bg-white/90 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                  <FiCpu size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">GPU & AI Klaster</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O'quvchilar o'z LLM va kompyuter ko'rish modellarini o'qitishlari uchun NVIDIA A100 serverlari.
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card variant="bordered" padding="lg" hover className="h-full bg-white/90 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                  <FiActivity size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">Hackathonlar</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Har chorakda o'tkaziladigan 24 soatlik xakatonlar va xalqaro tanlovlarga tayyorgarlik.
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <Card variant="bordered" padding="lg" hover className="h-full bg-white/90 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                  <FiBookOpen size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">Kutubxona & Co-working</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24/7 ochiq ilmiy resurslar, jahon adabiyoti va erkin fikrlash makoni.
                </p>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <Card variant="bordered" padding="lg" hover className="h-full bg-white/90 backdrop-blur-xs">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                  <FiSmile size={24} />
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 mb-2">Klublar & Sport</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Shaxmat, suzish, debat va robototexnika klublari orqali sog'lom va barkamol shaxs tarbiyasi.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Campus Tour & Life CTA — Section 2: Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">Campus Tour</span>
          <h2 className="section-heading mb-4">Bizning Muhitimizni O'z Ko'zingiz Bilan Ko'ring</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Filiallarimizga ochiq eshiklar kunida tashrif buyuring va laboratoriyalarimiz bilan yaqindan tanishing.
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            Qabulga ro'yxatdan o'tish <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
