import { useState } from 'react';
import { Card, Badge, Button } from '../components/ui';
import { FiImage, FiVideo, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SchoolGallerySwiper from '../components/home/SchoolGallerySwiper';

const demoMedia = [
  {
    id: 1,
    type: 'photo',
    title: 'NIS AI Toshkent Asosiy Kampusi',
    category: 'Filiallar',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
    campus: 'Toshkent',
  },
  {
    id: 2,
    type: 'photo',
    title: 'GPU Superkompyuter Klasteri Laboratoriyasi',
    category: 'Laboratoriya',
    image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop&q=80',
    campus: 'Toshkent',
  },
  {
    id: 3,
    type: 'photo',
    title: "IOI va Robotika mashg'ulot jarayoni",
    category: "Mashg'ulotlar",
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
    campus: 'Namangan',
  },
];

export default function MediaPage() {
  const [tab, setTab] = useState('all');

  return (
    <div>
      {/* Hero — Video + Canvas */}
      <div className="page-hero">
        <PageHeroBackground category="campus" variant="waves" opacity="opacity-25" />

        <div className="container-custom relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/20">
              <FiImage size={13} /> Media & Galereya
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black font-display text-white mb-4 tracking-tight"
          >
            Media Markaz
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-blue-200 text-lg max-w-2xl mx-auto"
          >
            Maktab kampusi, zamonaviy auditoriyalar, tadbirlar va talabalar faoliyatidan fotolavhalar hamda videoroliklar
          </motion.p>
        </div>
      </div>

      {/* ─── INTERACTIVE SWIPER IMAGE SLIDER (SWIPER STUDIO INSPIRED) ─── */}
      <div className="bg-white border-b border-slate-100">
        <SchoolGallerySwiper showHeader={true} />
      </div>

      {/* Media Grid Section — Animated Waves */}
      <section className="py-20 bg-slate-50/50 relative overflow-hidden">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 mb-10">
            <Button
              variant={tab === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTab('all')}
            >
              Barchasi
            </Button>
            <Button
              variant={tab === 'photo' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTab('photo')}
            >
              Fotolavhalar
            </Button>
            <Button
              variant={tab === 'video' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTab('video')}
            >
              Videoroliklar
            </Button>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {demoMedia.map((m) => (
              <div key={m.id} className="card overflow-hidden group hover-lift bg-white/95 backdrop-blur-xs flex flex-row sm:flex-col transition-all duration-300">
                <div className="relative w-32 xs:w-36 sm:w-full shrink-0 aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={m.image}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <Badge variant="navy" size="sm">
                      {m.category}
                    </Badge>
                  </span>
                </div>
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 group-hover:text-school-600 transition-colors line-clamp-2 leading-snug">
                    {m.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{m.campus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Presentation Section — Video Background */}
      <section className="py-20 bg-white relative overflow-hidden">
        <SectionVideoBackground
          category="campus"
          opacity="opacity-12"
          overlayGradient="from-white/94 via-white/84 to-white/96"
        />
        <div className="container-custom text-center relative z-10 max-w-3xl mx-auto">
          <span className="badge-blue mb-3">Videoroliklar</span>
          <h2 className="section-heading mb-4">Maktabimiz Hujjatli Filmi</h2>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            O'quvchilarimiz qanday qilib IOI va IAIO musobaqalariga tayyorlanayotgani hamda
            sun'iy intellekt bo'yicha dunyo miqyosidagi ilmiy loyihalari haqidagi lavha.
          </p>
          <Link to="/application" className="btn-primary px-8 py-3 shadow-glow">
            Maktabga ariza berish <FiArrowRight className="inline ml-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
