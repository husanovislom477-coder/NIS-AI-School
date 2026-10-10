import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFileText, FiPlus, FiEdit2, FiTrash2, FiEye, FiDownload,
  FiUploadCloud, FiCheck, FiX, FiCopy, FiArchive, FiCalendar,
  FiUser, FiTag, FiClock, FiStar, FiGlobe, FiShare2
} from 'react-icons/fi';
import AdminDataTable from '../../components/admin/AdminDataTable';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { newsAPI } from '../../api';
import { getImageUrl } from '../../utils/image';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = [
  { value: 'all', label: 'Barcha Kategoriyalar' },
  { value: 'general', label: 'Umumiy (General)' },
  { value: 'ai_robotics', label: 'AI & Robototexnika' },
  { value: 'academic', label: 'Akademik (Academic)' },
  { value: 'olympiad', label: 'Olimpiada & G‘alabalar' },
  { value: 'research', label: 'Ilmiy Tadqiqotlar' },
  { value: 'event', label: 'Tadbir & Seminarlar' },
  { value: 'announcement', label: 'Rasmiy E’lonlar' },
];

const newsTransFields = [
  { key: 'title', label: 'Maqola Sarlavhasi (Title)', placeholder: 'Yangi xalqaro hamkorlik memorandumi...' },
  { key: 'shortDescription', label: 'Qisqa Anons (Summary / Lead)', type: 'textarea', rows: 2 },
  { key: 'content', label: 'To‘liq Matn (Full Article Content)', type: 'textarea', rows: 7 },
];

