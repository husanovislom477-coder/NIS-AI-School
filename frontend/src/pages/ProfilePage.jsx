import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI, applicationAPI } from '../api';
import toast from 'react-hot-toast';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiSave,
  FiShield,
  FiLock,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiPlusCircle,
  FiGlobe,
  FiSettings,
} from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const location = useLocation();

  const [tab, setTab] = useState(location.state?.defaultTab || 'profile');
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    middleName: user?.middleName || '',
    phone: user?.phone || '',
    language: user?.language || localStorage.getItem('nis_language') || 'en',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  // My Applications State
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    if (tab === 'applications') {
      fetchMyApplications();
    }
  }, [tab]);

  const fetchMyApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await applicationAPI.getMy();
      if (res.data?.success) {
        setApplications(res.data.data || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingApps(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await authAPI.updateProfile(fd);
      updateUser(data.data);
      toast.success(t('profile.saveSuccess', 'Profil muvaffaqiyatli yangilandi!'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', 'Xatolik yuz berdi'));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error(t('settings.passwordMismatch', 'Yangi parollar mos kelmadi!'));
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success(t('settings.passwordSuccess', "Parol muvaffaqiyatli o'zgartirildi!"));
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', 'Xatolik yuz berdi'));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            {t('application.status.ACCEPTED', 'Qabul qilindi (Approved)')}
          </span>
        );
      case 'REVIEWING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {t('application.status.REVIEWING', "Ko'rilmoqda (Reviewing)")}
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            {t('application.status.CONTACTED', "Bog'lanildi (Contacted)")}
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            {t('application.status.REJECTED', 'Rad etildi (Rejected)')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            {t('application.status.NEW', 'Kutilmoqda (Pending)')}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-school-700 to-school-900 text-white pt-24 sm:pt-28 pb-14 px-4">
        <PageHeroBackground category="ai" variant="network" opacity="opacity-25" />
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-school-500 to-school-700 flex items-center justify-center text-2xl font-bold border-4 border-white/20 shadow-lg overflow-hidden shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display leading-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-school-200 text-sm mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-white/20 text-white">
                  {user?.role === 'admin' ? t('profile.adminRole', 'Administrator') : t('profile.userRole', 'Foydalanuvchi')}
                </span>
                {user?.phone && (
                  <span className="text-xs text-school-200">· {user.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden py-10 bg-slate-50/50">
        <SectionAnimatedBackground variant="waves" />
        <div className="container-custom relative z-10">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto no-scrollbar">
          {[
            ['profile', <FiUser size={15} />, t('profile.personalInfo', 'Profil ma\'lumotlari')],
            ['applications', <FiFileText size={15} />, t('profile.myApplications', 'Mening arizalarim')],
            ['password', <FiLock size={15} />, t('settings.security', 'Parol & Xavfsizlik')],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === key
                  ? 'border-school-600 text-school-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {icon} {label}
            </button>
          ))}
          <Link
            to="/settings"
            className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-school-600 hover:text-school-800 hover:border-school-200 transition-colors whitespace-nowrap ml-auto"
          >
            <FiSettings size={15} /> {t('settings.title', 'Barcha sozlamalar')}
          </Link>
        </div>

        {/* ─── TAB 1: PROFILE ─── */}
        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
            <form onSubmit={saveProfile} className="card p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('auth.firstName', 'Ism')}</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">{t('auth.lastName', 'Familiya')}</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('profile.middleName', 'Sharif (Otasining ismi)')}</label>
                <input
                  value={form.middleName}
                  onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  placeholder={t('profile.middleNamePlaceholder', 'Otasining ismi')}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">{t('auth.email', 'Email manzil')}</label>
                <input
                  value={user?.email}
                  disabled
                  className="input-field bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="label">{t('auth.phone', 'Telefon')}</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="input-field"
                />
              </div>

              <div>
                <label className="label flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FiGlobe size={14} className="text-school-600" /> {t('settings.language', 'Tizim tili')}
                  </span>
                  <Link to="/settings" className="text-xs text-school-600 hover:underline">
                    {t('settings.title', 'Sozlamalar')} →
                  </Link>
                </label>
                <select
                  value={language}
                  onChange={(e) => {
                    const l = e.target.value;
                    setForm({ ...form, language: l });
                    setLanguage(l);
                  }}
                  className="input-field cursor-pointer"
                >
                  {availableLanguages && availableLanguages.filter(l => l.isEnabled !== false).map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName || lang.name} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">{t('profile.avatarChange', 'Profil rasmi')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0])}
                  className="input-field py-2 text-xs text-slate-500"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
                <FiSave size={15} /> {saving ? t('settings.saving', 'Saqlanmoqda...') : t('common.save', 'Saqlash')}
              </button>
            </form>
          </motion.div>
        )}

        {/* ─── TAB 2: MY APPLICATIONS ─── */}
        {tab === 'applications' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900">
                  {t('profile.myApplications', 'Mening Qabul Arizalarim')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('profile.applicationsSubtitle', 'NIS AI School ga topshirgan barcha arizalaringiz va ularning holati')}
                </p>
              </div>
              <Link
                to="/application"
                className="btn-primary py-2 px-3.5 text-xs font-semibold"
              >
                <FiPlusCircle size={14} /> {t('profile.newApplication', 'Yangi ariza topshirish')}
              </Link>
            </div>

            {loadingApps ? (
              <div className="py-16 text-center">
                <div className="spinner mx-auto mb-2" />
                <p className="text-xs text-slate-400">{t('common.loading', 'Arizalar yuklanmoqda...')}</p>
              </div>
            ) : applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => {
                  const isExpanded = expandedAppId === app._id;
                  return (
                    <div
                      key={app._id}
                      className="card p-5 hover:border-slate-300 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-school-700 bg-school-50 px-2 py-0.5 rounded text-xs">
                              {app.applicationNumber}
                            </span>
                            <span className="text-xs font-semibold text-slate-900">
                              {app.applicantName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {t('application.branch', 'Filial')}: <strong className="text-slate-700">{app.campusName}</strong> · {t('application.direction', "Yo'nalish")}: <strong className="text-slate-700">{app.direction}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(app.status)}
                          <button
                            type="button"
                            onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label={t('common.details', 'Tafsilotlar')}
                          >
                            {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div className="pt-4 text-xs text-slate-600 space-y-2 animate-fade-in">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 block text-[10px]">{t('application.type', 'Ariza turi')}:</span>
                              <span className="font-semibold capitalize text-slate-800">{app.applicationType}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">{t('application.gradeLevel', 'Sinf')}:</span>
                              <span className="font-semibold text-slate-800">{app.desiredGrade}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">{t('news.published', 'Topshirilgan sana')}:</span>
                              <span className="font-semibold text-slate-800">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {app.motivation && (
                            <div className="pt-2">
                              <span className="font-semibold text-slate-700 block text-[11px] mb-1">
                                {t('application.message', 'Motivatsion xat')}:
                              </span>
                              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed text-[11px]">
                                {app.motivation}
                              </p>
                            </div>
                          )}

                          {app.adminNotes && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 text-xs">
                              <strong>{t('profile.commissionNote', 'Komissiya xabari')}:</strong> {app.adminNotes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <FiFileText size={36} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold font-display text-slate-800 text-base">
                  {t('profile.noApplications', 'Hali arizalar topshirilmagan')}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  {t('profile.noApplicationsDesc', 'Siz hali NIS AI School qabul arizasini topshirmadingiz. Onlayn qabul portali orqali ariza topshirishingiz mumkin.')}
                </p>
                <Link to="/application" className="btn-primary py-2.5 px-5 text-xs font-semibold inline-flex">
                  {t('profile.applyPortal', 'Ariza topshirish portali')} →
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TAB 3: PASSWORD ─── */}
        {tab === 'password' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl">
            <form onSubmit={changePassword} className="card p-6 sm:p-8 space-y-4">
              <div>
                <label className="label">{t('settings.currentPassword', 'Joriy parol')}</label>
                <input
                  type="password"
                  required
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">{t('settings.newPassword', 'Yangi parol (kamida 6 belgi)')}</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">{t('settings.confirmNewPassword', 'Yangi parolni tasdiqlang')}</label>
                <input
                  type="password"
                  required
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3">
                <FiShield size={15} /> {saving ? t('settings.saving', 'Saqlanmoqda...') : t('settings.savePassword', 'Parolni yangilash')}
              </button>
            </form>
          </motion.div>
        )}
        </div>
      </section>
    </div>
  );
}
