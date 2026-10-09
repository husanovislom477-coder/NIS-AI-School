import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave } from 'react-icons/fi';

/**
 * Generic CRUD table for admin pages.
 * Props:
 *  - title: string
 *  - queryKey: string
 *  - fetchFn: (params) => Promise
 *  - deleteFn: (id) => Promise
 *  - columns: Array<{ key, label, render? }>
 *  - FormComponent: React component for add/edit form
 *  - createFn: (data) => Promise
 *  - updateFn: (id, data) => Promise
 */
export default function AdminCRUD({
  title, queryKey, fetchFn, deleteFn,
  columns, FormComponent, createFn, updateFn
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | item(for edit)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, search, page],
    queryFn: () => fetchFn({ search, page, limit: 10 }),
  });

  const items = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;

  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn(id),
    onSuccess: () => { toast.success("O'chirildi!"); qc.invalidateQueries([queryKey]); setDeleteTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  const saveMut = useMutation({
    mutationFn: async (formData) => {
      if (modal && modal !== 'create') {
        return updateFn(modal._id || modal.id, formData);
      }
      return createFn(formData);
    },
    onSuccess: () => {
      toast.success(modal === 'create' ? 'Yaratildi!' : 'Yangilandi!');
      qc.invalidateQueries([queryKey]);
      setModal(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Xatolik'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">{title}</h1>
          <p className="text-sm text-slate-400">{total} ta yozuv</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary text-sm">
          <FiPlus size={16} /> Yangi qo'shish
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Qidirish..."
          className="input-field pl-10 text-sm"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((c) => (
                  <th key={c.key} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {c.label}
                  </th>
                ))}
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-4">
                        <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      </td>
                    ))}
                    <td className="px-5 py-4"><div className="h-4 bg-slate-200 rounded animate-pulse w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center py-12 text-slate-400">
                    Hech narsa topilmadi
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className="px-5 py-3.5 text-slate-700">
                        {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${p === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
            >{p}</button>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="font-bold text-slate-900 font-display">
                  {modal === 'create' ? `Yangi ${title}` : `Tahrirlash`}
                </h2>
                <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                  <FiX size={18} />
                </button>
              </div>
              <div className="p-6">
                <FormComponent
                  initialData={modal !== 'create' ? modal : {}}
                  onSubmit={(data) => saveMut.mutate(data)}
                  loading={saveMut.isPending}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
            >
              <h3 className="font-bold text-slate-900 mb-2">O'chirishni tasdiqlang</h3>
              <p className="text-sm text-slate-500 mb-6">Bu yozuvni o'chirishni istaysizmi? Bu amalni qaytarib bo'lmaydi.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">
                  Bekor qilish
                </button>
                <button
                  onClick={() => deleteMut.mutate(deleteTarget._id || deleteTarget.id)}
                  disabled={deleteMut.isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteMut.isPending ? 'Yuklanmoqda...' : "O'chirish"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
