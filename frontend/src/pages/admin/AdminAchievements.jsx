import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiAward, FiGlobe, FiCheckCircle, FiFileText } from 'react-icons/fi';
import AdminDataTable from '../../components/admin/AdminDataTable';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { achievementAPI, branchAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import { getImageUrl } from '../../utils/image';

const achievementTransFields = [
  { key: 'title', label: 'Yutuq Nomi / Sarlavhasi (Title)', type: 'text', placeholder: 'e.g. Gold Medal at IOI 2026' },
  { key: 'description', label: 'Tavsif va Izoh (Description / Breakdown)', type: 'textarea', rows: 3, placeholder: 'Detailed score breakdown or accomplishment description...' },
];

function AchievementModal({ item, onClose, branches = [], onSave, loading }) {
  const isEditing = Boolean(item && (item._id || item.id));

  const [form, setForm] = useState({
    studentName: item?.studentName || '',
    category: item?.category || 'Olympiad',
    achievementType: item?.achievementType || item?.examType || 'IOI',
    score: item?.score || item?.award || '',
    award: item?.award || item?.score || '',
    title: item?.title || '',
    branchId: item?.branchId?.id || item?.branchId?._id || item?.branchId || '',
    year: item?.year || 2026,
    description: item?.description || '',
    published: item?.published !== false,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [certFile, setCertFile] = useState(null);

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
          };
        }
      });
    }
    if (!dict.en && (item?.title || item?.description)) {
      dict.en = { title: item?.title || '', description: item?.description || '' };
    }
    if (!dict.uz && (item?.title || item?.description)) {
      dict.uz = { title: item?.title || '', description: item?.description || '' };
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
    if (!form.studentName.trim() || !form.award.trim()) {
      toast.error("O'quvchi ismi va natija/sovrin kiritilishi shart.");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      fd.append(k, v);
    });
    fd.append('translations', JSON.stringify(translations));

    if (photoFile) fd.append('photo', photoFile);
    if (certFile) fd.append('certificatePhoto', certFile);

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
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiAward size={18} />
            </div>
            <div>
              <h3 className="font-bold font-display text-slate-900 text-base">
                {isEditing ? 'Yutuqni Tahrirlash' : 'Yangi Yutuq Qo‘shish'}
              </h3>
              <p className="text-[11px] text-slate-400">O'quvchi yutug'i, olimpiada, sertifikat yoki universitet qabuli</p>
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
          {/* Multilingual Translation Tabs */}
          <MultilingualTranslationTabs
            fields={achievementTransFields}
            translations={translations}
            onChange={handleTranslationChange}
          />

          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Yutuq Tafsilotlari & O'quvchi
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">O'quvchi to'liq ismi *</label>
                <input
                  required
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  placeholder="Masalan: Kamila Karimova"
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label">Yutuq Toifasi (Category) *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="Olympiad">Xalqaro Fan Olimpiadasi (Olympiad)</option>
                  <option value="Standardized Tests">Xalqaro Imtihonlar (IELTS / SAT / HSK)</option>
                  <option value="University Admission">Top Universitet Qabuli (Admission)</option>
                  <option value="Academic Award">Akademik Mukofot (Academic Award)</option>
                  <option value="AI / Innovation">AI va Dasturiy Loyiha G'olibi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Yutuq / Imtihon Turi *</label>
                <select
                  value={form.achievementType}
                  onChange={(e) => setForm({ ...form, achievementType: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="IOI">IOI (Informatika)</option>
                  <option value="IAIO">IAIO (AI Olimpiada)</option>
                  <option value="IELTS">IELTS</option>
                  <option value="SAT">SAT</option>
                  <option value="HSK">HSK</option>
                  <option value="MIT">MIT Admission</option>
                  <option value="Stanford">Stanford Admission</option>
                  <option value="Harvard">Harvard Admission</option>
                  <option value="Respublika">Respublika Olimpiadasi</option>
                  <option value="Hackathon">Xalqaro Hakaton</option>
                </select>
              </div>

              <div>
                <label className="label">Natija / Ball / Sovrin *</label>
                <input
                  required
                  value={form.award}
                  onChange={(e) => setForm({ ...form, award: e.target.value, score: e.target.value })}
                  placeholder="Oltin medal, 8.5, 1560..."
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="label">O'quv Yili</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="input-field text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Kampus / Filial</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="input-field text-xs"
                >
                  <option value="">Barcha filiallar / Maktab bo'yicha</option>
                  {branches.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Nashr Holati (Status)</label>
                <select
                  value={form.published ? 'true' : 'false'}
                  onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}
                  className="input-field text-xs"
                >
                  <option value="true">Nashr etilgan (Public)</option>
                  <option value="false">Qoralama (Draft)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="label">O'quvchi fotosurati</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                  className="input-field py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="label">Sertifikat / Diplom fotosurati</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCertFile(e.target.files[0])}
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

export default function AdminAchievements() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ category: '', published: '' });

  const [modalItem, setModalItem] = useState(null); // null | 'new' | item
  const [deleteTarget, setDeleteTarget] = useState(null);

  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-achievements', search, page, pageSize, filters],
    queryFn: () =>
      achievementAPI.getAll({
        search,
        page,
        limit: pageSize,
        category: filters.category,
        published: filters.published,
      }),
  });

  const { data: branchesData } = useQuery({
    queryKey: ['admin-branches-lookup'],
    queryFn: () => branchAPI.getAll({ limit: 50 }),
  });

  const branches = branchesData?.data?.data || [];
  const items = data?.data?.data || [];
  const total = data?.data?.total || 0;

  // Mutations
  const saveMut = useMutation({
    mutationFn: async (formData) => {
      if (modalItem && modalItem !== 'new') {
        return achievementAPI.update(modalItem._id || modalItem.id, formData);
      }
      return achievementAPI.create(formData);
    },
    onSuccess: () => {
      toast.success(modalItem === 'new' ? 'Yutuq muvaffaqiyatli yaratildi!' : 'Yutuq yangilandi!');
      qc.invalidateQueries({ queryKey: ['admin-achievements'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Xatolik yuz berdi');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => achievementAPI.delete(id),
    onSuccess: () => {
      toast.success("Yutuq muvaffaqiyatli o'chirildi!");
      qc.invalidateQueries({ queryKey: ['admin-achievements'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Xatolik'),
  });

  const columns = [
    {
      key: 'photo',
      label: 'Foto',
      sortable: false,
      render: (_, r) => (
        <img
          src={getImageUrl(r.studentPhoto || r.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.studentName || 'Student')}&background=0066cc&color=fff&size=80`}
          alt=""
          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.studentName || 'Student')}&background=0066cc&color=fff&size=80`;
          }}
        />
      ),
    },
    {
      key: 'studentName',
      label: "O'quvchi",
      render: (v, r) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{v}</p>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">{r.title || r.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Toifa',
      render: (v) => (
        <span className="badge-blue text-[10px] font-bold">
          {v || 'Olympiad'}
        </span>
      ),
    },
    {
      key: 'award',
      label: 'Natija / Sovrin',
      render: (v, r) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-xs">
            {v || r.score || '—'}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">
            {r.achievementType || r.examType}
          </span>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Yil',
      render: (v) => <span className="font-mono text-slate-600 font-semibold">{v || 2026}</span>,
    },
    {
      key: 'published',
      label: 'Holat',
      render: (v) =>
        v !== false ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Nashr
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
            Qoralama
          </span>
        ),
    },
  ];

  const filterOptions = [
    {
      key: 'category',
      label: 'Toifa',
      options: [
        { label: 'Olimpiada', value: 'Olympiad' },
        { label: 'Xalqaro Imtihonlar (IELTS/SAT)', value: 'Standardized Tests' },
        { label: 'Universitet Qabuli', value: 'University Admission' },
        { label: 'Akademik Mukofot', value: 'Academic Award' },
        { label: 'AI Loyihalar', value: 'AI / Innovation' },
      ],
    },
    {
      key: 'published',
      label: 'Nashr holati',
      options: [
        { label: 'Nashr etilgan', value: 'true' },
        { label: 'Qoralama', value: 'false' },
      ],
    },
  ];

  return (
    <div>
      <AdminDataTable
        title="O'quvchilar Yutuqlari Boshqaruvi (Achievements)"
        subtitle="Olimpiada sovrindorlari, IELTS 8.5+, SAT 1550+, top universitet grantlari"
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
        filterOptions={filterOptions}
        activeFilters={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        onAddNew={() => setModalItem('new')}
        onEdit={(item) => setModalItem(item)}
        onDelete={(item) => setDeleteTarget(item)}
        onBulkDelete={(ids, clearSel) => {
          if (confirm(`${ids.length} ta yutuqni o'chirishga ishonchingiz komilmi?`)) {
            Promise.all(ids.map((id) => achievementAPI.delete(id))).then(() => {
              toast.success("Tanlangan yutuqlar o'chirildi!");
              qc.invalidateQueries({ queryKey: ['admin-achievements'] });
              clearSel();
            });
          }
        }}
        exportFilename="nis_ai_school_achievements.csv"
      />

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalItem !== null && (
          <AchievementModal
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
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">O'chirishni tasdiqlang</h3>
              <p className="text-xs text-slate-500 mb-5">
                "{deleteTarget.studentName}" ning yutug'ini o'chirishni istaysizmi? Ushbu amalni qaytarib bo'lmaydi.
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
