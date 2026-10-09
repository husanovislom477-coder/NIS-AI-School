import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { teacherAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowLeft, FiAward, FiBook, FiBriefcase, FiMail, FiStar } from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { getImageUrl } from '../utils/image';

export default function TeacherDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const { data, isLoading } = useQuery({ queryKey: ['teacher', id], queryFn: () => teacherAPI.getById(id) });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  const teacher = data?.data?.data;
  if (!teacher) return <div className="text-center py-32 text-slate-400">{t('teachers.notFound', "O'qituvchi topilmadi")}</div>;

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 text-white pt-24 sm:pt-28 pb-14 px-4">
        <PageHeroBackground category="ai" variant="network" opacity="opacity-25" />
        <div className="container-custom relative z-10">
          <Link to="/teachers" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-8 transition-colors">
            <FiArrowLeft size={16} /> {t('common.back', 'Orqaga')}
          </Link>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <img
              src={getImageUrl(teacher.photo) || `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=1e40af&color=fff&size=200`}
              alt={teacher.fullName}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=1e40af&color=fff&size=200`; }}
            />
            <div>
              <h1 className="text-3xl font-bold font-display">{teacher.firstName} {teacher.lastName} {teacher.patronymic}</h1>
              <p className="text-blue-200 mt-2 text-lg">{teacher.subject}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {teacher.education && <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{teacher.education}</span>}
                {teacher.experience > 0 && <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{teacher.experience}+ {t('teachers.yearsExperience', 'yil tajriba')}</span>}
                {teacher.age && <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-full">{teacher.age} {t('teachers.yearsOld', 'yosh')}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden py-12 bg-slate-50/50">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {teacher.biography && (
              <div className="card p-6">
                <h2 className="text-lg font-bold font-display text-slate-900 mb-3 flex items-center gap-2"><FiBook size={18} className="text-blue-500" /> {t('teachers.bio', 'Biografiya')}</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{teacher.biography}</p>
              </div>
            )}

            {teacher.achievements?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2"><FiAward size={18} className="text-blue-500" /> {t('teachers.achievements', 'Yutuqlar')}</h2>
                <div className="space-y-2">
                  {teacher.achievements.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <FiStar size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-slate-700">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {teacher.certificates?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold font-display text-slate-900 mb-4">{t('teachers.certificates', 'Sertifikatlar')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {teacher.certificates.map((c, i) => (
                    <div key={i} className="p-3 border border-slate-200 rounded-xl">
                      <p className="font-semibold text-slate-900 text-sm">{c.type}</p>
                      {c.score && <p className="text-blue-600 font-bold">{c.score}</p>}
                      {c.year && <p className="text-xs text-slate-400">{c.year}-{t('common.yearShort', 'yil')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900 mb-4">{t('teachers.info', "Ma'lumot")}</h3>
              {teacher.university && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">{t('teachers.university', 'Universitet')}</p>
                  <p className="text-sm font-semibold text-slate-800">{teacher.university}</p>
                </div>
              )}
              {teacher.education && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">{t('teachers.degree', 'Daraja')}</p>
                  <p className="text-sm font-semibold text-slate-800">{teacher.education}</p>
                </div>
              )}
              {teacher.branchId && (
                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">{t('teachers.branch', 'Filial')}</p>
                  <Link to={`/branches/${teacher.branchId._id}`} className="text-sm font-semibold text-blue-600 hover:underline">
                    {teacher.branchId.shortName || teacher.branchId.name}
                  </Link>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-3">
                  <FiMail size={14} className="text-blue-500" /> {teacher.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);
}
