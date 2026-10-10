import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiLayers, FiExternalLink } from 'react-icons/fi';
import AdminDataTable from '../../components/admin/AdminDataTable';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { projectAPI, branchAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/image';

const projectTransFields = [
  { key: 'title', label: 'Loyiha Nomi (Project Title)', type: 'text', placeholder: 'Autonomous Drone Swarm System' },
  { key: 'description', label: 'Loyiha Tavsifi (Description)', type: 'textarea', rows: 3, placeholder: 'Decentralized consensus protocol for GPS-denied environments...' },
  { key: 'category', label: 'Kategoriya (Category)', type: 'text', placeholder: 'Robotics & AI' },
];

function ProjectModal({ item, onClose, branches = [], onSave, loading }) {
  const isEditing = Boolean(item && (item._id || item.id));

  const [form, setForm] = useState({
    title: item?.title || '',
    studentName: item?.studentName || '',
    category: item?.category || 'AI & Machine Learning',
    projectUrl: item?.projectUrl || '',
    branchId: item?.branchId?.id || item?.branchId?._id || item?.branchId || '',
    description: item?.description || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [studentPhotoFile, setStudentPhotoFile] = useState(null);

  const [translations, setTranslations] = useState(() => {
    const dict = {};
    const rawList = item?.translations || [];
    if (Array.isArray(rawList)) {
      rawList.forEach((tr) => {
        const code = (tr.languageCode || tr.lang || '').toLowerCase();
        if (code) {
          dict[code] = {
            title: tr.title || '',
            description: tr.description || '',
            category: tr.category || '',
          };
        }
      });
    }
    if (!dict.en && item?.title) {
      dict.en = { title: item.title, description: item.description || '', category: item.category || '' };
    }
    if (!dict.uz && item?.title) {
      dict.uz = { title: item.title, description: item.description || '', category: item.category || '' };
    }
    return dict;
  });

  const handleTranslationChange = (code, key, val) => {
    setTranslations((prev) => ({
      ...prev,
      [code]: {
        ...(prev[code] || {}),
        [key]: val,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.studentName.trim()) {
      toast.error('Loyiha nomi va muallif kiritilishi shart.');
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      fd.append(k, v);
    });
    fd.append('translations', JSON.stringify(translations));

    if (imageFile) fd.append('projectImage', imageFile);
    if (studentPhotoFile) fd.append('studentPhoto', studentPhotoFile);

    onSave(fd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white rounded-3xl shadow-elevation-3 w-full max-w-2xl max-h-[92vh] overflow-y-auto z-10 border border-slate-100"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FiLayers size={18} />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                {isEditing ? 'Loyihani Tahrirlash' : 'Yangi Loyiha / Startap Qo‘shish'}
              </h3>
              <p className="text-[11px] text-slate-400">O'quvchilar tomonidan yaratilgan sun'iy intellekt va robototexnika loyihalari</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <MultilingualTranslationTabs
            fields={projectTransFields}
            translations={translations}
            onChange={handleTranslationChange}
          />

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Loyiha Ma'lumotlari
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Loyiha Nomi *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Masalan: Autonomous Drone Swarm"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label">Muallif O'quvchi *</label>
                <input
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="Masalan: Islomjon Alimov"
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Toifa (Category)</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Robotics & IoT">Robotics & IoT</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Student Startup">Student Startup</option>
                </select>
              </div>

              <div>
                <label className="label">Loyiha / GitHub Havolasi</label>
                <input
                  value={form.projectUrl}
                  onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label">Kampus</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="">Barcha filiallar</option>
                  {branches.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="label">Loyiha Rasmi (Cover Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label">Muallif Fotosurati</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStudentPhotoFile(e.target.files[0])}
                  className="input-field py-1.5 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-2 px-5 font-bold shadow-sm disabled:opacity-60"
            >
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminProjects() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [category, setCategory] = useState('');

  const [modalItem, setModalItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', search, page, pageSize, category],
    queryFn: () => projectAPI.getAll({ search, page, limit: pageSize, category }),
  });

  const { data: branchesData } = useQuery({
    queryKey: ['admin-branches-lookup'],
    queryFn: () => branchAPI.getAll({ limit: 50 }),
  });

  const branches = branchesData?.data?.data || [];
  const items = data?.data?.data || [];
  const total = data?.data?.total || 0;

  const saveMut = useMutation({
    mutationFn: async (fd) => {
      if (modalItem && modalItem !== 'new') {
        return projectAPI.update(modalItem._id || modalItem.id, fd);
      }
      return projectAPI.create(fd);
    },
    onSuccess: () => {
      toast.success(modalItem === 'new' ? 'Loyiha muvaffaqiyatli yaratildi!' : 'Loyiha yangilandi!');
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setModalItem(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Xatolik yuz berdi'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => projectAPI.delete(id),
    onSuccess: () => {
      toast.success("Loyiha muvaffaqiyatli o'chirildi!");
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Xatolik'),
  });

  const columns = [
    {
      key: 'projectImage',
      label: 'Rasm',
      sortable: false,
      render: (v) => (
        <img
          src={getImageUrl(v) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100'}
          alt=""
          className="w-12 h-10 rounded-xl object-cover border border-slate-200"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100';
          }}
        />
      ),
    },
    {
      key: 'title',
      label: 'Loyiha Nomi',
      render: (v, r) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{v}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.description}</p>
        </div>
      ),
    },
    {
      key: 'studentName',
      label: 'Muallif',
      render: (v) => <span className="font-semibold text-slate-800 text-xs">{v}</span>,
    },
    {
      key: 'category',
      label: 'Toifa',
      render: (v) => (
        <span className="badge-blue text-[10px] font-bold">
          {v || 'AI Project'}
        </span>
      ),
    },
    {
      key: 'projectUrl',
      label: 'Havola',
      sortable: false,
      render: (v) =>
        v ? (
          <a
            href={v}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 hover:underline font-mono text-[11px]"
          >
            <span>Ko'rish</span>
            <FiExternalLink size={11} />
          </a>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="O'quvchilar Loyihalari va Startaplari Boshqaruvi"
        subtitle="Maktab o'quvchilari tomonidan yaratilgan robototexnika, AI va dasturiy ta'minot loyihalari"
        data={items}
        columns={columns}
        isLoading={isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        filterOptions={[
          {
            key: 'category',
            label: 'Toifa',
            options: [
              { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
              { label: 'Robotics & IoT', value: 'Robotics & IoT' },
              { label: 'Computer Vision', value: 'Computer Vision' },
              { label: 'Student Startup', value: 'Student Startup' },
            ],
          },
        ]}
        activeFilters={{ category }}
        onFilterChange={(_, val) => { setCategory(val); setPage(1); }}
        onAddNew={() => setModalItem('new')}
        onEdit={(item) => setModalItem(item)}
        onDelete={(item) => setDeleteTarget(item)}
        exportFilename="nis_ai_school_projects.csv"
      />

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalItem !== null && (
          <ProjectModal
            item={modalItem !== 'new' ? modalItem : {}}
            branches={branches}
            onClose={() => setModalItem(null)}
            onSave={(fd) => saveMut.mutate(fd)}
            loading={saveMut.isPending}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full z-10"
            >
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">Loyihani o'chirish</h3>
              <p className="text-xs text-slate-500 mb-5">
                "{deleteTarget.title}" loyihasini o'chirishni istaysizmi? Ushbu amalni qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={() => deleteMut.mutate(deleteTarget._id || deleteTarget.id)}
                  disabled={deleteMut.isPending}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {deleteMut.isPending ? 'O‘chirilmoqda...' : 'O‘chirish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
