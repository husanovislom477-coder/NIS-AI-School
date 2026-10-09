import { useState } from 'react';
import AdminCRUD from '../../components/admin/AdminCRUD';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { newsAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = [
  { value: 'general', label: 'Umumiy (General)' },
  { value: 'academic', label: 'Akademik (Academic)' },
  { value: 'olympiad', label: 'Olimpiada (Olympiad)' },
  { value: 'research', label: 'Tadqiqot va AI (Research)' },
  { value: 'event', label: 'Tadbir (Event)' },
  { value: 'achievement', label: 'Yutuq (Achievement)' },
  { value: 'announcement', label: "E'lon (Announcement)" },
];

const newsTransFields = [
  { key: 'title', label: 'Sarlavha (Title)', required: true, placeholder: 'News title...' },
  { key: 'shortDescription', label: 'Qisqa tavsif (Short description)', type: 'textarea', rows: 2 },
  { key: 'content', label: 'To‘liq matn (Full content)', type: 'textarea', rows: 5, required: true },
];

function NewsForm({ initialData = {}, onSubmit, loading }) {
  const { t } = useLanguage();

  // Initialize multilingual translations
  const [translations, setTranslations] = useState(() => {
    const dict = {};
    const rawList = initialData.translations || [];
    if (Array.isArray(rawList)) {
      rawList.forEach((tr) => {
        const code = (tr.languageCode || tr.lang || '').toLowerCase();
        if (code) {
          dict[code] = {
            title: tr.title || '',
            shortDescription: tr.shortDescription || tr.summary || '',
            content: tr.content || '',
          };
        }
      });
    }

    if (!dict.en && initialData.title) {
      dict.en = {
        title: initialData.title || '',
        shortDescription: initialData.shortDescription || initialData.summary || '',
        content: initialData.content || '',
      };
    }
    if (!dict.uz && initialData.title) {
      dict.uz = {
        title: initialData.title || '',
        shortDescription: initialData.shortDescription || initialData.summary || '',
        content: initialData.content || '',
      };
    }
    return dict;
  });

  const [form, setForm] = useState({
    title: initialData.title || '',
    category: initialData.category || 'general',
    shortDescription: initialData.shortDescription || '',
    content: initialData.content || '',
    tagsText: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
    published: initialData.published !== false,
    featured: initialData.featured || false,
    author: initialData.author || 'NIS AI School',
  });

  const [coverFile, setCoverFile] = useState(null);

  const handleTranslationChange = (langCode, fieldKey, value) => {
    setTranslations((prev) => ({
      ...prev,
      [langCode]: {
        ...(prev[langCode] || {}),
        [fieldKey]: value,
      },
    }));

    if (langCode === 'en' || langCode === 'uz') {
      if (fieldKey === 'title') setForm((prev) => ({ ...prev, title: value }));
      if (fieldKey === 'shortDescription') setForm((prev) => ({ ...prev, shortDescription: value }));
      if (fieldKey === 'content') setForm((prev) => ({ ...prev, content: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'tagsText') {
        const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
        fd.append('tags', JSON.stringify(arr));
      } else {
        fd.append(k, v);
      }
    });

    fd.append('translations', JSON.stringify(translations));

    if (coverFile) {
      fd.append('coverImage', coverFile);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dynamic Multilingual Translation Tabs Component */}
      <MultilingualTranslationTabs
        fields={newsTransFields}
        translations={translations}
        onChange={handleTranslationChange}
      />

      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          {t('admin.sharedDetails', 'Umumiy Sozlamalar (Shared Settings)')}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Kategoriya</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input-field text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Muallif</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="label">Muqova rasmi (Cover image)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files[0])}
            className="input-field py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded text-school-600 focus:ring-school-500"
            />
            Darhol nashr etish (Published)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded text-school-600 focus:ring-school-500"
            />
            Bosh sahifada ko‘rsatish (Featured)
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
        {loading ? t('settings.saving', 'Saqlanmoqda...') : t('admin.save', 'Saqlash')}
      </button>
    </form>
  );
}

export default function AdminNews() {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'coverImage',
      label: 'Rasm',
      render: (v, item) => (
        <img
          src={v || item.image || `https://ui-avatars.com/api/?name=${item.title}&background=2563eb&color=fff&size=40`}
          alt=""
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'title',
      label: 'Sarlavha',
      render: (_, item) => (
        <div>
          <p className="font-semibold text-slate-900 line-clamp-1">{item.title}</p>
          <p className="text-xs text-slate-400 line-clamp-1">{item.shortDescription}</p>
        </div>
      ),
    },
    {
      key: 'translations',
      label: 'Tarjimalar (Translations)',
      render: (_, item) => {
        const transList = item.translations || [];
        return (
          <div className="flex items-center gap-1 flex-wrap">
            {transList.map((tr) => (
              <span
                key={tr.languageCode || tr.lang}
                className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
              >
                {tr.languageCode || tr.lang}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'published',
      label: 'Holat',
      render: (v) => (
        <span className={v ? 'badge-green' : 'badge-amber'}>
          {v ? 'Nashr etilgan' : 'Qoralama'}
        </span>
      ),
    },
  ];

  return (
    <AdminCRUD
      title={t('admin.news', 'Yangiliklar (News)')}
      queryKey="admin-news"
      fetchFn={newsAPI.getAllAdmin}
      deleteFn={newsAPI.delete}
      createFn={newsAPI.create}
      updateFn={newsAPI.update}
      columns={columns}
      FormComponent={NewsForm}
    />
  );
}
