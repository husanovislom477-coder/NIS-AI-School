import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome } from 'react-icons/fi';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <SectionVideoBackground category="ambient" opacity="opacity-25" theme="hero" />
      <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
        <SectionAnimatedBackground variant="network" />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center relative z-10 card-elevated p-10 max-w-md bg-white/95 backdrop-blur-md">
        <div className="text-8xl font-bold font-display text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sahifa topilmadi</h1>
        <p className="text-slate-500 mb-8">Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.</p>
        <Link to="/" className="btn-primary justify-center shadow-glow">
          <FiHome size={16} /> Bosh sahifaga qaytish
        </Link>
      </motion.div>
    </div>
  );
}
