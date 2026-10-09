import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { newsAPI } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowLeft, FiCalendar, FiUser, FiEye, FiTag } from 'react-icons/fi';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { getImageUrl } from '../utils/image';

export default function NewsDetailPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { data, isLoading } = useQuery({ queryKey: ['news-item', id], queryFn: () => newsAPI.getById(id) });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  const news = data?.data?.data;
  if (!news) return <div className="text-center py-32 text-slate-400">{t('news.notFound', 'Yangilik topilmadi')}</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Banner with Video */}
      <div className="relative w-full h-72 md:h-96 bg-slate-900 overflow-hidden">
        <SectionVideoBackground category="campus" opacity="opacity-30" theme="hero" />
        {news.coverImage && (
          <img src={getImageUrl(news.coverImage)} alt={news.title} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      <section className="relative overflow-hidden py-10 bg-slate-50/30">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto">
          <Link to="/news" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-sm mb-6 transition-colors">
            <FiArrowLeft size={16} /> {t('news.back', 'Yangiliklarga qaytish')}
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge-blue capitalize">{news.category}</span>
            {news.tags?.map((tagItem) => (
              <span key={tagItem} className="badge bg-slate-100 text-slate-600 flex items-center gap-1">
                <FiTag size={10} /> {tagItem}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold font-display text-slate-900 leading-tight mb-4">{news.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <FiCalendar size={14} />
              {news.publishedAt ? new Date(news.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : 'uz-UZ') : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <FiUser size={14} /> {news.authorName || news.author || 'NIS AI School'}
            </span>
            <span className="flex items-center gap-1.5">
              <FiEye size={14} /> {news.views || 0} {t('news.views', "ko'rish")}
            </span>
          </div>

          {news.shortDescription && (
            <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium">{news.shortDescription}</p>
          )}

          {news.content && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-base">
              {news.content}
            </div>
          )}
        </div>
      </div>
    </section>
  </div>
);
}
