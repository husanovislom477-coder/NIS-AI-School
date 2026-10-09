import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studentAPI } from '../api';
import { FiArrowLeft, FiAward, FiExternalLink, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { useLanguage } from '../context/LanguageContext';
import { getImageUrl } from '../utils/image';

export default function StudentDetailPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['student', id], queryFn: () => studentAPI.getById(id) });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  const student = data?.data?.data;
  if (!student) return <div className="text-center py-32 text-slate-400">{t('results.notFound', 'Talaba topilmadi')}</div>;

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 to-blue-900 text-white pt-24 sm:pt-28 pb-14 px-4">
        <PageHeroBackground category="ambient" variant="shimmer" opacity="opacity-25" />
        <div className="container-custom relative z-10">
          <Link to="/students" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-8 transition-colors">
            <FiArrowLeft size={16} /> {t('common.back', 'Orqaga')}
          </Link>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <img
              src={getImageUrl(student.photo) || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=1e40af&color=fff&size=200`}
              alt={student.firstName}
              className="w-28 h-28 rounded-2xl object-cover border-4 border-white/30 shadow-lg"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=1e40af&color=fff&size=200`; }}
            />
            <div>
              <h1 className="text-3xl font-bold font-display">{student.firstName} {student.lastName}</h1>
              <p className="text-blue-200 mt-1">{student.grade} {t('results.gradeSuffix', 'sinf')}</p>
              {student.university && (
                <p className="text-emerald-300 font-semibold mt-1 flex items-center gap-1.5">
                  <FiBookOpen size={15} /> {student.university}
                </p>
              )}
              {student.startup && (
                <p className="text-yellow-300 text-sm mt-1 flex items-center gap-1.5">
                  <FiTrendingUp size={15} /> {student.startup}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden py-12 bg-slate-50/50">
        <SectionAnimatedBackground variant="network" />
        <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {student.biography && (
              <div className="card p-6">
                <h2 className="text-lg font-bold font-display text-slate-900 mb-3">{t('results.biography', 'Biografiya')}</h2>
                <p className="text-slate-600 leading-relaxed">{student.biography}</p>
              </div>
            )}

            {student.awards?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2"><FiAward className="text-yellow-500" /> {t('results.awards', 'Mukofotlar')}</h2>
                <div className="space-y-3">
                  {student.awards.map((a, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{a.title}</p>
                        <p className="text-xs text-slate-500">{a.year} • {a.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {student.projects?.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-bold font-display text-slate-900 mb-4">{t('results.projects', 'Loyihalar')}</h2>
                <div className="space-y-4">
                  {student.projects.map((p, i) => (
                    <div key={i} className="p-4 border border-slate-200 rounded-xl">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-slate-900">{p.title}</h3>
                        {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 flex-shrink-0"><FiExternalLink size={16} /></a>}
                      </div>
                      {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
                      {p.year && <p className="text-xs text-slate-400 mt-2">{p.year}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {student.results?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4">{t('results.testScores', 'Test Natijalari')}</h3>
                <div className="space-y-3">
                  {student.results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <span className="font-semibold text-slate-700 text-sm">{r.type}</span>
                      <span className="font-bold text-blue-700 text-lg">{r.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {student.achievements?.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4">{t('results.achievements', 'Yutuqlar')}</h3>
                <div className="space-y-2">
                  {student.achievements.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-blue-500">✓</span> {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  </div>
);
}
