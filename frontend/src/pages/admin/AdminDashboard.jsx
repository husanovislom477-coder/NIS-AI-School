import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../api';
import { FiMapPin, FiUsers, FiAward, FiFileText, FiCalendar, FiUser, FiArrowRight, FiTrendingUp } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    purple: 'from-purple-500 to-purple-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    rose: 'from-rose-500 to-rose-700',
    teal: 'from-teal-500 to-teal-700',
  };
  return (
    <motion.div whileHover={{ y: -3, scale: 1.02 }} className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold font-display text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      {to && (
        <Link to={to} className="mt-4 flex items-center gap-1 text-xs font-medium text-blue-600 hover:gap-2 transition-all">
          Boshqarish <FiArrowRight size={12} />
        </Link>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminAPI.getStats });
  const stats = data?.data?.data;

  const cards = stats ? [
    { icon: FiMapPin, label: 'Filiallar', value: stats.branches, color: 'blue', to: '/admin/branches' },
    { icon: FiUsers, label: "O'qituvchilar", value: stats.teachers, color: 'purple', to: '/admin/teachers' },
    { icon: FiAward, label: 'Talabalar & IELTS', value: stats.students, color: 'emerald', to: '/admin/students' },
    { icon: FiFileText, label: 'Arizalar', value: stats.applications?.total || 0, sub: `${stats.applications?.new || 0} ta yangi ariza`, color: 'teal', to: '/admin/applications' },
    { icon: FiFileText, label: 'Yangiliklar', value: stats.news?.total || 0, sub: `${stats.news?.published || 0} nashr`, color: 'amber', to: '/admin/news' },
    { icon: FiCalendar, label: 'Tadbirlar', value: stats.events?.total || 0, sub: `${stats.events?.published || 0} nashr`, color: 'rose', to: '/admin/events' },
    { icon: FiUser, label: 'Foydalanuvchilar', value: stats.users, color: 'blue', to: '/admin/users' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">NIS AI School umumiy statistikasi</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-5 h-32 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c) => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      <div className="mt-8 card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp size={18} className="text-blue-500" />
          <h2 className="font-bold text-slate-900">Tezkor havolalar</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ['/admin/branches', 'Filial qo\'sh', FiMapPin],
            ['/admin/teachers', "O'qituvchi qo'sh", FiUsers],
            ['/admin/students', 'Talaba qo\'sh', FiAward],
            ['/admin/news', 'Yangilik qo\'sh', FiFileText],
            ['/admin/events', 'Tadbir qo\'sh', FiCalendar],
            ['/admin/users', 'Foydalanuvchilar', FiUser],
          ].map(([to, label, Icon]) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all text-center">
              <Icon size={20} className="text-blue-500" />
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
