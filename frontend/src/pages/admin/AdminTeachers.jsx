import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiPlus, FiEdit2, FiTrash2, FiEye, FiDownload,
  FiUploadCloud, FiCheck, FiX, FiCopy, FiArchive, FiRefreshCw,
  FiAward, FiBookOpen, FiMapPin, FiExternalLink, FiGlobe,
  FiCheckCircle, FiShield, FiFileText, FiLayers, FiVideo,
  FiMail, FiPhone, FiStar, FiClock, FiChevronRight, FiGrid
} from 'react-icons/fi';
import AdminDataTable from '../../components/admin/AdminDataTable';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import { teacherAPI, branchAPI } from '../../api';
import { getImageUrl } from '../../utils/image';
import { useLanguage } from '../../context/LanguageContext';

const teacherTransFields = [
  { key: 'subject', label: 'Fan / Mutaxassislik (Subject)', placeholder: 'Computer Vision & Deep Learning' },
  { key: 'bio', label: 'Tarjimai hol (Bio)', type: 'textarea', rows: 4, placeholder: 'Detailed biography...' },
  { key: 'university', label: 'Universitet (University)', placeholder: 'MIT, Stanford University' },
  { key: 'degree', label: 'Ilmiy daraja (Degree)', placeholder: 'PhD in Computer Science' },
  { key: 'methodology', label: 'O‘qitish metodikasi (Teaching Methodology)', type: 'textarea', rows: 2 },
];

