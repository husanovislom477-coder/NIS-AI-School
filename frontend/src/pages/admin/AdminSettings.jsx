import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  FiSettings, FiSave, FiRefreshCw, FiGlobe, FiMail,
  FiPhone, FiMapPin, FiShield, FiAlertCircle, FiCheckCircle,
  FiSend, FiInstagram, FiYoutube, FiGithub, FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import { adminAPI } from '../../api';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminSettings() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    schoolName: 'NIS AI School',
    contactEmail: 'info@nis-ai.edu.uz',
    contactPhone: '+998 71 200 00 55',
    address: 'Toshkent sh., Yunusobod tumani, Amir Temur 108',
    workingHours: 'Dush - Shanba: 09:00 - 18:00',
    defaultLanguage: 'uz',
    allowRegistrations: true,
    allowApplications: true,
    maintenanceMode: false,
    bannerNotice: '',
    bannerActive: false,
    telegram: 'https://t.me/nis_ai_school',
    instagram: 'https://instagram.com/nis_ai_school',
    youtube: 'https://youtube.com/@nis_ai_school',
    github: 'https://github.com/nis-ai-school',
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await adminAPI.getSettings();
      return res.data?.data || {};
    },
  });

  useEffect(() => {
    if (settingsData && Object.keys(settingsData).length > 0) {
      setForm({
        schoolName: settingsData.schoolName || 'NIS AI School',
        contactEmail: settingsData.contactEmail || 'info@nis-ai.edu.uz',
        contactPhone: settingsData.contactPhone || '+998 71 200 00 55',
        address: settingsData.address || 'Toshkent sh., Yunusobod tumani, Amir Temur 108',
        workingHours: settingsData.workingHours || 'Dush - Shanba: 09:00 - 18:00',
        defaultLanguage: settingsData.defaultLanguage || 'uz',
        allowRegistrations: settingsData.allowRegistrations ?? true,
        allowApplications: settingsData.allowApplications ?? true,
        maintenanceMode: settingsData.maintenanceMode ?? false,
        bannerNotice: settingsData.bannerNotice || '',
        bannerActive: settingsData.bannerActive ?? false,
        telegram: settingsData.socialLinks?.telegram || settingsData.telegram || '',
        instagram: settingsData.socialLinks?.instagram || settingsData.instagram || '',
        youtube: settingsData.socialLinks?.youtube || settingsData.youtube || '',
        github: settingsData.socialLinks?.github || settingsData.github || '',
      });
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const payload = {
        ...updatedData,
        socialLinks: {
          telegram: updatedData.telegram,
          instagram: updatedData.instagram,
          youtube: updatedData.youtube,
          github: updatedData.github,
        },
      };
      const res = await adminAPI.updateSettings(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-settings']);
      toast.success(t('admin.settingsSaved', 'Sozlamalar muvaffaqiyatli saqlandi!'));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Sozlamalarni saqlashda xatolik yuz berdi.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleToggle = (key) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <FiSettings className="text-blue-600" />
            {t('nav.settings', 'Tizim va Maktab Sozlamalari')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maktab aloqa ma'lumotlari, ijtimoiy tarmoqlar, xavfsizlik va global konfiguratsiya
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => queryClient.invalidateQueries(['admin-settings'])}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Yangilash"
          >
            <FiRefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>Yangilash</span>
          </button>
          <button
            type="submit"
            form="settings-form"
            disabled={updateMutation.isPending}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <FiSave size={15} />
            <span>{updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}</span>
          </button>
        </div>
      </div>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Info & Contact */}
        <div className="card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiGlobe size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Maktab Asosiy Rekvizitlari</h2>
              <p className="text-[11px] text-slate-400">Sayt sarlavhasi, kontaktlar va manzil parametrlari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Maktab Rasmiy Nomi</label>
              <input
                type="text"
                value={form.schoolName}
                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="label text-xs">Asosiy Ishchi Til (Default Language)</label>
              <select
                value={form.defaultLanguage}
                onChange={(e) => setForm({ ...form, defaultLanguage: e.target.value })}
                className="input text-xs cursor-pointer"
              >
                <option value="uz">🇺🇿 O‘zbekcha (O'zbek tili)</option>
                <option value="en">🇬🇧 English</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="tr">🇹🇷 Türkçe</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="es">🇪🇸 Español</option>
                <option value="ko">🇰🇷 한국어</option>
                <option value="zh">🇨🇳 中文</option>
                <option value="ja">🇯🇵 日本語</option>
              </select>
            </div>

            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiMail size={12} className="text-slate-400" />
                <span>Rasmiy Aloqa E-pochtasi</span>
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiPhone size={12} className="text-slate-400" />
                <span>Markaziy Call-Markaz / Telefon</span>
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiMapPin size={12} className="text-slate-400" />
                <span>Bosh Ofis Manzili</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input text-xs"
                required
              />
            </div>

            <div>
              <label className="label text-xs">Ish Tartibi va Qabul Soatlari</label>
              <input
                type="text"
                value={form.workingHours}
                onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                className="input text-xs"
                placeholder="Dush - Shanba: 09:00 - 18:00"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Admissions & System Access Switches */}
        <div className="card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiShield size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Qabul va Kirish Nazorati</h2>
              <p className="text-[11px] text-slate-400">Ariza qabul qilish, ro‘yxatdan o‘tish va texnik holat slayderlari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admissions toggle */}
            <div
              onClick={() => handleToggle('allowApplications')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                form.allowApplications
                  ? 'bg-blue-50/50 border-blue-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Onlayn Qabul Arixalari</span>
                  <button
                    type="button"
                    className={`text-xl transition-colors cursor-pointer ${
                      form.allowApplications ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    {form.allowApplications ? <FiToggleRight size={26} /> : <FiToggleLeft size={26} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomzodlar /application orqali maktabga yangi ariza topshirishi mumkin.
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider mt-3 inline-block ${
                  form.allowApplications ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {form.allowApplications ? 'Faol (Ochiq)' : 'Yopiq (To‘xtatilgan)'}
              </span>
            </div>

            {/* Registrations toggle */}
            <div
              onClick={() => handleToggle('allowRegistrations')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                form.allowRegistrations
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Foydalanuvchi Ro‘yxati</span>
                  <button
                    type="button"
                    className={`text-xl transition-colors cursor-pointer ${
                      form.allowRegistrations ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {form.allowRegistrations ? <FiToggleRight size={26} /> : <FiToggleLeft size={26} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Yangi o‘quvchi va ota-onalar tizimda o‘z hisoblarini yarata oladilar.
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider mt-3 inline-block ${
                  form.allowRegistrations ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {form.allowRegistrations ? 'Ruxsat Berilgan' : 'Bloklangan'}
              </span>
            </div>

            {/* Maintenance Mode */}
            <div
              onClick={() => handleToggle('maintenanceMode')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                form.maintenanceMode
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Texnik Tanaffus Rejimi</span>
                  <button
                    type="button"
                    className={`text-xl transition-colors cursor-pointer ${
                      form.maintenanceMode ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    {form.maintenanceMode ? <FiToggleRight size={26} /> : <FiToggleLeft size={26} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Faqat adminlar kira oladi, oddiy foydalanuvchilarga bildirishnoma ko‘rsatiladi.
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider mt-3 inline-block ${
                  form.maintenanceMode ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {form.maintenanceMode ? 'Texnik Ta\'mirlashda' : 'Oddiy Ishchi Rejim'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Global Notification Banner */}
        <div className="card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiAlertCircle size={15} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Bosh Sahifa E’lon Qatori (Global Banner)</h2>
                <p className="text-[11px] text-slate-400">Sayt yuqori qismida barcha foydalanuvchilarga ko‘rinadigan shoshilinch e'lon</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('bannerActive')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border ${
                form.bannerActive
                  ? 'bg-purple-100 text-purple-700 border-purple-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              <span>{form.bannerActive ? 'E’lon Faol' : 'E’lon O‘chiq'}</span>
            </button>
          </div>

          <div>
            <label className="label text-xs">E'lon Matni</label>
            <input
              type="text"
              value={form.bannerNotice}
              onChange={(e) => setForm({ ...form, bannerNotice: e.target.value })}
              className="input text-xs"
              placeholder="Masalan: 🚀 2026/2027 o‘quv yili uchun qabul imtihonlari boshlandi! Ro‘yxatdan o‘tishga shoshiling."
            />
          </div>
        </div>

        {/* Section 4: Social Media Links */}
        <div className="card p-5 bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiSend size={15} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Ijtimoiy Tarmoq Havolalari</h2>
              <p className="text-[11px] text-slate-400">Sayt footer va header qismida aks etadigan rasmiy sahifalar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiSend size={12} className="text-blue-500" />
                <span>Telegram Kanal / Bot</span>
              </label>
              <input
                type="url"
                value={form.telegram}
                onChange={(e) => setForm({ ...form, telegram: e.target.value })}
                className="input text-xs"
                placeholder="https://t.me/nis_ai_school"
              />
            </div>

            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiInstagram size={12} className="text-pink-500" />
                <span>Instagram Sahifasi</span>
              </label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="input text-xs"
                placeholder="https://instagram.com/nis_ai_school"
              />
            </div>

            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiYoutube size={12} className="text-red-500" />
                <span>YouTube Kanal</span>
              </label>
              <input
                type="url"
                value={form.youtube}
                onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                className="input text-xs"
                placeholder="https://youtube.com/@nis_ai_school"
              />
            </div>

            <div>
              <label className="label text-xs flex items-center gap-1.5">
                <FiGithub size={12} className="text-slate-800" />
                <span>GitHub Tashkiloti</span>
              </label>
              <input
                type="url"
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                className="input text-xs"
                placeholder="https://github.com/nis-ai-school"
              />
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow"
          >
            <FiSave size={15} />
            <span>{updateMutation.isPending ? 'Saqlanmoqda...' : 'Barcha Sozlamalarni Saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
