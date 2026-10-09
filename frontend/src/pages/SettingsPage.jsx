import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import {
  FiSettings,
  FiUser,
  FiLock,
  FiGlobe,
  FiSave,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiMail,
  FiShield,
  FiKey,
} from 'react-icons/fi';
import PageHeroBackground from '../components/common/PageHeroBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { language, setLanguage, t, languages } = useLanguage();

  const [activeTab, setActiveTab] = useState('language'); // Start on Language tab as primary focus

  // Name & Profile Form
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [langSaving, setLangSaving] = useState(false);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      if (user.language || user.languageCode) {
        setSelectedLanguage(user.languageCode || user.language);
      }
    }
  }, [user]);

  // Handle Name and Personal info update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      return toast.error(t('settings.fillRequired', "Please fill in all required fields!"));
    }
    setProfileSaving(true);
    try {
      const fd = new FormData();
      fd.append('firstName', profileForm.firstName.trim());
      fd.append('lastName', profileForm.lastName.trim());
      if (profileForm.phone) fd.append('phone', profileForm.phone.trim());

      const res = await authAPI.updateProfile(fd);
      if (res.data?.data) {
        updateUser(res.data.data);
      } else {
        updateUser({ ...user, firstName: profileForm.firstName, lastName: profileForm.lastName, phone: profileForm.phone });
      }
      toast.success(t('settings.savedSuccess', "Settings saved successfully!"));
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', "Something went wrong"));
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      return toast.error(t('settings.currentPwRequired', "Please enter your current password!"));
    }
    if (pwForm.newPassword.length < 6) {
      return toast.error(t('settings.newPwMin', "New password must be at least 6 characters!"));
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return toast.error(t('settings.pwMismatch', "Passwords do not match!"));
    }

    setPwSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success(t('settings.pwChanged', "Password changed successfully!"));
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error', "Failed to change password"));
    } finally {
      setPwSaving(false);
    }
  };

  // Handle Language selection: immediate switch without reload!
  const handleSelectLanguage = async (code) => {
    setLanguage(code);
    setSelectedLanguage(code);
    setLangSaving(true);

    try {
      const fd = new FormData();
      fd.append('language', code);
      fd.append('languageCode', code);
      const res = await authAPI.updateProfile(fd);
      if (res.data?.data) {
        updateUser(res.data.data);
      }
      toast.success(t('settings.languageUpdated', 'Platform language updated successfully!'));
    } catch {
      // Local preference is already active
      toast.success(t('settings.languageUpdated', 'Platform language updated successfully!'));
    } finally {
      setLangSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-school-700 to-school-900 text-white pt-24 sm:pt-28 pb-12 px-4">
        <PageHeroBackground category="ai" variant="network" opacity="opacity-25" />
        <div className="container-custom relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-elevation-2">
              <FiSettings size={28} className="animate-spin-slow" />
            </div>
            <div>
              <span className="text-school-200 text-xs font-semibold uppercase tracking-wider">
                {t('profile.title', 'User Profile')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-display leading-tight">
                {t('settings.title', 'System Settings')}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                {t('settings.subtitle', 'Manage your profile, security password, and preferred language')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 relative z-10">
        <SectionAnimatedBackground variant="waves" />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <div className="card p-3 space-y-1">
              {[
                { id: 'language', label: t('settings.language', 'Language'), icon: FiGlobe },
                { id: 'general', label: `${t('auth.firstName', 'First Name')} & ${t('auth.lastName', 'Last Name')}`, icon: FiUser },
                { id: 'password', label: t('settings.security', 'Password & Security'), icon: FiLock },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-left transition-all ${
                      isActive
                        ? 'bg-school-50 text-school-700 shadow-xs border border-school-200/80'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-school-600' : 'text-slate-400'} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* User card info */}
            <div className="card p-4 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-school-600 to-school-800 text-white font-bold flex items-center justify-center text-lg mx-auto mb-2 shadow-sm">
                {user?.firstName?.[0] || 'U'}
                {user?.lastName?.[0] || ''}
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-slate-400 text-xs truncate mt-0.5">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium">
                <FiShield size={12} className="text-school-600" />
                <span>{user?.role === 'admin' ? t('admin.dashboard', 'Administrator') : t('profile.role', 'User')}</span>
              </div>
            </div>
          </div>

          {/* Settings Main Content Pane */}
          <div className="lg:col-span-3">

            {/* ─── TAB: LANGUAGE (SETTINGS -> LANGUAGE) ─── */}
            {activeTab === 'language' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiGlobe size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-900">
                      {t('settings.language', 'Language')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('settings.chooseLanguage', 'Choose your preferred language for the NIS AI School platform')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-w-xl">
                  {languages && languages.map((item) => {
                    const isSelected = (selectedLanguage || '').toLowerCase() === (item.code || '').toLowerCase();
                    return (
                      <div
                        key={item.code}
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? 'border-school-600 bg-school-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="text-2xl">{item.flag || '🌐'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{item.name || item.label}</span>
                              <span className="text-xs text-slate-500">({item.nativeName})</span>
                              {item.code === 'en' && (
                                <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.description || `${item.name} interface`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected ? (
                            <span className="w-7 h-7 rounded-full bg-school-600 text-white flex items-center justify-center shadow-xs">
                              <FiCheck size={16} />
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-school-800 flex items-start gap-2.5 max-w-xl">
                  <FiGlobe size={16} className="text-school-600 mt-0.5 flex-shrink-0" />
                  <p>
                    {t('settings.languageNotice', 'When you change the language, the entire application interface, database content, navigation, and settings update immediately without requiring a page refresh.')}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─── TAB: GENERAL (FIRST NAME & LAST NAME) ─── */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-school-50 text-school-600 flex items-center justify-center">
                    <FiUser size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-900">
                      {t('settings.personal', 'Personal Information')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('settings.personalSubtitle', 'Update your name and contact info. Appears on certificates and applications.')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t('auth.firstName', 'First Name')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {t('auth.lastName', 'Last Name')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('auth.phone', 'Phone Number')}
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+998 90 123 45 67"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('auth.email', 'Email Address')}
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                    >
                      <FiSave size={14} />
                      {profileSaving ? t('settings.saving', 'Saving...') : t('settings.saveChanges', 'Save Changes')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ─── TAB: PASSWORD & SECURITY ─── */}
            {activeTab === 'password' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <FiLock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-display text-slate-900">
                      {t('settings.security', 'Password & Security')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('settings.securitySubtitle', 'Protect your account by regularly updating your password')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('settings.currentPassword', 'Current Password')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={pwForm.currentPassword}
                        onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('settings.newPassword', 'New Password (min 6 characters)')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        required
                        minLength={6}
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {t('settings.confirmNewPassword', 'Confirm New Password')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={pwForm.confirmPassword}
                      onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-school-500/20 text-slate-800"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={pwSaving}
                      className="btn-primary px-6 py-2.5 text-xs flex items-center gap-2"
                    >
                      <FiKey size={14} />
                      {pwSaving ? t('settings.saving', 'Saving...') : t('settings.savePassword', 'Save New Password')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