export default function AdminNews() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [previewNews, setPreviewNews] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['admin-news', page, pageSize, search, categoryFilter],
    queryFn: async () => {
      const res = await newsAPI.getAll({
        page,
        limit: pageSize,
        search,
        category: categoryFilter === 'all' ? '' : categoryFilter,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => newsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-news']);
      toast.success(t('admin.newsCreated', 'Maqola muvaffaqiyatli yaratildi!'));
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => newsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-news']);
      toast.success(t('admin.newsUpdated', 'Maqola muvaffaqiyatli yangilandi!'));
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => newsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-news']);
      toast.success(t('admin.newsDeleted', 'Maqola o‘chirildi.'));
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'O‘chirishda xatolik yuz berdi.');
    },
  });

  const handleDuplicate = async (item) => {
    try {
      const copy = {
        ...item,
        title: `${item.title} (Nusxa)`,
        status: 'draft',
        published: false,
      };
      delete copy.id;
      delete copy._id;
      await newsAPI.create(copy);
      queryClient.invalidateQueries(['admin-news']);
      toast.success('Maqola muvaffaqiyatli nusxalandi (Qoralama holatida)!');
    } catch {
      toast.error('Nusxalashda xatolik yuz berdi.');
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`${ids.length} ta maqolani o‘chirishni tasdiqlaysizmi?`)) return;
    try {
      await Promise.all(ids.map((id) => newsAPI.delete(id)));
      queryClient.invalidateQueries(['admin-news']);
      toast.success('Tanlangan maqolalar o‘chirildi!');
    } catch {
      toast.error('Ommaviy o‘chirishda xatolik yuz berdi.');
    }
  };

  const getStatusBadge = (item) => {
    const status = item.status || (item.published !== false ? 'published' : 'draft');
    if (status === 'published') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          E’lon qilingan
        </span>
      );
    }
    if (status === 'review') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Ko‘rib chiqilmoqda
        </span>
      );
    }
    if (status === 'scheduled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          Rejalashtirilgan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Qoralama (Draft)
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Maqola / Xabar',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
            <img
              src={getImageUrl(item.image || item.cover, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&q=80')}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 max-w-sm">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-900 text-xs truncate">{item.title}</p>
              {item.featured && (
                <span className="p-0.5 rounded bg-amber-100 text-amber-700 text-[10px]" title="Asosiy yangilik">
                  <FiStar size={11} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.shortDescription || item.content?.slice(0, 70)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Kategoriya',
      render: (item) => (
        <span className="badge-blue text-[10px] font-bold uppercase tracking-wider">
          {item.category || 'general'}
        </span>
      ),
    },
    {
      key: 'author',
      label: 'Muallif & Sana',
      render: (item) => (
        <div className="text-xs text-slate-600">
          <p className="font-medium text-slate-800 flex items-center gap-1">
            <FiUser size={11} className="text-slate-400" />
            <span>{item.author || 'NIS Matbuot'}</span>
          </p>
          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
            <FiCalendar size={11} />
            <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '2026'}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Tahrir Holati',
      render: (item) => getStatusBadge(item),
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setPreviewNews(item)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Oldindan ko‘rish"
          >
            <FiEye size={13} />
          </button>
          <button
            onClick={() => handleDuplicate(item)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Nusxalash"
          >
            <FiCopy size={13} />
          </button>
          <button
            onClick={() => setModalItem(item)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
            title="Tahrirlash"
          >
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={() => setDeleteConfirm(item.id || item._id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
            title="O‘chirish"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const newsList = newsData?.data || [];
  const total = newsData?.total || newsList.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <FiFileText className="text-blue-600" />
            {t('admin.news', 'Yangiliklar & Tahririyat Boshqaruvi')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maktab yangiliklari, ilmiy maqolalar, xalqaro hamkorlik va press-relizlar
          </p>
        </div>
        <div>
          <button
            onClick={() => setModalItem({})}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
          >
            <FiPlus size={15} />
            <span>Yangi Maqola Yozish</span>
          </button>
        </div>
      </div>

      <AdminDataTable
        title="Editorial News & Press"
        subtitle="Nashr qilingan va rejalashtirilgan maqolalar"
        data={newsList}
        columns={columns}
        isLoading={isLoading}
        total={total}
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        search={search}
        onSearchChange={setSearch}
        onAddNew={() => setModalItem({})}
        onBulkDelete={handleBulkDelete}
        exportFilename="news_articles.csv"
        idKey="id"
        filterOptions={[
          {
            label: 'Kategoriya',
            key: 'category',
            options: CATEGORIES.map((c) => ({ label: c.label, value: c.value })),
          },
        ]}
        activeFilters={{ category: categoryFilter }}
        onFilterChange={(f) => setCategoryFilter(f.category || '')}
      />

      {/* Editor Modal */}
      <AnimatePresence>
        {modalItem && (
          <NewsEditorModal
            item={modalItem}
            onClose={() => setModalItem(null)}
            onSave={(formData) => {
              if (modalItem.id || modalItem._id) {
                updateMutation.mutate({ id: modalItem.id || modalItem._id, data: formData });
              } else {
                createMutation.mutate(formData);
              }
            }}
            loading={createMutation.isPending || updateMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewNews && (
          <NewsPreviewModal
            news={previewNews}
            onClose={() => setPreviewNews(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <FiTrash2 size={22} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Maqolani o‘chirish</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Ushbu maqolani butunlay o‘chirib tashlamoqchimisiz?
              </p>
              <div className="flex items-center justify-center gap-2 mt-5">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary text-xs py-1.5 px-4 cursor-pointer">
                  Bekor qilish
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteConfirm)}
                  disabled={deleteMutation.isPending}
                  className="btn-danger text-xs py-1.5 px-4 cursor-pointer"
                >
                  {deleteMutation.isPending ? 'O‘chirilmoqda...' : 'Ha, o‘chirilsin'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewsEditorModal({ item, onClose, onSave, loading }) {
  const isEditing = Boolean(item && (item._id || item.id));
  const [tab, setTab] = useState('content');

  const [form, setForm] = useState({
    title: item?.title || '',
    category: item?.category || 'general',
    shortDescription: item?.shortDescription || '',
    content: item?.content || '',
    author: item?.author || 'NIS AI School Press',
    tags: Array.isArray(item?.tags) ? item.tags.join(', ') : item?.tags || 'AI, Ta\'lim, Innovatsiya',
    status: item?.status || 'published',
    published: item?.published !== false,
    featured: item?.featured || false,
    editorialNotes: item?.editorialNotes || '',
    publishDate: item?.publishDate || new Date().toISOString().slice(0, 10),
    slug: item?.slug || '',
    seoTitle: item?.seoTitle || '',
    seoDescription: item?.seoDescription || '',
  });

  const [coverFile, setCoverFile] = useState(null);

  const [translations, setTranslations] = useState(() => {
    const dict = {};
    const rawList = item?.translations || [];
    if (Array.isArray(rawList)) {
      rawList.forEach((tr) => {
        const code = (tr.languageCode || tr.lang || '').toLowerCase();
        if (code) {
          dict[code] = {
            title: tr.title || '',
            shortDescription: tr.shortDescription || '',
            content: tr.content || '',
          };
        }
      });
    }
    if (!dict.en && item?.title) {
      dict.en = { title: item.title, shortDescription: item.shortDescription || '', content: item.content || '' };
    }
    if (!dict.uz && item?.title) {
      dict.uz = { title: item.title, shortDescription: item.shortDescription || '', content: item.content || '' };
    }
    return dict;
  });

  const handleTranslationChange = (code, key, val) => {
    setTranslations((prev) => ({
      ...prev,
      [code]: { ...(prev[code] || {}), [key]: val },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Sarlavha majburiy!');
      return;
    }
    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));
    if (coverFile) {
      payload.append('image', coverFile);
      payload.append('cover', coverFile);
    }
    payload.append('translations', JSON.stringify(translations));
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] max-h-[850px] flex flex-col overflow-hidden border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FiFileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                {isEditing ? `Maqolani tahrirlash: ${item.title}` : 'Yangi Maqola Yaratish'}
              </h2>
              <p className="text-[11px] text-slate-400">Tahririyat maqolasi, rasmlar va ko‘p tilli matn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <FiX size={18} />
          </button>
        </div>

        {/* Tab row */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar flex-shrink-0">
          {[
            { id: 'content', label: '1. Matn & Rasm' },
            { id: 'editorial', label: '2. Tahririyat & Holat' },
            { id: 'translations', label: '3. Tillar & SEO' },
          ].map((tItem) => (
            <button
              key={tItem.id}
              type="button"
              onClick={() => setTab(tItem.id)}
              className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                tab === tItem.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        <form id="news-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'content' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-5">
                <div className="w-24 h-16 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shadow-inner flex-shrink-0">
                  {coverFile ? (
                    <img src={URL.createObjectURL(coverFile)} alt="" className="w-full h-full object-cover" />
                  ) : item?.image || item?.cover ? (
                    <img src={getImageUrl(item.image || item.cover)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiFileText size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                    <FiUploadCloud size={14} />
                    <span>Muqova rasmini yuklash</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0])} />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Tavsiya: 1200x630)</p>
                </div>
              </div>

              <div>
                <label className="label text-xs">Maqola Sarlavhasi *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input text-xs"
                  placeholder="Xalqaro Olimpiadada O‘quvchilarimiz 4 ta Oltin Medalni Qo‘lga Kiritdi"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Kategoriya</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input text-xs cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Muallif</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="input text-xs"
                    placeholder="NIS AI School Press"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Qisqa Anons (Lead / Summary)</label>
                <textarea
                  rows={2}
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="input text-xs"
                  placeholder="Maqolaning asosiy mazmuni 1-2 jumlada..."
                />
              </div>

              <div>
                <label className="label text-xs">To‘liq Matn (Full Article Content) *</label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input text-xs font-sans leading-relaxed"
                  placeholder="Maqola to‘liq matnini kiriting..."
                />
              </div>
            </div>
          )}

          {tab === 'editorial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="label text-xs">Nashr Holati (Status)</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="published">E’lon qilingan (Published)</option>
                    <option value="review">Ko‘rib chiqilmoqda (In Review)</option>
                    <option value="scheduled">Rejalashtirilgan (Scheduled)</option>
                    <option value="draft">Qoralama (Draft)</option>
                    <option value="archived">Arxivlangan (Archived)</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">Nashr Sanasi</label>
                  <input
                    type="date"
                    value={form.publishDate}
                    onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label text-xs">Asosiy Yangilik (Featured)</label>
                  <select
                    value={form.featured ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, featured: e.target.value === 'true' })}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="false">Oddiy</option>
                    <option value="true">Ha (Bosh sahifada katta banner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs">Teglar (Tags — vergul bilan)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="input text-xs"
                  placeholder="AI, Olimpiada, IOI, Grant, Tadqiqot"
                />
              </div>

              <div>
                <label className="label text-xs">Ichki Tahririyat Eslatmalari (Editorial Notes)</label>
                <textarea
                  rows={3}
                  value={form.editorialNotes}
                  onChange={(e) => setForm({ ...form, editorialNotes: e.target.value })}
                  className="input text-xs bg-slate-50"
                  placeholder="Faqat adminlar ko‘ra oladigan ichki eslatmalar..."
                />
              </div>
            </div>
          )}

          {tab === 'translations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input text-xs font-mono"
                    placeholder="olympiad-gold-medals-2026"
                  />
                </div>
                <div>
                  <label className="label text-xs">SEO Meta Title</label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    className="input text-xs"
                    placeholder="NIS AI School Students Win Gold Medals"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={form.seoDescription}
                  onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                  className="input text-xs"
                  placeholder="Official press release regarding our academic achievements..."
                />
              </div>

              <div className="pt-2">
                <MultilingualTranslationTabs
                  fields={newsTransFields}
                  values={translations}
                  onChange={handleTranslationChange}
                />
              </div>
            </div>
          )}
        </form>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary text-xs py-2 px-4 cursor-pointer">
            Bekor qilish
          </button>
          <button
            type="submit"
            form="news-form"
            disabled={loading}
            className="btn-primary text-xs py-2 px-6 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <FiCheck size={14} />
            <span>{loading ? 'Saqlanmoqda...' : 'Saqlash va Nashr Qilish'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function NewsPreviewModal({ news, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200"
      >
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <h3 className="text-xs font-bold text-slate-800">Maqolani Ko‘rish (Public Preview)</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <FiX size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src={getImageUrl(news.image || news.cover, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80')}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-blue uppercase text-[10px] font-bold">{news.category || 'general'}</span>
            <span className="text-[11px] text-slate-400">
              {news.createdAt ? new Date(news.createdAt).toLocaleDateString() : '2026'}
            </span>
            <span className="text-[11px] text-slate-400">• {news.author || 'NIS Press'}</span>
          </div>

          <h2 className="text-lg font-bold font-display text-slate-900 leading-snug">{news.title}</h2>

          {news.shortDescription && (
            <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
              {news.shortDescription}
            </p>
          )}

          <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed space-y-2">
            {news.content}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="btn-secondary text-xs py-1.5 px-4 cursor-pointer">
            Yopish
          </button>
        </div>
      </motion.div>
    </div>
  );
}
