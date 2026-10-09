import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { languageAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  FiGlobe,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiToggleLeft,
  FiToggleRight,
  FiInfo,
} from 'react-icons/fi';

export default function AdminLanguages() {
  const queryClient = useQueryClient();
  const { t, reloadLanguages } = useLanguage();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    nativeName: '',
    flag: '🌐',
    direction: 'ltr',
    isEnabled: true,
  });

  // Query all languages (including disabled)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-languages'],
    queryFn: () => languageAPI.getAll({ all: true }),
  });

  const languages = data?.data?.data || [];

  // Toggle Mutation
  const toggleMutation = useMutation({
    mutationFn: (code) => languageAPI.toggle(code),
    onSuccess: (res) => {
      toast.success(res.data?.message || t('common.success', 'Success'));
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      reloadLanguages();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('common.error', 'Error'));
    },
  });

  // Save / Update Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editingLang) {
        return languageAPI.update(editingLang.code, payload);
      }
      return languageAPI.create(payload);
    },
    onSuccess: (res) => {
      toast.success(res.data?.message || t('admin.saveSuccess', 'Saved successfully'));
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      reloadLanguages();
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('common.error', 'Error'));
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (code) => languageAPI.delete(code),
    onSuccess: (res) => {
      toast.success(res.data?.message || t('admin.deleteSuccess', 'Deleted'));
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      reloadLanguages();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('common.error', 'Error'));
    },
  });

  const openAddModal = () => {
    setEditingLang(null);
    setFormData({
      code: '',
      name: '',
      nativeName: '',
      flag: '🌐',
      direction: 'ltr',
      isEnabled: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (lang) => {
    setEditingLang(lang);
    setFormData({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag || '🌐',
      direction: lang.direction || 'ltr',
      isEnabled: lang.isEnabled !== false,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLang(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      return toast.error(t('settings.fillRequired', 'Please fill in required fields'));
    }
    saveMutation.mutate(formData);
  };

  const handleDelete = (lang) => {
    if (lang.code === 'en') {
      return toast.error('Default language (English) cannot be deleted.');
    }
    if (window.confirm(t('admin.confirmDelete', 'Are you sure you want to delete this language?'))) {
      deleteMutation.mutate(lang.code);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
            <FiGlobe className="text-school-600" />
            {t('admin.languagesTitle', 'Tillar Boshqaruvi (Languages)')}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {t('admin.languagesSubtitle', 'Platforma tillarini qo‘shish, faollashtirish va sozlash')}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="btn-primary self-start sm:self-auto flex items-center gap-2 text-xs py-2.5 px-4 shadow-sm"
        >
          <FiPlus size={16} />
          {t('admin.addLanguage', 'Yangi Til Qo‘shish')}
        </button>
      </div>

      {/* Info notice about dynamic language architecture */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-school-900">
        <FiInfo size={18} className="text-school-600 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold">{t('admin.languagesArchitectureNoticeTitle', 'Dinamik Ko‘p Tillik Tizim')}</p>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            {t('admin.languagesArchitectureNotice', 'Tizimda til o‘chirib qo‘yilganda u foydalanuvchilar Sozlamalar menyusida ko‘rinmaydi, ammo mavjud tarjimalar saqlanib qoladi. Qayta faollashtirilganda barcha tarjimalar yana ishlay boshlaydi.')}
          </p>
        </div>
      </div>

      {/* Languages Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            <div className="spinner !w-6 !h-6 mx-auto mb-2" />
            {t('common.loading', 'Yuklanmoqda...')}
          </div>
        ) : languages.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {t('common.empty', 'Tillar topilmadi.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Bayroq</th>
                  <th className="px-5 py-3.5">Kod</th>
                  <th className="px-5 py-3.5">Til Nomi</th>
                  <th className="px-5 py-3.5">Mahalliy Nomi (Native)</th>
                  <th className="px-5 py-3.5">Yo‘nalish</th>
                  <th className="px-5 py-3.5">Holati</th>
                  <th className="px-5 py-3.5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {languages.map((lang) => (
                  <tr key={lang.code} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 text-xl">{lang.flag || '🌐'}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900 uppercase">
                      {lang.code}
                      {lang.code === 'en' && (
                        <span className="ml-2 text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{lang.name}</td>
                    <td className="px-5 py-4 text-slate-600">{lang.nativeName}</td>
                    <td className="px-5 py-4 font-mono uppercase text-slate-500">{lang.direction || 'ltr'}</td>
                    <td className="px-5 py-4">
                      {lang.isEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Faol (Enabled)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          Nofaol (Disabled)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleMutation.mutate(lang.code)}
                          disabled={lang.code === 'en'}
                          title={lang.isEnabled ? 'Nofaol qilish' : 'Faollashtirish'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            lang.isEnabled
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                              : 'text-slate-400 bg-slate-100 border-slate-200 hover:bg-slate-200'
                          } ${lang.code === 'en' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {lang.isEnabled ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(lang)}
                          title="Tahrirlash"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-school-600 hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                          <FiEdit2 size={15} />
                        </button>

                        {/* Delete Button */}
                        {lang.code !== 'en' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(lang)}
                            title="O‘chirish"
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Language Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-bold font-display text-slate-900 text-base">
                  {editingLang ? 'Tilni Tahrirlash' : 'Yangi Til Qo‘shish'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                >
                  <FiX size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Til kodi (masalan: en, uz, ru, ar, tr) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().trim() })}
                    placeholder="ar"
                    disabled={!!editingLang}
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Til nomi (Inglizcha / Xalqaro) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Arabic"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mahalliy nomi (Native)
                    </label>
                    <input
                      type="text"
                      value={formData.nativeName}
                      onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
                      placeholder="العربية"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Bayroq belgisi (Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.flag}
                      onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                      placeholder="🇸🇦"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Yozuv yo‘nalishi
                    </label>
                    <select
                      value={formData.direction}
                      onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20"
                    >
                      <option value="ltr">LTR (Chapdan o‘ngga)</option>
                      <option value="rtl">RTL (O‘ngdan chapga)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="langIsEnabled"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="rounded text-school-600 focus:ring-school-500"
                  />
                  <label htmlFor="langIsEnabled" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Tilni darhol faollashtirish (Enabled)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="btn-primary px-5 py-2 text-xs font-semibold"
                  >
                    {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
