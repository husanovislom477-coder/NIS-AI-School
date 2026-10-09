import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminCRUD from '../../components/admin/AdminCRUD';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { teacherAPI, branchAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

const teacherTransFields = [
  { key: 'subject', label: 'Fan / Mutaxassislik (Subject)', required: true, placeholder: 'Computer Vision / AI' },
  { key: 'university', label: 'Universitet (University / Alma Mater)', placeholder: 'MIT, Stanford, etc.' },
  { key: 'degree', label: 'Ilmiy daraja (Degree)', placeholder: 'PhD in Computer Science' },
  { key: 'bio', label: 'Tarjimai hol (Biography)', type: 'textarea', rows: 3 },
  { key: 'achievements', label: 'Yutuqlar (Achievements)', type: 'textarea', rows: 2 },
  { key: 'certificates', label: 'Sertifikatlar (Certificates)', placeholder: 'NVIDIA Certified, AWS, etc.' },
];

function TeacherForm({ initialData = {}, onSubmit, loading }) {
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
            subject: tr.subject || '',
            university: tr.university || '',
            degree: tr.degree || '',
            bio: tr.bio || '',
            achievements: tr.achievements || '',
            certificates: tr.certificates || '',
          };
        }
      });
    }

    if (!dict.en && (initialData.subject || initialData.bio)) {
      dict.en = {
        subject: initialData.subject || '',
        university: initialData.university || '',
        degree: initialData.degree || '',
        bio: initialData.bio || initialData.biography || '',
        achievements: Array.isArray(initialData.achievements) ? initialData.achievements.join(', ') : initialData.achievements || '',
        certificates: Array.isArray(initialData.certificates) ? initialData.certificates.join(', ') : initialData.certificates || '',
      };
    }
    if (!dict.uz && (initialData.subject || initialData.bio)) {
      dict.uz = {
        subject: initialData.subject || '',
        university: initialData.university || '',
        degree: initialData.degree || '',
        bio: initialData.bio || initialData.biography || '',
        achievements: Array.isArray(initialData.achievements) ? initialData.achievements.join(', ') : initialData.achievements || '',
        certificates: Array.isArray(initialData.certificates) ? initialData.certificates.join(', ') : initialData.certificates || '',
      };
    }
    return dict;
  });

  const [form, setForm] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    middleName: initialData.middleName || initialData.patronymic || '',
    subject: initialData.subject || '',
    branchId: initialData.branchId?.id || initialData.branchId?._id || initialData.branchId || '',
    university: initialData.university || '',
    degree: initialData.degree || initialData.education || '',
    IELTSScore: initialData.IELTSScore || '',
    SATScore: initialData.SATScore || '',
    HSKScore: initialData.HSKScore || '',
    bio: initialData.bio || initialData.biography || '',
    featured: initialData.featured || false,
    isActive: initialData.isActive !== false,
  });

  const [photoFile, setPhotoFile] = useState(null);

  // Fetch branches for dropdown
  const { data: branchesData } = useQuery({
    queryKey: ['admin-branches-options'],
    queryFn: () => branchAPI.getAll({ limit: 100 }),
  });
  const branches = branchesData?.data?.data || [];

  const handleTranslationChange = (langCode, fieldKey, value) => {
    setTranslations((prev) => ({
      ...prev,
      [langCode]: {
        ...(prev[langCode] || {}),
        [fieldKey]: value,
      },
    }));

    if (langCode === 'en' || langCode === 'uz') {
      if (fieldKey === 'subject') setForm((prev) => ({ ...prev, subject: value }));
      if (fieldKey === 'university') setForm((prev) => ({ ...prev, university: value }));
      if (fieldKey === 'degree') setForm((prev) => ({ ...prev, degree: value }));
      if (fieldKey === 'bio') setForm((prev) => ({ ...prev, bio: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('translations', JSON.stringify(translations));

    if (photoFile) {
      fd.append('photo', photoFile);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dynamic Multilingual Translation Tabs Component */}
      <MultilingualTranslationTabs
        fields={teacherTransFields}
        translations={translations}
        onChange={handleTranslationChange}
      />

      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          {t('admin.sharedDetails', 'Shaxsiy va Umumiy Ma‘lumotlar')}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Ism *</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="input-field text-sm"
              placeholder="Azizbek"
            />
          </div>
          <div>
            <label className="label">Familiya *</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="input-field text-sm"
              placeholder="Rahimov"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className="label">Otasining ismi</label>
            <input
              value={form.middleName}
              onChange={(e) => setForm({ ...form, middleName: e.target.value })}
              className="input-field text-sm"
              placeholder="Karimovich"
            />
          </div>
          <div>
            <label className="label">Filial *</label>
            <select
              required
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              className="input-field text-sm"
            >
              <option value="">Filialni tanlang</option>
              {branches.map((b) => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.name || b.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="label">IELTS ball</label>
            <input
              value={form.IELTSScore}
              onChange={(e) => setForm({ ...form, IELTSScore: e.target.value })}
              className="input-field text-sm"
              placeholder="8.5"
            />
          </div>
          <div>
            <label className="label">SAT ball</label>
            <input
              value={form.SATScore}
              onChange={(e) => setForm({ ...form, SATScore: e.target.value })}
              className="input-field text-sm"
              placeholder="1580"
            />
          </div>
          <div>
            <label className="label">HSK ball</label>
            <input
              value={form.HSKScore}
              onChange={(e) => setForm({ ...form, HSKScore: e.target.value })}
              className="input-field text-sm"
              placeholder="HSK 6"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="label">Fotosurat</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
            className="input-field py-2 text-sm"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
        {loading ? t('settings.saving', 'Saqlanmoqda...') : t('admin.save', 'Saqlash')}
      </button>
    </form>
  );
}

export default function AdminTeachers() {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'photo',
      label: 'Rasm',
      render: (v, item) => (
        <img
          src={v || item.photo || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=2563eb&color=fff&size=40`}
          alt=""
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'name',
      label: 'O‘qituvchi',
      render: (_, item) => (
        <div>
          <p className="font-semibold text-slate-900">{item.firstName} {item.lastName}</p>
          <p className="text-xs text-slate-400">{item.subject}</p>
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
    { key: 'university', label: 'Universitet' },
    { key: 'degree', label: 'Daraja' },
  ];

  return (
    <AdminCRUD
      title={t('admin.teachers', 'O‘qituvchilar (Teachers)')}
      queryKey="admin-teachers"
      fetchFn={teacherAPI.getAll}
      deleteFn={teacherAPI.delete}
      createFn={teacherAPI.create}
      updateFn={teacherAPI.update}
      columns={columns}
      FormComponent={TeacherForm}
    />
  );
}
