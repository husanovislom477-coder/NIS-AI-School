import { useState } from 'react';
import AdminCRUD from '../../components/admin/AdminCRUD';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { branchAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

const branchTransFields = [
  { key: 'name', label: 'Nomi (Name)', required: true },
  { key: 'description', label: 'Tavsifi (Description)', type: 'textarea', rows: 3 },
  { key: 'address', label: 'Manzili (Address)' },
  { key: 'workingHours', label: 'Ish vaqti (Working Hours)', placeholder: '08:30 - 18:00' },
];

function BranchForm({ initialData = {}, onSubmit, loading }) {
  const { languages, t } = useLanguage();

  // Initialize multilingual translations dictionary
  const [translations, setTranslations] = useState(() => {
    const dict = {};
    const rawList = initialData.translations || [];
    if (Array.isArray(rawList)) {
      rawList.forEach((tr) => {
        const code = (tr.languageCode || tr.lang || '').toLowerCase();
        if (code) {
          dict[code] = {
            name: tr.name || '',
            description: tr.description || '',
            address: tr.address || '',
            workingHours: tr.workingHours || '',
          };
        }
      });
    }

    // Default fallbacks from base fields if empty
    if (!dict.en && initialData.name) {
      dict.en = {
        name: initialData.name || '',
        description: initialData.description || '',
        address: initialData.address || '',
        workingHours: initialData.workingHours || '08:30 - 18:00',
      };
    }
    if (!dict.uz && initialData.name) {
      dict.uz = {
        name: initialData.name || '',
        description: initialData.description || '',
        address: initialData.address || '',
        workingHours: initialData.workingHours || '08:30 - 18:00',
      };
    }
    return dict;
  });

  const [form, setForm] = useState({
    name: initialData.name || '',
    shortName: initialData.shortName || '',
    location: initialData.location || initialData.address || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    description: initialData.description || '',
    established: initialData.established || '',
    studentCount: initialData.studentCount || 0,
    teacherCount: initialData.teacherCount || 0,
    workingHours: initialData.workingHours || '08:30 - 18:00',
    featured: initialData.featured || false,
    isActive: initialData.isActive !== false,
  });

  const [imageFiles, setImageFiles] = useState([]);

  const handleTranslationChange = (langCode, fieldKey, value) => {
    setTranslations((prev) => ({
      ...prev,
      [langCode]: {
        ...(prev[langCode] || {}),
        [fieldKey]: value,
      },
    }));

    // If active edit is on primary fields, also update base form fields for consistency
    if (fieldKey === 'name' && (langCode === 'en' || langCode === 'uz')) {
      setForm((prev) => ({ ...prev, name: value }));
    }
    if (fieldKey === 'description' && (langCode === 'en' || langCode === 'uz')) {
      setForm((prev) => ({ ...prev, description: value }));
    }
    if (fieldKey === 'address' && (langCode === 'en' || langCode === 'uz')) {
      setForm((prev) => ({ ...prev, address: value, location: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    // Append translations payload
    fd.append('translations', JSON.stringify(translations));

    imageFiles.forEach((f) => fd.append('images', f));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dynamic Multilingual Translation Tabs Component */}
      <MultilingualTranslationTabs
        fields={branchTransFields}
        translations={translations}
        onChange={handleTranslationChange}
      />

      {/* Shared language-independent information */}
      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          {t('admin.sharedDetails', 'Umumiy Ma‘lumotlar (Shared Details)')}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Qisqa nom (Identifikator)</label>
            <input
              value={form.shortName}
              onChange={(e) => setForm({ ...form, shortName: e.target.value })}
              className="input-field text-sm"
              placeholder="Tashkent Campus"
            />
          </div>
          <div>
            <label className="label">Tashkil etilgan yili</label>
            <input
              type="number"
              value={form.established}
              onChange={(e) => setForm({ ...form, established: e.target.value })}
              className="input-field text-sm"
              placeholder="2024"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label">Telefon</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm"
              placeholder="+998 71 200 01 01"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field text-sm"
              placeholder="campus@nis-ai.edu.uz"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label">O'quvchi soni</label>
            <input
              type="number"
              value={form.studentCount}
              onChange={(e) => setForm({ ...form, studentCount: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="label">O'qituvchi soni</label>
            <input
              type="number"
              value={form.teacherCount}
              onChange={(e) => setForm({ ...form, teacherCount: e.target.value })}
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="label">Rasmlar (max 6)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImageFiles(Array.from(e.target.files))}
            className="input-field py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded text-school-600 focus:ring-school-500"
            />
            Bosh kampus (Featured)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded text-school-600 focus:ring-school-500"
            />
            Faol (Active)
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
        {loading ? t('settings.saving', 'Saqlanmoqda...') : t('admin.save', 'Saqlash')}
      </button>
    </form>
  );
}

export default function AdminBranches() {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'coverImage',
      label: 'Rasm',
      render: (v, item) => (
        <img
          src={v || item.image || `https://ui-avatars.com/api/?name=${item.name}&background=2563eb&color=fff&size=40`}
          alt=""
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'name',
      label: 'Nom va Manzil',
      render: (_, item) => (
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-400">{item.address || item.location}</p>
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
    { key: 'phone', label: 'Telefon' },
    {
      key: 'isActive',
      label: 'Holat',
      render: (v) => (
        <span className={v !== false ? 'badge-green' : 'badge-red'}>
          {v !== false ? 'Faol' : 'Nofaol'}
        </span>
      ),
    },
  ];

  return (
    <AdminCRUD
      title={t('admin.branches', 'Filiallar (Campuses)')}
      queryKey="admin-branches"
      fetchFn={branchAPI.getAll}
      deleteFn={branchAPI.delete}
      createFn={branchAPI.create}
      updateFn={branchAPI.update}
      columns={columns}
      FormComponent={BranchForm}
    />
  );
}
