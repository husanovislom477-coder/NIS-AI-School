import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiUserCheck, FiUserX, FiShield, FiX, FiCheck } from 'react-icons/fi';
import { adminAPI } from '../../api';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => adminAPI.getUsers({ search, role: roleFilter, page, limit: 10 }),
  });

  const users = data?.data?.data || [];
  const total = data?.data?.total || 0;
  const pages = data?.data?.pages || 1;

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      toast.success("Foydalanuvchi ma'lumotlari yangilandi!");
      qc.invalidateQueries(['admin-users']);
      setEditUser(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Xatolik yuz berdi'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => {
      toast.success("Foydalanuvchi o'chirildi!");
      qc.invalidateQueries(['admin-users']);
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Xatolik yuz berdi'),
  });

  const handleToggleStatus = (u) => {
    updateMut.mutate({
      id: u._id || u.id,
      data: { isActive: !u.isActive },
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-400">Jami {total} ta ro'yxatdan o'tgan foydalanuvchi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Ism, familiya yoki email..."
            className="input-field pl-10 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field max-w-[160px] text-sm"
        >
          <option value="">Barcha rollar</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Foydalanuvchi</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Telefon</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Rol</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Holat</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Ro'yxatdan o'tgan</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Foydalanuvchi topilmadi
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                          {u.firstName?.[0]}{u.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.firstName} {u.lastName}</p>
                          {u.patronymic && <p className="text-xs text-slate-400">{u.patronymic}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">{u.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={u.role === 'admin' ? 'badge-blue font-bold' : 'badge-gray'}>
                        {u.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title="Holatni almashtirish"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {u.isActive ? <FiUserCheck size={12} /> : <FiUserX size={12} />}
                        {u.isActive ? 'Faol' : 'Bloklangan'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('uz-UZ') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditUser(u)}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title="O'chirish"
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
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                p === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Edit Role Modal */}
      <AnimatePresence>
        {editUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setEditUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 font-display flex items-center gap-2">
                  <FiShield className="text-blue-600" /> Rolni o'zgartirish
                </h3>
                <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600">
                  <FiX size={18} />
                </button>
              </div>

              <p className="text-sm text-slate-600 mb-4">
                Foydalanuvchi: <span className="font-semibold text-slate-900">{editUser.firstName} {editUser.lastName}</span>
              </p>

              <div className="space-y-3 mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Tizim roli</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditUser({ ...editUser, role: 'user' })}
                    className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${
                      editUser.role === 'user'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUser({ ...editUser, role: 'admin' })}
                    className={`p-3 rounded-xl border text-sm font-medium text-center transition-all ${
                      editUser.role === 'admin'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 text-slate-600"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={() => updateMut.mutate({ id: editUser._id || editUser.id, data: { role: editUser.role } })}
                  disabled={updateMut.isPending}
                  className="flex-1 btn-primary justify-center text-sm py-2.5"
                >
                  {updateMut.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10"
            >
              <h3 className="font-bold text-slate-900 mb-2">Foydalanuvchini o'chirish</h3>
              <p className="text-sm text-slate-500 mb-6">
                <span className="font-semibold text-slate-800">{deleteTarget.firstName} {deleteTarget.lastName}</span> hisobini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 text-slate-600"
                >
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
