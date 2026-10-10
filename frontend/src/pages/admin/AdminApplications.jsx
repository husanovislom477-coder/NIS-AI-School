import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationAPI } from '../../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEye, FiCheck, FiX, FiUser, FiPhone, FiMail,
  FiCalendar, FiMapPin, FiAward, FiClock, FiFileText,
  FiMessageSquare, FiTrash2
} from 'react-icons/fi';
import AdminDataTable from '../../components/admin/AdminDataTable';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminApplications() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', page, pageSize, search, status],
    queryFn: () =>
      applicationAPI.getAllAdmin({
        page,
        limit: pageSize,
        search,
        status: status || undefined,
      }),
  });

  const applications = data?.data?.data || [];
  const total = data?.data?.total || 0;

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status, internalNotes }) =>
      applicationAPI.updateStatus(id, { status, internalNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Ariza holati va eslatma muvaffaqiyatli saqlandi!');
      setSelectedApp(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status || 'NEW');
    setInternalNotes(app.internalNotes || '');
  };

  const handleSaveStatus = () => {
    if (!selectedApp) return;
    statusMutation.mutate({
      id: selectedApp._id || selectedApp.id,
      status: newStatus,
      internalNotes,
    });
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ACCEPTED':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Qabul qilindi
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Suhbatda
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Rad etildi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Yangi
          </span>
        );
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Arizachi',
      render: (v, item) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{v}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Telefon',
      render: (v) => <span className="font-mono text-xs text-slate-700 font-semibold">{v || '—'}</span>,
    },
    {
      key: 'selectedProgram',
      label: 'Dastur',
      render: (v) => (
        <span className="badge-blue text-[10px] font-bold">
          {v || 'AI & Data Science'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Holat',
      render: (v) => getStatusBadge(v),
    },
    {
      key: 'createdAt',
      label: 'Sana',
      render: (v) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {v ? new Date(v).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  const filterOptions = [
    {
      key: 'status',
      label: 'Holat',
      options: [
        { label: 'Yangi (New)', value: 'NEW' },
        { label: 'Suhbatda (Reviewing)', value: 'REVIEWING' },
        { label: 'Qabul qilindi (Accepted)', value: 'ACCEPTED' },
        { label: 'Rad etildi (Rejected)', value: 'REJECTED' },
      ],
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="Qabul Arizalari Boshqaruvi (Admissions)"
        subtitle="NIS AI School 2026-2027 o'quv yili uchun barcha qabul arizalari"
        data={applications}
        columns={columns}
        isLoading={isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filterOptions={filterOptions}
        activeFilters={{ status }}
        onFilterChange={(_, val) => { setStatus(val); setPage(1); }}
        onEdit={(item) => handleOpenModal(item)}
        exportFilename="nis_ai_school_applications.csv"
      />

      {/* View & Update Status Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setSelectedApp(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl shadow-elevation-3 w-full max-w-xl max-h-[92vh] overflow-y-auto z-10 border border-slate-100"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FiUser size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold font-display text-slate-900 text-base">
                      {selectedApp.fullName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Ariza raqami: {selectedApp.applicationNumber || `#NIS-${selectedApp.id?.slice(-6) || '2026'}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Applicant Info Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Telefon</span>
                    <p className="font-semibold text-slate-800 font-mono mt-0.5">{selectedApp.phone || '—'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Email</span>
                    <p className="font-semibold text-slate-800 font-mono mt-0.5 truncate">{selectedApp.email || '—'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tanlangan Dastur</span>
                    <p className="font-semibold text-blue-700 mt-0.5">{selectedApp.selectedProgram || 'AI & Data Science'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Topshirilgan Sana</span>
                    <p className="font-semibold text-slate-800 font-mono mt-0.5">
                      {selectedApp.createdAt ? new Date(selectedApp.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                {/* Message / Motivation */}
                {selectedApp.message && (
                  <div>
                    <label className="label flex items-center gap-1.5 text-xs">
                      <FiMessageSquare size={13} className="text-slate-500" />
                      <span>Arizachi Xabari / Motivatsion Xat</span>
                    </label>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                      {selectedApp.message}
                    </div>
                  </div>
                )}

                {/* Audit History Log */}
                {Array.isArray(selectedApp.history) && selectedApp.history.length > 0 && (
                  <div>
                    <label className="label flex items-center gap-1.5 text-xs">
                      <FiClock size={13} className="text-slate-500" />
                      <span>Ariza O'zgarishlar Tarixi (History Log)</span>
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50/70 rounded-xl border border-slate-100">
                      {selectedApp.history.map((h, i) => (
                        <div key={i} className="text-[11px] text-slate-600 flex items-center justify-between">
                          <span>
                            <strong>{h.status}</strong>: {h.note || 'Status updated'} by {h.by || 'Admin'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(h.at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Changing Form */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Holatni O'zgartirish & Ichki Eslatma
                  </h4>

                  <div>
                    <label className="label">Yangi Holat (Status)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'NEW', label: 'Yangi', color: 'border-amber-300 bg-amber-50 text-amber-800' },
                        { val: 'REVIEWING', label: 'Suhbatda', color: 'border-blue-300 bg-blue-50 text-blue-800' },
                        { val: 'ACCEPTED', label: 'Qabul qilindi', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                        { val: 'REJECTED', label: 'Rad etildi', color: 'border-rose-300 bg-rose-50 text-rose-800' },
                      ].map((st) => (
                        <button
                          key={st.val}
                          type="button"
                          onClick={() => setNewStatus(st.val)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                            newStatus === st.val
                              ? `${st.color} shadow-xs ring-2 ring-blue-500/20`
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label">Ichki Eslatma (Internal Notes)</label>
                    <textarea
                      rows={3}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Masalan: 12-oktyabr soat 14:00 ga suhbat belgilandi, imtihon natijasi tekshirildi..."
                      className="input-field text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Yopish
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={statusMutation.isPending}
                    className="btn-primary text-xs py-2 px-5 font-bold shadow-sm disabled:opacity-60"
                  >
                    {statusMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
