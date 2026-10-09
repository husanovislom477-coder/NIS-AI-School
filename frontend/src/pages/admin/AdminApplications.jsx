import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationAPI } from '../../api';
import toast from 'react-hot-toast';
import {
  FiSearch,
  FiFilter,
  FiEye,
  FiCheck,
  FiX,
  FiFileText,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiMapPin,
  FiAward,
} from 'react-icons/fi';

export default function AdminApplications() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', page, search, status],
    queryFn: () =>
      applicationAPI.getAllAdmin({
        page,
        limit: 15,
        search,
        status: status || undefined,
      }),
  });

  const applications = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status, adminNotes }) =>
      applicationAPI.updateStatus(id, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success('Ariza holati yangilandi!');
      setSelectedApp(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const handleOpenModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || '');
  };

  const handleSaveStatus = () => {
    if (!selectedApp) return;
    statusMutation.mutate({
      id: selectedApp._id || selectedApp.id,
      status: newStatus,
      adminNotes,
    });
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'APPROVED':
        return <span className="badge bg-emerald-100 text-emerald-800">Qabul qilindi</span>;
      case 'REVIEWING':
        return <span className="badge bg-blue-100 text-blue-800">Ko'rilmoqda</span>;
      case 'CONTACTED':
        return <span className="badge bg-purple-100 text-purple-800">Bog'lanildi</span>;
      case 'REJECTED':
        return <span className="badge bg-rose-100 text-rose-800">Rad etildi</span>;
      default:
        return <span className="badge bg-amber-100 text-amber-800">Kutilmoqda</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            Qabul Arizalari Boshqaruvi
          </h1>
          <p className="text-xs text-slate-500">
            NIS AI School ga topshirilgan barcha o'quvchi arizalari (Jami: {total} ta)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Ism, email, telefon yoki ariza ID..."
            className="input-field pl-10 text-xs py-2"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FiFilter size={14} className="text-slate-400" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field text-xs py-2 w-full sm:w-48"
          >
            <option value="">Barcha holatlar</option>
            <option value="PENDING">Kutilmoqda (PENDING)</option>
            <option value="REVIEWING">Ko'rilmoqda (REVIEWING)</option>
            <option value="CONTACTED">Bog'lanildi (CONTACTED)</option>
            <option value="APPROVED">Qabul qilindi (APPROVED)</option>
            <option value="REJECTED">Rad etildi (REJECTED)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="spinner mx-auto mb-2" />
            <p className="text-xs text-slate-400">Arizalar yuklanmoqda...</p>
          </div>
        ) : applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ariza ID</th>
                  <th className="py-3 px-4">Ariza beruvchi</th>
                  <th className="py-3 px-4">Filial</th>
                  <th className="py-3 px-4">Yo'nalish & Sinf</th>
                  <th className="py-3 px-4">Sana</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-school-700">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{app.applicantName}</p>
                      <p className="text-[11px] text-slate-400">{app.phone} · {app.email}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {app.campusName}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{app.direction}</p>
                      <span className="text-[11px] text-slate-400">{app.desiredGrade}-sinf ({app.applicationType})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(app.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(app)}
                        className="btn-outline py-1.5 px-3 text-xs"
                      >
                        <FiEye size={13} /> Ko'rish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-xs text-slate-400">
            Arizalar topilmadi.
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Sahifa {page} / {pages}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-outline py-1 px-3 text-xs disabled:opacity-40"
              >
                Oldingi
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
                className="btn-outline py-1 px-3 text-xs disabled:opacity-40"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold text-school-700 bg-school-50 px-2.5 py-0.5 rounded-lg border border-school-200">
                  {selectedApp.applicationNumber}
                </span>
                <h2 className="text-xl font-bold font-display text-slate-900 mt-1">
                  {selectedApp.applicantName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Application Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Telefon:</span>
                <p className="font-semibold text-slate-800">{selectedApp.phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Email:</span>
                <p className="font-semibold text-slate-800">{selectedApp.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Tug'ilgan sana & Jinsi:</span>
                <p className="font-semibold text-slate-800">{selectedApp.birthDate || 'Kiritilmagan'} ({selectedApp.gender || '—'})</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Yashash hududi:</span>
                <p className="font-semibold text-slate-800">{selectedApp.region} {selectedApp.address && `· ${selectedApp.address}`}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Ota-onasi:</span>
                <p className="font-semibold text-slate-800">{selectedApp.parentName || '—'} {selectedApp.parentPhone && `(${selectedApp.parentPhone})`}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Hozirgi maktabi & sinfi:</span>
                <p className="font-semibold text-slate-800">{selectedApp.currentSchool} ({selectedApp.currentGrade}-sinf)</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Tanlangan filial:</span>
                <p className="font-semibold text-school-700">{selectedApp.campusName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Yo'nalish va Ariza turi:</span>
                <p className="font-semibold text-slate-800">{selectedApp.direction} · {selectedApp.applicationType}</p>
              </div>
              {selectedApp.ieltsScore && (
                <div className="space-y-1">
                  <span className="text-slate-400">IELTS bali:</span>
                  <p className="font-bold text-emerald-700">{selectedApp.ieltsScore}</p>
                </div>
              )}
              {selectedApp.satScore && (
                <div className="space-y-1">
                  <span className="text-slate-400">SAT bali:</span>
                  <p className="font-bold text-blue-700">{selectedApp.satScore}</p>
                </div>
              )}
            </div>

            {selectedApp.motivation && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Motivatsion Xat:</span>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.motivation}
                </p>
              </div>
            )}

            {/* Document Attachments */}
            {selectedApp.documents && selectedApp.documents.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Yuklangan hujjatlar:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedApp.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-school-700 hover:bg-blue-100 text-xs font-medium border border-blue-200 flex items-center gap-1.5"
                    >
                      <FiFileText size={14} /> {doc.name || `Hujjat #${idx + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status Change Form */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ariza Holatini O'zgartirish
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Yangi holat</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-field text-xs py-2"
                  >
                    <option value="PENDING">Kutilmoqda (PENDING)</option>
                    <option value="REVIEWING">Ko'rilmoqda (REVIEWING)</option>
                    <option value="CONTACTED">Bog'lanildi (CONTACTED)</option>
                    <option value="APPROVED">Qabul qilindi (APPROVED)</option>
                    <option value="REJECTED">Rad etildi (REJECTED)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Ichki komissiya izohi</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Masalan: 12-oktabr suhbatga chaqirildi"
                    className="input-field text-xs py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="btn-outline py-2 px-4 text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={handleSaveStatus}
                  className="btn-primary py-2 px-5 text-xs font-bold"
                >
                  {statusMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
