import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiArrowUpRight,
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      {/* Top Banner / Identity Section */}
      <div className="bg-slate-800/80 border-b border-slate-700/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/50">
                  Digital Profile
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  NIS AI School Platform
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                NIS AI School
              </h3>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                {t('home.heroSubtitle', 'Elite preparation for IOI, IAIO, IELTS, SAT and world-class universities. 3 campuses, 1,080+ students, 47 international medals.')}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 shadow-sm text-xs font-semibold transition-all"
              >
                {t('nav.about', 'About School')}
                <FiArrowUpRight size={14} className="text-slate-400" />
              </Link>
              <Link
                to="/campuses"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-school-600 hover:bg-school-500 text-white shadow-btn text-xs font-semibold transition-all hover:-translate-y-0.5"
              >
                {t('home.viewBranches', 'Explore Campuses')}
                <FiArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center shadow-btn">
                <span className="text-white font-bold font-display text-sm tracking-wide">
                  NIS
                </span>
              </div>
              <div>
                <p className="font-extrabold font-display text-white text-base leading-tight">
                  NIS AI School
                </p>
                <p className="text-xs text-blue-400 font-semibold">
                  Excellence in AI Education
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              {t('home.featuresSubtitle', 'World-class education infrastructure and individual mentorship program designed for future AI innovators.')}
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-school-600 shrink-0" size={15} />
                <span>Toshkent sh., Yunusobod tumani, Amir Temur 108</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-school-600 shrink-0" size={15} />
                <span>+998 71 200 00 55</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-school-600 shrink-0" size={15} />
                <span>info@nis-ai.edu.uz</span>
              </div>
            </div>
          </div>

          {/* Col 2: School */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 font-display">
              {t('nav.about', 'School')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-slate-300 transition-colors">
                  {t('nav.about', 'About School')}
                </Link>
              </li>
              <li>
                <Link to="/campuses" className="hover:text-slate-300 transition-colors">
                  {t('nav.campuses', 'Campuses')}
                </Link>
              </li>
              <li>
                <Link to="/teachers" className="hover:text-slate-300 transition-colors">
                  {t('nav.teachers', 'Faculty & Mentors')}
                </Link>
              </li>
              <li>
                <Link to="/timeline" className="hover:text-slate-300 transition-colors">
                  {t('nav.timeline', 'History & Timeline')}
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-slate-300 transition-colors">
                  {t('nav.achievements', 'Achievements')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Students & Projects */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 font-display">
              {t('nav.results', 'Students & Projects')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/achievements" className="hover:text-slate-300 transition-colors">
                  {t('nav.achievements', 'Achievements')}
                </Link>
              </li>
              <li>
                <Link to="/students" className="hover:text-slate-300 transition-colors">
                  {t('nav.results', 'Student Honors')}
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-slate-300 transition-colors">
                  {t('nav.projects', 'Projects')}
                </Link>
              </li>
              <li>
                <Link to="/startups" className="hover:text-slate-300 transition-colors">
                  {t('nav.startups', 'Startups')}
                </Link>
              </li>
              <li>
                <Link to="/school-life" className="hover:text-slate-300 transition-colors">
                  {t('nav.schoolLife', 'School Life')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Media & Campuses */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4 font-display">
              {t('nav.media', 'Media & Information')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/campuses" className="hover:text-slate-300 transition-colors">
                  {t('branches.title', 'Campuses')}
                </Link>
              </li>
              <li>
                <Link to="/media" className="hover:text-slate-300 transition-colors">
                  {t('nav.media', 'Media Gallery')}
                </Link>
              </li>
              <li>
                <Link to="/news" className="hover:text-slate-300 transition-colors">
                  {t('nav.news', 'News & Announcements')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-slate-300 transition-colors">
                  {t('nav.events', 'Events')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-slate-300 transition-colors">
                  {t('nav.search', 'Global Search')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} NIS AI School. {t('common.rightsReserved', 'All rights reserved.')}</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Digital Profile Live
            </span>
            <Link to="/login" className="hover:text-slate-300 transition-colors">
              {t('nav.login', 'Log In')}
            </Link>
            <Link to="/admin" className="hover:text-slate-300 transition-colors">
              {t('nav.admin', 'Admin')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