export default function AdminTeachers() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [modalItem, setModalItem] = useState(null); // Item being edited or new
  const [previewTeacher, setPreviewTeacher] = useState(null); // Live preview modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch teachers
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['admin-teachers', page, pageSize, search, filterBranch, filterStatus],
    queryFn: async () => {
      const res = await teacherAPI.getAll({
        page,
        limit: pageSize,
        search,
        branchId: filterBranch,
      });
      return res.data;
    },
  });

  // Fetch branches for relations
  const { data: branchesData } = useQuery({
    queryKey: ['admin-branches-dropdown'],
    queryFn: () => branchAPI.getAll({ limit: 100 }),
  });
  const branches = branchesData?.data?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => teacherAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teachers']);
      toast.success(t('admin.teacherCreated', 'O‘qituvchi muvaffaqiyatli qo‘shildi!'));
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => teacherAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teachers']);
      toast.success(t('admin.teacherUpdated', 'O‘qituvchi muvaffaqiyatli yangilandi!'));
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => teacherAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-teachers']);
      toast.success(t('admin.teacherDeleted', 'O‘qituvchi o‘chirildi.'));
      setDeleteConfirm(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'O‘chirishda xatolik yuz berdi.');
    },
  });

  // Duplicate profile
  const handleDuplicate = async (item) => {
    try {
      const copy = {
        ...item,
        firstName: `${item.firstName} (Nusxa)`,
        slug: `${item.slug || 'teacher'}-copy-${Date.now()}`,
      };
      delete copy.id;
      delete copy._id;
      await teacherAPI.create(copy);
      queryClient.invalidateQueries(['admin-teachers']);
      toast.success('O‘qituvchi profili muvaffaqiyatli nusxalandi!');
    } catch {
      toast.error('Nusxalashda xatolik yuz berdi.');
    }
  };

  // Archive / Restore
  const handleToggleArchive = async (item) => {
    try {
      const newStatus = item.status === 'archived' ? 'published' : 'archived';
      await teacherAPI.update(item.id || item._id, {
        ...item,
        status: newStatus,
        isActive: newStatus === 'published',
      });
      queryClient.invalidateQueries(['admin-teachers']);
      toast.success(newStatus === 'archived' ? 'O‘qituvchi arxivlandi.' : 'O‘qituvchi arxivdan tiklandi.');
    } catch {
      toast.error('Holatni o‘zgartirishda xatolik.');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`${ids.length} ta o‘qituvchini o‘chirishni tasdiqlaysizmi?`)) return;
    try {
      await Promise.all(ids.map((id) => teacherAPI.delete(id)));
      queryClient.invalidateQueries(['admin-teachers']);
      toast.success('Tanlangan o‘qituvchilar muvaffaqiyatli o‘chirildi!');
    } catch {
      toast.error('Ommaviy o‘chirishda xatolik yuz berdi.');
    }
  };

  // Table Columns
  const columns = [
    {
      key: 'photo',
      label: 'Ustoz',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-2xs">
            <img
              src={getImageUrl(item.photo, `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=2563eb&color=fff`)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-900 text-xs truncate">
                {item.firstName} {item.lastName}
              </p>
              {item.featured && (
                <span className="p-0.5 rounded bg-amber-100 text-amber-700 text-[10px]" title="Tanlangan ustoz">
                  <FiStar size={11} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-blue-600 font-medium truncate">{item.subject || 'AI & Robotics'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'branch',
      label: 'Filial (Campus)',
      render: (item) => {
        const b = branches.find((br) => (br.id || br._id) === (item.branchId?.id || item.branchId?._id || item.branchId));
        return (
          <div className="text-xs">
            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
              <FiMapPin size={12} className="text-slate-400" />
              <span>{b?.name || item.branch || 'Toshkent Markaziy'}</span>
            </span>
          </div>
        );
      },
    },
    {
      key: 'education',
      label: 'Universitet & Daraja',
      render: (item) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800 truncate max-w-[180px]">{item.university || 'MIT / Stanford'}</p>
          <p className="text-[10px] text-slate-400 truncate">{item.degree || 'PhD in AI'}</p>
        </div>
      ),
    },
    {
      key: 'scores',
      label: 'Kvalifikatsiyalar',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.IELTSScore && (
            <span className="badge-blue text-[10px] py-0 px-1.5 font-bold">IELTS: {item.IELTSScore}</span>
          )}
          {item.SATScore && (
            <span className="badge-purple text-[10px] py-0 px-1.5 font-bold">SAT: {item.SATScore}</span>
          )}
          {!item.IELTSScore && !item.SATScore && (
            <span className="text-[10px] text-slate-400">Magistr / PhD</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Holati',
      render: (item) => {
        const isArchived = item.status === 'archived' || item.isActive === false;
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isArchived
                ? 'bg-slate-100 text-slate-600 border border-slate-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isArchived ? 'bg-slate-400' : 'bg-emerald-500'}`} />
            {isArchived ? 'Arxivlangan' : 'Faol'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Amallar',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setPreviewTeacher(item)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Profilni ko‘rish"
          >
            <FiEye size={13} />
          </button>
          <button
            onClick={() => handleDuplicate(item)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Nusxalash (Duplicate)"
          >
            <FiCopy size={13} />
          </button>
          <button
            onClick={() => handleToggleArchive(item)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title={item.status === 'archived' ? 'Arxivdan chiqarish' : 'Arxivlash'}
          >
            <FiArchive size={13} />
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

  const teachersList = teachersData?.data || [];
  const total = teachersData?.total || teachersList.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <FiUsers className="text-blue-600" />
            {t('admin.teachers', 'O‘qituvchilar & Ustozlar Boshqaruvi')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Xalqaro ekspertlar, fan ustozlari, ta'lim tarixi va sertifikatlar markazi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalItem({})}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
          >
            <FiPlus size={15} />
            <span>Yangi Ustoz Qo‘shish</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <AdminDataTable
        title="Faculty Members"
        subtitle="Maktab professor-o‘qituvchilari"
        data={teachersList}
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
        exportFilename="faculty_teachers.csv"
        idKey="id"
        filterOptions={[
          {
            label: 'Filial',
            key: 'branch',
            options: [
              { label: 'Barcha Filiallar', value: '' },
              ...branches.map((b) => ({ label: b.name, value: b.id || b._id })),
            ],
          },
        ]}
        activeFilters={{ branch: filterBranch }}
        onFilterChange={(f) => setFilterBranch(f.branch || '')}
      />

      {/* Structured Multi-Tab Teacher Editor Modal */}
      <AnimatePresence>
        {modalItem && (
          <TeacherEditorModal
            item={modalItem}
            branches={branches}
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

      {/* Live Profile Preview Modal */}
      <AnimatePresence>
        {previewTeacher && (
          <TeacherProfilePreviewModal
            teacher={previewTeacher}
            branches={branches}
            onClose={() => setPreviewTeacher(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
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
              <h3 className="text-sm font-bold text-slate-900">Ustozni o‘chirish</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Ushbu o‘qituvchi profilini butunlay o‘chirib tashlamoqchimisiz?
              </p>
              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary text-xs py-1.5 px-4 cursor-pointer"
                >
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

/**
 * Enterprise Structured Multi-Tab Teacher Editor
 */
function TeacherEditorModal({ item, branches, onClose, onSave, loading }) {
  const isEditing = Boolean(item && (item._id || item.id));
  const [tab, setTab] = useState('overview');

  // Form state
  const [form, setForm] = useState({
    firstName: item?.firstName || '',
    lastName: item?.lastName || '',
    middleName: item?.middleName || '',
    subject: item?.subject || '',
    branchId: item?.branchId?.id || item?.branchId?._id || item?.branchId || '',
    secondaryBranches: item?.secondaryBranches || [],
    university: item?.university || '',
    degree: item?.degree || '',
    IELTSScore: item?.IELTSScore || '',
    SATScore: item?.SATScore || '',
    HSKScore: item?.HSKScore || '',
    bio: item?.bio || '',
    methodology: item?.methodology || '',
    email: item?.email || '',
    phone: item?.phone || '',
    showEmail: item?.showEmail ?? true,
    showPhone: item?.showPhone ?? false,
    status: item?.status || 'published',
    featured: item?.featured || false,
    order: item?.order || 0,
    slug: item?.slug || '',
    videoUrl: item?.videoUrl || '',
    seoTitle: item?.seoTitle || '',
    seoDescription: item?.seoDescription || '',
  });

  const [photoFile, setPhotoFile] = useState(null);

  // Education Records array
  const [educationList, setEducationList] = useState(() => {
    return Array.isArray(item?.educationList) && item.educationList.length > 0
      ? item.educationList
      : [
          {
            degree: item?.degree || 'Bachelor of Science in Computer Science',
            institution: item?.university || 'Tashkent University of Information Technologies',
            year: '2020-2024',
            verified: true,
          },
        ];
  });

  // Certificates array
  const [certificatesList, setCertificatesList] = useState(() => {
    if (Array.isArray(item?.certificatesList) && item.certificatesList.length > 0) {
      return item.certificatesList;
    }
    const raw = item?.certificates;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.split(',').map((c) => ({ title: c.trim(), issuer: 'International Authority', year: '2024' }));
    }
    return [
      { title: 'NVIDIA Certified Deep Learning Specialist', issuer: 'NVIDIA DLI', year: '2025' },
      { title: 'AWS Machine Learning Specialty', issuer: 'Amazon Web Services', year: '2024' },
    ];
  });

  // Achievements array
  const [achievementsList, setAchievementsList] = useState(() => {
    if (Array.isArray(item?.achievementsList) && item.achievementsList.length > 0) {
      return item.achievementsList;
    }
    const raw = item?.achievements;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.split(',').map((a) => ({ title: a.trim(), year: '2025' }));
    }
    return [
      { title: 'Xalqaro Informatika Olimpiadasi (IOI) murabbiyi', year: '2025' },
      { title: 'Yilning eng yaxshi IT o‘qituvchisi mukofoti', year: '2024' },
    ];
  });

  // Multilingual translations
  const [translations, setTranslations] = useState(() => {
    const dict = {};
    const rawList = item?.translations || [];
    if (Array.isArray(rawList)) {
      rawList.forEach((tr) => {
        const code = (tr.languageCode || tr.lang || '').toLowerCase();
        if (code) {
          dict[code] = {
            subject: tr.subject || '',
            bio: tr.bio || '',
            university: tr.university || '',
            degree: tr.degree || '',
            methodology: tr.methodology || '',
          };
        }
      });
    }
    if (!dict.en && item?.subject) {
      dict.en = { subject: item.subject, bio: item.bio || '', university: item.university || '', degree: item.degree || '', methodology: item.methodology || '' };
    }
    if (!dict.uz && item?.subject) {
      dict.uz = { subject: item.subject, bio: item.bio || '', university: item.university || '', degree: item.degree || '', methodology: item.methodology || '' };
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
    if (!form.firstName || !form.lastName) {
      toast.error('Ism va familiya majburiy!');
      return;
    }

    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'secondaryBranches') {
        payload.append(k, JSON.stringify(v));
      } else {
        payload.append(k, v);
      }
    });

    if (photoFile) {
      payload.append('photo', photoFile);
    }

    payload.append('educationList', JSON.stringify(educationList));
    payload.append('certificatesList', JSON.stringify(certificatesList));
    payload.append('achievementsList', JSON.stringify(achievementsList));
    payload.append('translations', JSON.stringify(translations));

    onSave(payload);
  };

  const tabs = [
    { id: 'overview', label: '1. Asosiy & Status', icon: FiGrid },
    { id: 'personal', label: '2. Shaxsiy & Aloqa', icon: FiMail },
    { id: 'education', label: '3. Ta\'lim Tarixi', icon: FiBookOpen },
    { id: 'qualifications', label: '4. Sertifikat & Ballar', icon: FiAward },
    { id: 'branches', label: '5. Filial & Fanlar', icon: FiMapPin },
    { id: 'achievements', label: '6. Yutuqlar', icon: FiStar },
    { id: 'translations', label: '7. Tillar & SEO', icon: FiGlobe },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[90vh] max-h-[850px] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FiUsers size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                {isEditing ? `Ustozni tahrirlash: ${item.firstName} ${item.lastName}` : 'Yangi Ustoz Profili'}
              </h2>
              <p className="text-[11px] text-slate-400">Enterprise strukturaviy o‘qituvchi boshqaruvi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Tab navigation bar */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar flex-shrink-0">
          {tabs.map((tItem) => {
            const Icon = tItem.icon;
            const isActive = tab === tItem.id;
            return (
              <button
                key={tItem.id}
                type="button"
                onClick={() => setTab(tItem.id)}
                className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{tItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form id="teacher-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 border border-slate-300 overflow-hidden relative flex-shrink-0 flex items-center justify-center shadow-inner">
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="" className="w-full h-full object-cover" />
                  ) : item?.photo ? (
                    <img src={getImageUrl(item.photo)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiUsers size={32} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                    <FiUploadCloud size={14} />
                    <span>Surat yuklash</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0])}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">PNG, JPG yoki WEBP (tavsiya: 400x400 kvadrat)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Ism (First Name) *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input text-xs"
                    placeholder="Azizbek"
                  />
                </div>
                <div>
                  <label className="label text-xs">Familiya (Last Name) *</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input text-xs"
                    placeholder="Rahimov"
                  />
                </div>
                <div>
                  <label className="label text-xs">Otasining ismi (Middle Name)</label>
                  <input
                    type="text"
                    value={form.middleName}
                    onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                    className="input text-xs"
                    placeholder="Ilhomovich"
                  />
                </div>
                <div>
                  <label className="label text-xs">Asosiy Fan / Mutaxassislik *</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input text-xs"
                    placeholder="Deep Learning & Neural Networks"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="label text-xs">Nashr Holati (Status)</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="published">E’lon qilingan (Published)</option>
                    <option value="draft">Qoralama (Draft)</option>
                    <option value="archived">Arxivlangan (Archived)</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Tanlangan Ustoz (Featured)</label>
                  <select
                    value={form.featured ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, featured: e.target.value === 'true' })}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="false">Yo‘q (Oddiy)</option>
                    <option value="true">Ha (Bosh sahifada aks etadi)</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Tartib raqami (Display Order)</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="input text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONAL & CONTACT */}
          {tab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs flex items-center justify-between">
                    <span>Elektron Pochta</span>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 font-normal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.showEmail}
                        onChange={(e) => setForm({ ...form, showEmail: e.target.checked })}
                      />
                      Ommaga ko‘rinsin
                    </label>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input text-xs"
                    placeholder="a.rahimov@nis-ai.edu.uz"
                  />
                </div>
                <div>
                  <label className="label text-xs flex items-center justify-between">
                    <span>Telefon Raqam</span>
                    <label className="flex items-center gap-1 text-[10px] text-slate-500 font-normal cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.showPhone}
                        onChange={(e) => setForm({ ...form, showPhone: e.target.checked })}
                      />
                      Ommaga ko‘rinsin
                    </label>
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input text-xs"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Video Tanishtiruv Havolasi (YouTube / Vimeo)</label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                  className="input text-xs"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="label text-xs">Batafsil Tarjimai Hol (Biography)</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input text-xs"
                  placeholder="Ustozning ilmiy faoliyati va yutuqlari haqida umumiy ma'lumot..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: EDUCATION RECORDS */}
          {tab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Ta'lim Tarixi va Diplomlar</h3>
                  <p className="text-[11px] text-slate-400">Ustozning o‘qigan universitetlari va ilmiy darajalari</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEducationList([
                      ...educationList,
                      { degree: 'Master of Science', institution: 'Yangi Universitet', year: '2024', verified: true },
                    ])
                  }
                  className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <FiPlus size={13} />
                  <span>Ta'lim qo‘shish</span>
                </button>
              </div>

              <div className="space-y-3">
                {educationList.map((edu, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700">#{idx + 1} Ta'lim Darajasi</span>
                      <button
                        type="button"
                        onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Daraja (masalan: PhD in AI)"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].degree = e.target.value;
                          setEducationList(updated);
                        }}
                        className="input text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Universitet / Muassasa"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].institution = e.target.value;
                          setEducationList(updated);
                        }}
                        className="input text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Yillar (masalan: 2020-2024)"
                        value={edu.year}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].year = e.target.value;
                          setEducationList(updated);
                        }}
                        className="input text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: QUALIFICATIONS & CERTIFICATES */}
          {tab === 'qualifications' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="label text-xs">IELTS Ball</label>
                  <input
                    type="text"
                    value={form.IELTSScore}
                    onChange={(e) => setForm({ ...form, IELTSScore: e.target.value })}
                    className="input text-xs bg-white"
                    placeholder="8.5"
                  />
                </div>
                <div>
                  <label className="label text-xs">SAT Ball</label>
                  <input
                    type="text"
                    value={form.SATScore}
                    onChange={(e) => setForm({ ...form, SATScore: e.target.value })}
                    className="input text-xs bg-white"
                    placeholder="1560"
                  />
                </div>
                <div>
                  <label className="label text-xs">HSK (Xitoy tili)</label>
                  <input
                    type="text"
                    value={form.HSKScore}
                    onChange={(e) => setForm({ ...form, HSKScore: e.target.value })}
                    className="input text-xs bg-white"
                    placeholder="HSK 5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Xalqaro Sertifikatlar</h3>
                  <p className="text-[11px] text-slate-400">NVIDIA, AWS, Google Cloud, Microsoft sertifikatlari</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCertificatesList([
                      ...certificatesList,
                      { title: 'Yangi Sertifikat', issuer: 'Tashkilot', year: '2025' },
                    ])
                  }
                  className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <FiPlus size={13} />
                  <span>Qo‘shish</span>
                </button>
              </div>

              <div className="space-y-2">
                {certificatesList.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                    <input
                      type="text"
                      placeholder="Sertifikat nomi"
                      value={cert.title}
                      onChange={(e) => {
                        const copy = [...certificatesList];
                        copy[idx].title = e.target.value;
                        setCertificatesList(copy);
                      }}
                      className="input text-xs flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Bergan tashkilot"
                      value={cert.issuer}
                      onChange={(e) => {
                        const copy = [...certificatesList];
                        copy[idx].issuer = e.target.value;
                        setCertificatesList(copy);
                      }}
                      className="input text-xs w-40"
                    />
                    <input
                      type="text"
                      placeholder="Yili"
                      value={cert.year}
                      onChange={(e) => {
                        const copy = [...certificatesList];
                        copy[idx].year = e.target.value;
                        setCertificatesList(copy);
                      }}
                      className="input text-xs w-20"
                    />
                    <button
                      type="button"
                      onClick={() => setCertificatesList(certificatesList.filter((_, i) => i !== idx))}
                      className="text-red-500 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BRANCHES & SUBJECTS */}
          {tab === 'branches' && (
            <div className="space-y-4">
              <div>
                <label className="label text-xs">Asosiy Filial (Primary Campus) *</label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="input text-xs cursor-pointer"
                  required
                >
                  <option value="">Filialni tanlang...</option>
                  {branches.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name} ({b.city || 'Campus'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs">Qo‘shimcha Filiallar (Secondary Campuses)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {branches.map((b) => {
                    const bId = b.id || b._id;
                    const isSelected = form.secondaryBranches.includes(bId);
                    return (
                      <label
                        key={bId}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({ ...form, secondaryBranches: [...form.secondaryBranches, bId] });
                            } else {
                              setForm({
                                ...form,
                                secondaryBranches: form.secondaryBranches.filter((x) => x !== bId),
                              });
                            }
                          }}
                        />
                        <span className="truncate">{b.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label text-xs">O‘qitish Metodikasi (Teaching Methodology)</label>
                <textarea
                  rows={3}
                  value={form.methodology}
                  onChange={(e) => setForm({ ...form, methodology: e.target.value })}
                  className="input text-xs"
                  placeholder="Loyiha asosida o‘qitish (Project-based learning), amaliy laboratoriyalar..."
                />
              </div>
            </div>
          )}

          {/* TAB 6: ACHIEVEMENTS */}
          {tab === 'achievements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Ustozning Shaxsiy va Ilmiy Yutuqlari</h3>
                  <p className="text-[11px] text-slate-400">Olimpiada natijalari, mukofotlar va unvonlar</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAchievementsList([
                      ...achievementsList,
                      { title: 'Yangi Yutuq / Mukofot', year: '2025' },
                    ])
                  }
                  className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                >
                  <FiPlus size={13} />
                  <span>Yutuq qo‘shish</span>
                </button>
              </div>

              <div className="space-y-2">
                {achievementsList.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white">
                    <input
                      type="text"
                      placeholder="Yutuq nomi"
                      value={ach.title}
                      onChange={(e) => {
                        const copy = [...achievementsList];
                        copy[idx].title = e.target.value;
                        setAchievementsList(copy);
                      }}
                      className="input text-xs flex-1"
                    />
                    <input
                      type="text"
                      placeholder="Yili"
                      value={ach.year}
                      onChange={(e) => {
                        const copy = [...achievementsList];
                        copy[idx].year = e.target.value;
                        setAchievementsList(copy);
                      }}
                      className="input text-xs w-24"
                    />
                    <button
                      type="button"
                      onClick={() => setAchievementsList(achievementsList.filter((_, i) => i !== idx))}
                      className="text-red-500 p-1.5 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TRANSLATIONS & SEO */}
          {tab === 'translations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Public URL Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input text-xs font-mono"
                    placeholder="dr-azizbek-rahimov"
                  />
                </div>
                <div>
                  <label className="label text-xs">SEO Meta Title</label>
                  <input
                    type="text"
                    value={form.seoTitle}
                    onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                    className="input text-xs"
                    placeholder="Dr. Azizbek Rahimov — NIS AI School Faculty"
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
                  placeholder="Stanford & MIT alumni computer vision professor at NIS AI School..."
                />
              </div>

              <div className="pt-2">
                <MultilingualTranslationTabs
                  fields={teacherTransFields}
                  values={translations}
                  onChange={handleTranslationChange}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
          >
            Bekor qilish
          </button>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              form="teacher-form"
              disabled={loading}
              className="btn-primary text-xs py-2 px-6 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
            >
              <FiCheck size={14} />
              <span>{loading ? 'Saqlanmoqda...' : 'Saqlash va Tasdiqlash'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Live Public Profile Preview Drawer
 */
function TeacherProfilePreviewModal({ teacher, branches, onClose }) {
  const branchName = branches.find((b) => (b.id || b._id) === (teacher.branchId?.id || teacher.branchId?._id || teacher.branchId))?.name || 'Toshkent Markaziy';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
      >
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800">Jonli Ommaviy Profil Ko‘rinishi (Public Preview)</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="w-24 h-24 rounded-full mx-auto overflow-hidden border-3 border-blue-500 shadow-md">
            <img
              src={getImageUrl(teacher.photo, `https://ui-avatars.com/api/?name=${teacher.firstName}+${teacher.lastName}&background=2563eb&color=fff`)}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h4 className="text-lg font-black font-display text-slate-900">
              {teacher.firstName} {teacher.lastName}
            </h4>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">{teacher.subject}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
              <FiMapPin size={12} />
              <span>{branchName}</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {teacher.IELTSScore && (
              <span className="badge-blue text-xs font-bold">IELTS: {teacher.IELTSScore}</span>
            )}
            {teacher.SATScore && (
              <span className="badge-purple text-xs font-bold">SAT: {teacher.SATScore}</span>
            )}
            <span className="badge-gray text-xs">{teacher.university || 'MIT'}</span>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-left leading-relaxed">
            {teacher.bio || 'Ustoz haqida batafsil ma\'lumot.'}
          </p>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs py-1.5 px-4 cursor-pointer">
            Yopish
          </button>
        </div>
      </motion.div>
    </div>
  );
}
