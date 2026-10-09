import {
  FiHome,
  FiInfo,
  FiMapPin,
  FiUsers,
  FiAward,
  FiLayers,
  FiTrendingUp,
  FiActivity,
  FiImage,
  FiClock,
  FiFileText,
  FiCalendar,
  FiSearch,
  FiCheckSquare,
  FiSettings,
  FiCpu,
} from 'react-icons/fi';

/**
 * Dynamic localized public pages configuration for NIS AI School
 * Used by Desktop Page Selector, Mobile Bottom Sheet, Search, and Sitemap.
 */
export function getPublicPages(t) {
  const tr = typeof t === 'function' ? t : (k, d) => d;

  return [
    {
      path: '/',
      label: tr('nav.home', 'Home'),
      category: tr('nav.home', 'Main'),
      description: tr('home.heroSubtitle', 'Official profile platform and key performance indicators'),
      icon: FiHome,
      badge: tr('nav.home', 'Home'),
    },
    {
      path: '/about',
      label: tr('nav.about', 'About School'),
      category: tr('nav.home', 'Main'),
      description: tr('about.mission', 'Mission, international curriculum standards, and vision'),
      icon: FiInfo,
    },
    {
      path: '/campuses',
      label: tr('nav.campuses', 'Campuses'),
      category: tr('nav.home', 'Main'),
      description: tr('branches.subtitle', 'Tashkent, Samarkand and Bukhara modern smart campuses'),
      icon: FiMapPin,
      badge: '3',
    },
    {
      path: '/teachers',
      label: tr('nav.teachers', 'Faculty & Mentors'),
      category: tr('nav.teachers', 'Academic'),
      description: tr('teachers.subtitle', 'MIT, Stanford and ETH Zürich alumni faculty'),
      icon: FiUsers,
    },
    {
      path: '/ielts',
      label: tr('results.title', 'IELTS & Exam Results'),
      category: tr('nav.teachers', 'Academic'),
      description: tr('results.subtitle', 'IELTS 7.5 - 8.5 and SAT 1500+ top achievements'),
      icon: FiAward,
      badge: '8.5',
    },
    {
      path: '/students',
      label: tr('nav.results', 'Student Honors'),
      category: tr('nav.teachers', 'Academic'),
      description: tr('results.subtitle', 'International Olympiad winners and scholarship recipients'),
      icon: FiUsers,
    },
    {
      path: '/achievements',
      label: tr('nav.achievements', 'School Achievements'),
      category: tr('nav.teachers', 'Academic'),
      description: tr('results.title', '47 gold & silver medals at international Olympiads'),
      icon: FiAward,
      badge: '47',
    },
    {
      path: '/projects',
      label: tr('nav.projects', 'AI Projects'),
      category: tr('nav.projects', 'Innovation'),
      description: tr('projects.subtitle', 'Autonomous robotics, healthcare AI, and computer vision'),
      icon: FiLayers,
    },
    {
      path: '/startups',
      label: tr('nav.startups', 'Student Startups'),
      category: tr('nav.projects', 'Innovation'),
      description: tr('projects.subtitle', 'Applied tech ventures founded by our students'),
      icon: FiTrendingUp,
    },
    {
      path: '/school-life',
      label: tr('nav.schoolLife', 'School Life'),
      category: tr('nav.projects', 'Innovation'),
      description: tr('home.featuresSubtitle', 'GPU supercomputing clusters, hackathons, and sports clubs'),
      icon: FiActivity,
    },
    {
      path: '/media',
      label: tr('nav.media', 'Media Gallery'),
      category: tr('nav.news', 'Information'),
      description: tr('nav.media', 'Photos and videos from laboratories and competitions'),
      icon: FiImage,
    },
    {
      path: '/timeline',
      label: tr('nav.timeline', 'History & Timeline'),
      category: tr('nav.news', 'Information'),
      description: tr('nav.timeline', 'Founding story and milestones of NIS AI School'),
      icon: FiClock,
    },
    {
      path: '/news',
      label: tr('nav.news', 'News & Press'),
      category: tr('nav.news', 'Information'),
      description: tr('news.subtitle', 'Latest announcements, partnerships, and achievements'),
      icon: FiFileText,
    },
    {
      path: '/events',
      label: tr('nav.events', 'Upcoming Events'),
      category: tr('nav.news', 'Information'),
      description: tr('nav.events', 'Open doors days, admission tests, and international hackathons'),
      icon: FiCalendar,
    },
    {
      path: '/results',
      label: tr('results.title', 'Exam & IELTS Results'),
      category: tr('nav.teachers', 'Academic'),
      description: tr('results.subtitle', 'Official verified IELTS 8.5 and SAT 1560 student benchmarks'),
      icon: FiAward,
      badge: 'IELTS/SAT',
    },
    {
      path: '/ai-agent',
      label: 'NIS AI AGENT',
      category: tr('nav.settings', 'Services'),
      description: tr('aiAgent.desc', 'Official intelligent school guide powered by database knowledge'),
      icon: FiCpu,
      badge: 'Live',
      isPrimary: true,
    },
    {
      path: '/search',
      label: tr('nav.search', 'Global Search'),
      category: tr('nav.settings', 'Services'),
      description: tr('nav.search', 'Search across teachers, campuses, news, and projects'),
      icon: FiSearch,
    },
    {
      path: '/application',
      label: tr('nav.application', 'Admissions Portal'),
      category: tr('nav.settings', 'Services'),
      description: tr('application.subtitle', 'Online application for 2026-2027 academic admissions'),
      icon: FiCheckSquare,
      badge: '2026-2027',
      isPrimary: true,
    },
    {
      path: '/about#contact',
      label: tr('nav.contact', 'Contact Us'),
      category: tr('nav.settings', 'Services'),
      description: tr('nav.contact', 'Official campus contacts, email and hotline information'),
      icon: FiMapPin,
    },
    {
      path: '/settings',
      label: tr('nav.settings', 'Settings'),
      category: tr('nav.settings', 'Services'),
      description: tr('settings.subtitle', 'Manage language, name, and security preferences'),
      icon: FiSettings,
    },
  ];
}

export function getPageCategories(t) {
  const tr = typeof t === 'function' ? t : (k, d) => d;
  return [
    tr('common.all', 'All'),
    tr('nav.home', 'Main'),
    tr('nav.teachers', 'Academic'),
    tr('nav.projects', 'Innovation'),
    tr('nav.news', 'Information'),
    tr('nav.settings', 'Services'),
  ];
}

// Fallback static publicPages for backward compatibility
export const publicPages = getPublicPages((_, d) => d);
export const pageCategories = ['All', 'Main', 'Academic', 'Innovation', 'Information', 'Services'];
