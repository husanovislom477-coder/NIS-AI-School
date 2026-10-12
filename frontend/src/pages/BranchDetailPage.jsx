import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { branchAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { FiMapPin, FiPhone, FiMail, FiClock, FiArrowLeft, FiUsers, FiCalendar } from 'react-icons/fi';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import BranchLocationMap from '../components/branch/BranchLocationMap';
import { getImageUrl } from '../utils/image';

export default function BranchDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ['branch', id],
    queryFn: () => branchAPI.getById(id),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;

  const raw = data?.data?.data || {};
  const branch = raw.branch || (raw.name ? raw : null);
  const teachers = raw.teachers || branch?.teachers || [];
  const students = raw.students || raw.results || branch?.results || [];
  const events = raw.events || branch?.events || [];

  let galleryImages = [];
  if (branch?.images) {
    if (Array.isArray(branch.images)) {
      galleryImages = branch.images;
    } else if (typeof branch.images === 'string') {
      try {
        const parsed = JSON.parse(branch.images);
        if (Array.isArray(parsed)) galleryImages = parsed;
        else galleryImages = [branch.images];
      } catch (_) {
        galleryImages = [branch.images];
      }
    }
  }

  if (!branch) return <div className="text-center py-32 text-slate-400">{t('branches.notFound', 'Filial topilmadi')}</div>;

  return (
    <div>
      {/* Hero banner with video background */}
      <div className="relative h-80 md:h-96 bg-slate-900 overflow-hidden">
        <SectionVideoBackground category="campus" opacity="opacity-25" theme="hero" />
        {(branch.coverImage || branch.image) && (
          <img src={getImageUrl(branch.coverImage || branch.image)} alt={branch.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="container-custom">
            <Link to="/branches" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors">
              <FiArrowLeft size={16} /> {t('branches.backToBranches', 'Filiallarga qaytish')}
            </Link>
            <h1 className="text-4xl font-bold font-display text-white">{branch.name}</h1>
            <div className="flex items-center gap-2 text-blue-200 mt-2">
              <FiMapPin size={14} /> {branch.location || branch.address}
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden py-12 bg-slate-50/50">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-bold font-display text-slate-900 mb-4">{t('branches.aboutCampus', 'Filial Haqida')}</h2>
              <p className="text-slate-600 leading-relaxed">{branch.description}</p>
            </div>

            {/* Images grid */}
            {galleryImages.length > 1 && (
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 mb-4">{t('branches.gallery', 'Galeriya')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.slice(0, 6).map((img, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden bg-slate-100">
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teachers */}
            {teachers.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold font-display text-slate-900">{t('nav.teachers', "O'qituvchilar")}</h2>
                  <Link to={`/teachers?branchId=${branch._id}`} className="text-sm text-blue-600 hover:underline">{t('common.viewAll', 'Barchasi')}</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {teachers.map((tItem) => (
                    <Link key={tItem._id || tItem.id} to={`/teachers/${tItem._id || tItem.id}`} className="card p-4 flex items-center gap-3 hover:border-blue-200 transition-colors">
                      <img
                        src={getImageUrl(tItem.photo) || `https://ui-avatars.com/api/?name=${tItem.firstName}+${tItem.lastName}&background=2563eb&color=fff&size=60`}
                        alt={tItem.firstName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${tItem.firstName}+${tItem.lastName}&background=2563eb&color=fff&size=60`; }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{tItem.firstName} {tItem.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{tItem.subject}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">{t('branches.contactInfo', "Aloqa Ma'lumotlari")}</h3>
              <div className="space-y-3">
                {branch.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <FiPhone size={16} className="text-blue-500 flex-shrink-0" /> {branch.phone}
                  </div>
                )}
                {branch.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <FiMail size={16} className="text-blue-500 flex-shrink-0" /> {branch.email}
                  </div>
                )}
                {branch.address && (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <FiMapPin size={16} className="text-blue-500 flex-shrink-0 mt-0.5" /> {branch.address}
                  </div>
                )}
                {branch.workingHours && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <FiClock size={16} className="text-blue-500 flex-shrink-0" /> {branch.workingHours}
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">{t('branches.statistics', 'Statistika')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><FiUsers size={14} /> {t('branches.students', "O'quvchilar")}</span>
                  <span className="font-bold text-slate-900">{branch.studentCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 flex items-center gap-2"><FiUsers size={14} /> {t('branches.teachers', "O'qituvchilar")}</span>
                  <span className="font-bold text-slate-900">{branch.teacherCount}</span>
                </div>
                {branch.established && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 flex items-center gap-2"><FiCalendar size={14} /> {t('branches.establishedYear', 'Tashkil etilgan')}</span>
                    <span className="font-bold text-slate-900">{branch.established}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── DEDICATED LOCATION & INTERACTIVE MAP SECTION ─── */}
        <BranchLocationMap branch={branch} />
      </div>
    </section>
  </div>
);
}
