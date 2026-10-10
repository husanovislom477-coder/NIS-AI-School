import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiActivity, FiUser, FiClock, FiFileText,
  FiFilter, FiInfo, FiCheckCircle, FiAlertTriangle, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AdminDataTable from '../../components/admin/AdminDataTable';
import { adminAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminActivityLogs() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ action: '' });
  const [detailItem, setDetailItem] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-activities', page, pageSize, search, filters.action],
    queryFn: async () => {
      const res = await adminAPI.getActivities({
        page,
        limit: pageSize,
        search,
        action: filters.action,
      });
      return res.data;
    },
  });

  const getActionBadge = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('ADD') || act.includes('REGISTER')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {action}
        </span>
      );
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('STATUS')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {action}
        </span>
      );
    }
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {action}
        </span>
      );
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {action}
      </span>
    );
  };

  const columns = [
    {
      key: 'action',
      label: 'Harakat (Action)',
      render: (item) => getActionBadge(item.action),
    },
    {
      key: 'userName',
      label: 'Foydalanuvchi / Admin',
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
            {item.userName?.[0] || 'A'}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{item.userName || 'Tizim'}</p>
            {item.userId && <p className="text-[10px] text-slate-400 font-mono">ID: {item.userId.substring(0, 8)}...</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'entity',
      label: 'Bo‘lim (Entity)',
      render: (item) => (
        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {item.entity || 'General'}
        </span>
      ),
    },
    {
      key: 'details',
      label: 'Tafsilotlar (Details)',
      render: (item) => (
        <p className="text-xs text-slate-600 truncate max-w-xs md:max-w-md font-mono" title={item.details}>
          {item.details || '—'}
        </p>
      ),
    },
    {
      key: 'createdAt',
      label: 'Vaqt (Timestamp)',
      render: (item) => {
        const d = item.createdAt ? new Date(item.createdAt) : null;
        return (
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <FiClock size={12} className="text-slate-400" />
            <span>{d ? d.toLocaleString('uz-UZ') : '—'}</span>
          </div>
        );
      },
    },
    {
      key: 'view',
      label: '',
      render: (item) => (
        <button
          onClick={() => setDetailItem(item)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-blue-600 transition-colors text-xs font-semibold cursor-pointer"
          title="Tafsilotlarni ko‘rish"
        >
          <FiInfo size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            {t('admin.activities', 'Tizim Faoliyat Jurnali (Audit Logs)')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Adminlar va foydalanuvchilar tomonidan bajarilgan barcha amallar va hodisalar ro‘yxati
          </p>
        </div>
      </div>

      {/* Table */}
      <AdminDataTable
        title="Audit Logs"
        subtitle="Harakatlar xronologiyasi"
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        total={data?.total || 0}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={setSearch}
        exportFilename="activity_logs.csv"
        idKey="id"
        filterOptions={[
          {
            label: 'Harakat turi',
            key: 'action',
            options: [
              { label: 'Barchasi', value: '' },
              { label: 'Yaratish (CREATE)', value: 'CREATE' },
              { label: 'Tahrirlash (UPDATE)', value: 'UPDATE' },
              { label: 'O‘chirish (DELETE)', value: 'DELETE' },
              { label: 'Kirish (LOGIN)', value: 'LOGIN' },
            ],
          },
        ]}
        activeFilters={filters}
        onFilterChange={setFilters}
      />

      {/* Details Modal */}
      <AnimatePresence>
        {detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <FiActivity className="text-blue-600" size={18} />
                  <h3 className="text-sm font-bold text-slate-900">Log Tafsiloti</h3>
                </div>
                <button
                  onClick={() => setDetailItem(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-5 space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Harakat</span>
                    <div className="mt-1">{getActionBadge(detailItem.action)}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Bo‘lim</span>
                    <p className="mt-1 font-bold text-slate-800">{detailItem.entity || 'General'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Foydalanuvchi</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{detailItem.userName || 'Tizim'}</p>
                  {detailItem.userId && (
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">Foydalanuvchi ID: {detailItem.userId}</p>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Vaqt</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {detailItem.createdAt ? new Date(detailItem.createdAt).toLocaleString('uz-UZ') : '—'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Batafsil ma'lumot</span>
                  <p className="text-slate-800 mt-1 whitespace-pre-wrap break-words font-mono bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                    {detailItem.details || 'Qo‘shimcha tafsilot mavjud emas'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setDetailItem(null)}
                  className="btn-secondary text-xs py-1.5 px-4 cursor-pointer"
                >
                  Yopish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
