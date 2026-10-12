import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMapPin, FiPlus, FiEdit2, FiTrash2, FiEye, FiDownload,
  FiUploadCloud, FiCheck, FiX, FiCopy, FiArchive, FiPhone,
  FiMail, FiClock, FiGlobe, FiStar, FiLayers, FiImage
} from 'react-icons/fi';
import AdminDataTable from '../../components/admin/AdminDataTable';
import MultilingualTranslationTabs from '../../components/admin/MultilingualTranslationTabs';
import BranchLocationPickerMap from '../../components/admin/BranchLocationPickerMap';
import { branchAPI } from '../../api';
import { getImageUrl } from '../../utils/image';
import { useLanguage } from '../../context/LanguageContext';

const branchTransFields = [
  { key: 'name', label: 'Filial Nomi (Branch Name)', placeholder: 'Toshkent Markaziy Filiali' },
  { key: 'description', label: 'Filial Tavsifi (Description)', type: 'textarea', rows: 4 },
  { key: 'address', label: 'Manzil (Address)', placeholder: 'Amir Temur shoh ko‘chasi, 108' },
  { key: 'workingHours', label: 'Ish Tartibi (Working Hours)', placeholder: 'Dush - Shanba: 08:30 - 18:00' },
];

export default function AdminBranches() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [previewBranch, setPreviewBranch] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: branchesData, isLoading } = useQuery({
    queryKey: ['admin-branches', page, pageSize, search],
    queryFn: async () => {
      const res = await branchAPI.getAll({
        page,
        limit: pageSize,
        search,
      });
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => branchAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-branches']);
      toast.success(t('admin.branchCreated', 'Filial muvaffaqiyatli qo‘shildi!'));
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => branchAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-branches']);
      toast.success(t('admin.branchUpdated', 'Filial muvaffaqiyatli yangilandi!'));
      setModalItem(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => branchAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-branches']);
      toast.success(t('admin.branchDeleted', 'Filial o‘chirildi.'));
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
        name: `${item.name} (Nusxa)`,
        slug: `${item.slug || 'campus'}-copy-${Date.now()}`,
      };
      delete copy.id;
      delete copy._id;
      await branchAPI.create(copy);
      queryClient.invalidateQueries(['admin-branches']);
      toast.success('Filial profili muvaffaqiyatli nusxalandi!');
    } catch {
      toast.error('Nusxalashda xatolik yuz berdi.');
    }
  };

  const handleBulkDelete = async (ids) => {
    if (!window.confirm(`${ids.length} ta filialni o‘chirishni tasdiqlaysizmi?`)) return;
    try {
      await Promise.all(ids.map((id) => branchAPI.delete(id)));
      queryClient.invalidateQueries(['admin-branches']);
      toast.success('Tanlangan filiallar o‘chirildi!');
    } catch {
      toast.error('Ommaviy o‘chirishda xatolik yuz berdi.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Filial (Campus)',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
            <img
              src={getImageUrl(item.image || item.photo, 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&q=80')}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-900 text-xs truncate">{item.name}</p>
              {item.featured && (
                <span className="p-0.5 rounded bg-amber-100 text-amber-700 text-[10px]" title="Asosiy kampus">
                  <FiStar size={11} />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <FiMapPin size={11} />
              <span>{item.address || item.city || 'O‘zbekiston'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Shahar / Hudud',
      render: (item) => (
        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {item.city || item.shortName || 'Toshkent'}
        </span>
      ),
    },
    {
      key: 'stats',
      label: 'O‘quvchilar & Ustozlar',
      render: (item) => (
        <div className="text-xs text-slate-600">
          <p><span className="font-semibold text-slate-800">{item.studentCount || 360}</span> o‘quvchi</p>
          <p className="text-[10px] text-slate-400"><span className="font-semibold text-slate-700">{item.teacherCount || 18}</span> o‘qituvchi</p>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Aloqa & Ish Vaqti',
      render: (item) => (
        <div className="text-xs text-slate-500">
          <p className="font-medium text-slate-700">{item.phone || '+998 71 200 00 55'}</p>
          <p className="text-[10px] text-slate-400">{item.workingHours || '08:30 - 18:00'}</p>
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
            onClick={() => setPreviewBranch(item)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Ko‘rish"
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

  const branchesList = branchesData?.data || [];
  const total = branchesData?.total || branchesList.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <FiMapPin className="text-blue-600" />
            {t('admin.branches', 'Filiallar & Kampuslar Boshqaruvi')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maktabning Toshkent, Samarqand va Buxoro aqlli kampuslari, manzillar va laboratoriyalar
          </p>
        </div>
        <div>
          <button
            onClick={() => setModalItem({})}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
          >
            <FiPlus size={15} />
            <span>Yangi Filial Qo‘shish</span>
          </button>
        </div>
      </div>

      <AdminDataTable
        title="Smart Campuses"
        subtitle="Maktab filiallari ro‘yxati"
        data={branchesList}
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
        exportFilename="campuses_branches.csv"
        idKey="id"
      />

      {/* Branch Modal */}
      <AnimatePresence>
        {modalItem && (
          <BranchEditorModal
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
        {previewBranch && (
          <BranchPreviewModal
            branch={previewBranch}
            onClose={() => setPreviewBranch(null)}
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
              <h3 className="text-sm font-bold text-slate-900">Filialni o‘chirish</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                Ushbu filialni butunlay o‘chirib tashlamoqchimisiz?
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

function BranchEditorModal({ item, onClose, onSave, loading }) {
  const isEditing = Boolean(item && (item._id || item.id));
  const [tab, setTab] = useState('overview');

  const initialLat = item?.latitude ? parseFloat(item.latitude) : 41.3385;
  const initialLng = item?.longitude ? parseFloat(item.longitude) : 69.3345;

  const [form, setForm] = useState({
    name: item?.name || '',
    shortName: item?.shortName || '',
    city: item?.city || 'Toshkent',
    address: item?.address || '',
    phone: item?.phone || '+998 71 200 00 55',
    email: item?.email || 'info@nis-ai.edu.uz',
    workingHours: item?.workingHours || 'Dush - Shanba: 08:30 - 18:00',
    description: item?.description || '',
    studentCount: item?.studentCount || 360,
    teacherCount: item?.teacherCount || 18,
    latitude: initialLat,
    longitude: initialLng,
    mapCoordinates: `${initialLat}, ${initialLng}`,
    directionsUrl: item?.directionsUrl || '',
    isLocationVerified: item?.isLocationVerified !== undefined ? Boolean(item.isLocationVerified) : true,
    status: item?.status || 'published',
    featured: item?.featured || false,
    slug: item?.slug || '',
    facilities: Array.isArray(item?.facilities) ? item.facilities.join(', ') : item?.facilities || 'NVIDIA GPU Cluster, AI Robotics Lab, Smart Classrooms, Sports Arena',
  });

  const [imageFile, setImageFile] = useState(null);

  const [translations, setTranslations] = useState(() => {
    const dict = {};
    const rawList = item?.translations || [];
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
    if (!dict.en && item?.name) {
      dict.en = { name: item.name, description: item.description || '', address: item.address || '', workingHours: item.workingHours || '' };
    }
    if (!dict.uz && item?.name) {
      dict.uz = { name: item.name, description: item.description || '', address: item.address || '', workingHours: item.workingHours || '' };
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
    if (!form.name) {
      toast.error('Filial nomi majburiy!');
      return;
    }
    const payload = new FormData();
    Object.entries(form).forEach(([k, v]) => payload.append(k, v));
    if (imageFile) {
      payload.append('image', imageFile);
      payload.append('photo', imageFile);
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
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full h-[85vh] max-h-[800px] flex flex-col overflow-hidden border border-slate-200"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FiMapPin size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-display">
                {isEditing ? `Filialni tahrirlash: ${item.name}` : 'Yangi Filial / Kampus'}
              </h2>
              <p className="text-[11px] text-slate-400">Filial infratuzilmasi, manzili va parametrlari</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <FiX size={18} />
          </button>
        </div>

        {/* Tab row */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white overflow-x-auto no-scrollbar flex-shrink-0">
          {[
            { id: 'overview', label: '1. Asosiy & Rasm' },
            { id: 'location', label: '2. Manzil & Aloqa' },
            { id: 'facilities', label: '3. Jihozlar & Qulayliklar' },
            { id: 'translations', label: '4. Tillar & SEO' },
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

        <form id="branch-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-5">
                <div className="w-24 h-16 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shadow-inner flex-shrink-0">
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="" className="w-full h-full object-cover" />
                  ) : item?.image ? (
                    <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiImage size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <label className="btn-secondary text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5">
                    <FiUploadCloud size={14} />
                    <span>Muqova rasmini yuklash</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Kampusning tashqi yoki ichki fasad fotosurati</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Filial Nomi *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input text-xs"
                    placeholder="Toshkent Markaziy Kampusi"
                  />
                </div>
                <div>
                  <label className="label text-xs">Qisqa Nomi / Kod</label>
                  <input
                    type="text"
                    value={form.shortName}
                    onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                    className="input text-xs"
                    placeholder="NIS Toshkent"
                  />
                </div>
                <div>
                  <label className="label text-xs">Shahar (City)</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="input text-xs"
                    placeholder="Toshkent"
                  />
                </div>
                <div>
                  <label className="label text-xs">Holati (Status)</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input text-xs cursor-pointer"
                  >
                    <option value="published">Faol (Published)</option>
                    <option value="draft">Qoralama (Draft)</option>
                    <option value="archived">Arxivlangan (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs">Filial Tavsifi</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input text-xs"
                  placeholder="Kampus imkoniyatlari, laboratoriyalar va o‘quv sharoitlari..."
                />
              </div>
            </div>
          )}

          {tab === 'location' && (
            <div className="space-y-4">
              <div>
                <label className="label text-xs font-semibold">To‘liq Manzil *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input text-xs"
                  placeholder="Toshkent sh., Mirzo Ulug'bek tumani, Universitet ko'chasi 7-uy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Aloqa Telefoni</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs">Ish Vaqti</label>
                  <input
                    type="text"
                    value={form.workingHours}
                    onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs">Geolokatsiya Holati</label>
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={form.isLocationVerified}
                      onChange={(e) => setForm({ ...form, isLocationVerified: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">Xaritadagi joylashuv tasdiqlangan</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Enlik (Latitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.latitude}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setForm({
                        ...form,
                        latitude: val,
                        mapCoordinates: `${val}, ${form.longitude}`,
                      });
                    }}
                    className="input text-xs font-mono"
                    placeholder="41.3385"
                  />
                </div>
                <div>
                  <label className="label text-xs">Bo‘ylik (Longitude)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.longitude}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setForm({
                        ...form,
                        longitude: val,
                        mapCoordinates: `${form.latitude}, ${val}`,
                      });
                    }}
                    className="input text-xs font-mono"
                    placeholder="69.3345"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Google Maps / Yandex Marshrut Havolasi (Ixtiyoriy)</label>
                <input
                  type="url"
                  value={form.directionsUrl}
                  onChange={(e) => setForm({ ...form, directionsUrl: e.target.value })}
                  className="input text-xs"
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>

              {/* Interactive Point Picker Map */}
              <BranchLocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={({ latitude, longitude }) => {
                  setForm((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    mapCoordinates: `${latitude}, ${longitude}`,
                  }));
                }}
              />
            </div>
          )}

          {tab === 'facilities' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">O‘quvchilar Sig‘imi</label>
                  <input
                    type="number"
                    value={form.studentCount}
                    onChange={(e) => setForm({ ...form, studentCount: parseInt(e.target.value) || 0 })}
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label text-xs">O‘qituvchilar Soni</label>
                  <input
                    type="number"
                    value={form.teacherCount}
                    onChange={(e) => setForm({ ...form, teacherCount: parseInt(e.target.value) || 0 })}
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Laboratoriyalar va Jihozlar (Vergul bilan ajrating)</label>
                <textarea
                  rows={4}
                  value={form.facilities}
                  onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                  className="input text-xs"
                  placeholder="NVIDIA GPU Cluster, AI Robotics Lab, Smart Boards, Olympic Swimming Pool, Coworking..."
                />
              </div>
            </div>
          )}

          {tab === 'translations' && (
            <div className="space-y-4">
              <div>
                <label className="label text-xs">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="input text-xs font-mono"
                  placeholder="tashkent-central"
                />
              </div>

              <div className="pt-2">
                <MultilingualTranslationTabs
                  fields={branchTransFields}
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
            form="branch-form"
            disabled={loading}
            className="btn-primary text-xs py-2 px-6 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <FiCheck size={14} />
            <span>{loading ? 'Saqlanmoqda...' : 'Saqlash va Tasdiqlash'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function BranchPreviewModal({ branch, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
      >
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800">Jonli Kampus Ko‘rinishi (Public Preview)</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer">
            <FiX size={16} />
          </button>
        </div>

        <div className="overflow-hidden">
          <div className="h-44 bg-slate-900 relative">
            <img
              src={getImageUrl(branch.image || branch.photo, 'https://images.unsplash.com/photo-1562774053-701939374585?w=500&q=80')}
              alt=""
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
              <div>
                <h4 className="text-lg font-black font-display text-white">{branch.name}</h4>
                <p className="text-xs text-blue-200 flex items-center gap-1 mt-0.5">
                  <FiMapPin size={12} />
                  <span>{branch.address || branch.city}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-lg font-bold font-display text-slate-900">{branch.studentCount || 360}</p>
                <p className="text-[10px] text-slate-400">O‘quvchilar</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-lg font-bold font-display text-slate-900">{branch.teacherCount || 18}</p>
                <p className="text-[10px] text-slate-400">Ustozlar</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100">
              {branch.description || 'Kampus tavsifi.'}
            </p>

            <div className="text-xs text-slate-500 space-y-1 pt-1">
              <p className="flex items-center gap-1.5"><FiPhone size={13} className="text-blue-600" /> {branch.phone || '+998 71 200 00 55'}</p>
              <p className="flex items-center gap-1.5"><FiClock size={13} className="text-blue-600" /> {branch.workingHours || '08:30 - 18:00'}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button onClick={onClose} className="btn-secondary text-xs py-1.5 px-4 cursor-pointer">
            Yopish
          </button>
        </div>
      </motion.div>
    </div>
  );
}
