import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiImage, FiVideo, FiFileText, FiUploadCloud, FiTrash2,
  FiCopy, FiEye, FiDownload, FiSearch, FiGrid, FiList,
  FiCheck, FiX, FiHardDrive
} from 'react-icons/fi';
import { adminAPI } from '../../api';
import { getImageUrl } from '../../utils/image';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminMedia() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch media list
  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const res = await adminAPI.getMedia();
      return res.data?.data || [];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminAPI.uploadMedia(formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media']);
      toast.success(t('admin.mediaUploadSuccess', 'Media fayl muvaffaqiyatli yuklandi!'));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('admin.mediaUploadError', 'Yuklashda xatolik yuz berdi.'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (filename) => {
      const res = await adminAPI.deleteMedia(filename);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-media']);
      toast.success(t('admin.mediaDeleteSuccess', 'Fayl muvaffaqiyatli o‘chirildi.'));
      setDeleteConfirm(null);
      if (previewItem?.filename === deleteConfirm) {
        setPreviewItem(null);
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'O‘chirishda xatolik yuz berdi.');
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const copyToClipboard = (url, id) => {
    const fullUrl = getImageUrl(url);
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success('URL nusxalandi: ' + fullUrl);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allFiles = Array.isArray(mediaData) ? mediaData : [];

  // Filtered files
  const filtered = allFiles.filter((item) => {
    const matchesSearch = item.filename?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const totalFiles = allFiles.length;
  const imageFiles = allFiles.filter((f) => f.type === 'image').length;
  const videoFiles = allFiles.filter((f) => f.type === 'video').length;
  const docFiles = allFiles.filter((f) => f.type === 'document').length;
  const totalSizeBytes = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">
            {t('admin.media', 'Media Kutubxona')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suratlar, videoroliklar va maktab hujjatlarini boshqarish va yuklash markazi
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <FiUploadCloud size={16} />
            <span>{uploadMutation.isPending ? 'Yuklanmoqda...' : t('admin.uploadMedia', 'Fayl yuklash')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="card p-3.5 border-l-4 border-l-blue-600 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Jami Fayllar</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiHardDrive size={14} />
            </div>
          </div>
          <p className="text-lg font-bold font-display text-slate-900 mt-2">{totalFiles}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalSizeMB} MB hajm band</p>
        </div>

        <div className="card p-3.5 border-l-4 border-l-emerald-600 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rasmlar</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiImage size={14} />
            </div>
          </div>
          <p className="text-lg font-bold font-display text-slate-900 mt-2">{imageFiles}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP, SVG</p>
        </div>

        <div className="card p-3.5 border-l-4 border-l-purple-600 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Videolar</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiVideo size={14} />
            </div>
          </div>
          <p className="text-lg font-bold font-display text-slate-900 mt-2">{videoFiles}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">MP4, WEBM, MOV</p>
        </div>

        <div className="card p-3.5 border-l-4 border-l-amber-600 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hujjatlar</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiFileText size={14} />
            </div>
          </div>
          <p className="text-lg font-bold font-display text-slate-900 mt-2">{docFiles}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">PDF va taqdimotlar</p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="card p-6 border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/20 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
          <FiUploadCloud size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-800">
            Fayllarni bu yerga tashlang yoki kompyuterdan tanlash uchun bosing
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Formatlar: JPG, PNG, WEBP, SVG, MP4, PDF (Maksimal hajm: 20MB)
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card p-3.5 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Fayl nomi bo‘yicha qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-8.5 pr-3 py-1.5 text-xs w-full"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'image', label: 'Rasmlar' },
              { id: 'video', label: 'Videolar' },
              { id: 'document', label: 'Hujjatlar' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">
            {filtered.length} ta fayl
          </span>
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid ko‘rinishi"
            >
              <FiGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Ro‘yxat ko‘rinishi"
            >
              <FiList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="card p-12 text-center text-slate-400">
          <div className="spinner !w-7 !h-7 !border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs font-medium">Media kutubxona yuklanmoqda...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <FiImage size={36} className="mx-auto mb-2 opacity-40 text-slate-400" />
          <p className="text-xs font-semibold text-slate-600">Hech qanday media fayl topilmadi</p>
          <p className="text-[11px] text-slate-400 mt-1">Fayl yuklang yoki qidiruv so‘zini o‘zgartiring</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {filtered.map((item) => {
            const isImage = item.type === 'image';
            const isVideo = item.type === 'video';
            const imgUrl = getImageUrl(item.url);

            return (
              <div
                key={item.id}
                className="card group overflow-hidden bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col"
              >
                {/* Media Thumbnail */}
                <div
                  onClick={() => setPreviewItem(item)}
                  className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center cursor-pointer group/thumb"
                >
                  {isImage ? (
                    <img
                      src={imgUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : isVideo ? (
                    <div className="flex flex-col items-center justify-center text-purple-600 gap-1 p-2 text-center">
                      <FiVideo size={28} />
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-50 px-1.5 py-0.5 rounded">
                        Video
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-amber-600 gap-1 p-2 text-center">
                      <FiFileText size={28} />
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 px-1.5 py-0.5 rounded">
                        {item.extension?.replace('.', '') || 'Doc'}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewItem(item);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs cursor-pointer shadow"
                      title="Ko‘rish"
                    >
                      <FiEye size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.url, item.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs cursor-pointer shadow"
                      title="URL nusxalash"
                    >
                      {copiedId === item.id ? <FiCheck size={13} className="text-emerald-600" /> : <FiCopy size={13} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item.filename);
                      }}
                      className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-600 text-xs cursor-pointer shadow"
                      title="O‘chirish"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5 flex-1 flex flex-col justify-between border-t border-slate-100">
                  <p className="text-[11px] font-medium text-slate-800 truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{item.sizeFormatted}</span>
                    <span className="uppercase">{item.extension}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden bg-white border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Fayl</th>
                  <th className="px-4 py-3">Turi</th>
                  <th className="px-4 py-3">Hajmi</th>
                  <th className="px-4 py-3">Sana</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isImage = item.type === 'image';
                  const imgUrl = getImageUrl(item.url);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
                          {isImage ? (
                            <img src={imgUrl} alt={item.filename} className="w-full h-full object-cover" />
                          ) : item.type === 'video' ? (
                            <FiVideo size={16} className="text-purple-600" />
                          ) : (
                            <FiFileText size={16} className="text-amber-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-xs">{item.filename}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.url}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge-gray uppercase text-[10px] font-bold">
                          {item.type} ({item.extension})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{item.sizeFormatted}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewItem(item)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Ko‘rish"
                          >
                            <FiEye size={14} />
                          </button>
                          <button
                            onClick={() => copyToClipboard(item.url, item.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="URL nusxalash"
                          >
                            {copiedId === item.id ? <FiCheck size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.filename)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                            title="O‘chirish"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
                <div className="min-w-0 pr-4">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{previewItem.filename}</h3>
                  <p className="text-[10px] text-slate-500">{previewItem.sizeFormatted} • {previewItem.type.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[60vh] overflow-auto">
                {previewItem.type === 'image' ? (
                  <img
                    src={getImageUrl(previewItem.url)}
                    alt={previewItem.filename}
                    className="max-h-[55vh] object-contain rounded"
                  />
                ) : previewItem.type === 'video' ? (
                  <video
                    src={getImageUrl(previewItem.url)}
                    controls
                    className="max-h-[55vh] max-w-full rounded"
                  />
                ) : (
                  <div className="text-center text-white py-12">
                    <FiFileText size={48} className="mx-auto mb-3 text-slate-400" />
                    <p className="text-xs font-semibold">{previewItem.filename}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Oldindan ko‘rish imkoni yo‘q hujjat formati</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 truncate max-w-xs font-mono bg-slate-50 px-2 py-1 rounded border border-slate-200">
                  {getImageUrl(previewItem.url)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(previewItem.url, previewItem.id)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiCopy size={13} />
                    <span>Nusxalash</span>
                  </button>
                  <a
                    href={getImageUrl(previewItem.url)}
                    download={previewItem.filename}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiDownload size={13} />
                    <span>Yuklab olish</span>
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(previewItem.filename)}
                    className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiTrash2 size={13} />
                    <span>O‘chirish</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
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
              <h3 className="text-sm font-bold text-slate-900">Faylni o‘chirishni tasdiqlang</h3>
              <p className="text-xs text-slate-500 mt-1.5">
                <span className="font-semibold text-slate-800 break-all">{deleteConfirm}</span> faylini butunlay o‘chirib tashlamoqchimisiz?
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
