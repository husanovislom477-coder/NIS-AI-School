import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminCRUD from '../../components/admin/AdminCRUD';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { studentAPI, branchAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

const studentTransFields = [
  { key: 'description', label: 'Izoh / Natija Tavsifi (Description / Explanation)', type: 'textarea', rows: 3, placeholder: 'Exam description, section breakdown...' },
  { key: 'achievements', label: 'Yutuqlar (Achievements & Honors)', type: 'textarea', rows: 2, placeholder: 'Olympiad medal, honors...' },
];

function StudentForm({ initialData = {}, onSubmit, loading }) {
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
            description: tr.description || '',
            achievements: tr.achievements || '',
          };
        }
      });
    }

    if (!dict.en && initialData.description) {
      dict.en = {
        description: initialData.description || '',
        achievements: Array.isArray(initialData.achievements) ? initialData.achievements.join(', ') : initialData.achievements || '',
      };
    }
    if (!dict.uz && initialData.description) {
      dict.uz = {
        description: initialData.description || '',
        achievements: Array.isArray(initialData.achievements) ? initialData.achievements.join(', ') : initialData.achievements || '',
      };
    }
    return dict;
  });

  const [form, setForm] = useState({
    firstName: initialData.firstName || initialData.studentName?.split(' ')[0] || '',
    lastName: initialData.lastName || initialData.studentName?.split(' ').slice(1).join(' ') || '',
    studentName: initialData.studentName || '',
    branchId: initialData.branchId?.id || initialData.branchId?._id || initialData.branchId || '',
    grade: initialData.grade || '11-A',
    examType: initialData.examType || 'IELTS',
    score: initialData.score || '8.5',
    year: initialData.year || 2026,
    description: initialData.description || '',
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

    if ((langCode === 'en' || langCode === 'uz') && fieldKey === 'description') {
      setForm((prev) => ({ ...prev, description: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    const fullName = `${form.firstName} ${form.lastName}`.trim();

    Object.entries(form).forEach(([k, v]) => {
      fd.append(k, v);
    });
    fd.append('studentName', fullName);
    fd.append('translations', JSON.stringify(translations));

    if (photoFile) {
      fd.append('photo', photoFile);
      fd.append('studentPhoto', photoFile);
    }

    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Dynamic Multilingual Translation Tabs Component */}
      <MultilingualTranslationTabs
        fields={studentTransFields}
        translations={translations}
        onChange={handleTranslationChange}
      />

      <div className="border-t border-slate-200 pt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          {t('admin.sharedDetails', 'Talaba va Imtihon Ma‘lumotlari (Student & Exam Details)')}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Ism *</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="input-field text-sm"
              placeholder="Islomjon"
            />
          </div>
          <div>
            <label className="label">Familiya *</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="input-field text-sm"
              placeholder="Alimov"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="label">Imtihon turi *</label>
            <select
              value={form.examType}
              onChange={(e) => setForm({ ...form, examType: e.target.value })}
              className="input-field text-sm"
            >
              <option value="IELTS">IELTS</option>
              <option value="SAT">SAT</option>
              <option value="HSK">HSK</option>
              <option value="IOI">IOI / Olympiad</option>
              <option value="IAIO">IAIO AI Olympiad</option>
            </select>
          </div>
          <div>
            <label className="label">Ball / Natija *</label>
            <input
              required
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className="input-field text-sm"
              placeholder="8.5 yoki 1560"
            />
          </div>
          <div>
            <label className="label">Yil</label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              className="input-field text-sm"
              placeholder="2026"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
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
          <div>
            <label className="label">Sinf</label>
            <input
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              className="input-field text-sm"
              placeholder="11-A"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="label">Talaba fotosurati</label>
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

export default function AdminStudents() {
  const { t } = useLanguage();

  const columns = [
    {
      key: 'studentPhoto',
      label: 'Rasm',
      render: (v, item) => (
        <img
          src={v || item.photo || `https://ui-avatars.com/api/?name=${item.studentName}&background=2563eb&color=fff&size=40`}
          alt=""
          className="w-10 h-10 rounded-lg object-cover"
        />
      ),
    },
    {
      key: 'studentName',
      label: 'O‘quvchi',
      render: (_, item) => (
        <div>
          <p className="font-semibold text-slate-900">{item.studentName || `${item.firstName} ${item.lastName}`}</p>
          <p className="text-xs text-slate-400">{item.description}</p>
        </div>
      ),
    },
    {
      key: 'examType',
      label: 'Imtihon & Ball',
      render: (_, item) => (
        <div>
          <span className="badge-blue text-xs font-bold mr-1.5">{item.examType}</span>
          <span className="font-bold text-slate-900">{item.score}</span>
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
    { key: 'year', label: 'Yil' },
  ];

  return (
    <AdminCRUD
      title={t('admin.results', 'O‘quvchilar Natijalari (Exam Results)')}
      queryKey="admin-students"
      fetchFn={studentAPI.getAll}
      deleteFn={studentAPI.delete}
      createFn={studentAPI.create}
      updateFn={studentAPI.update}
      columns={columns}
      FormComponent={StudentForm}
    />
  );
}
