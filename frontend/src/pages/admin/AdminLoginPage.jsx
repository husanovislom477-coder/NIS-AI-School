import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import toast from 'react-hot-toast';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiKey, FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export default function AdminLoginPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // 2MFA state
  const [admin2FA, setAdmin2FA] = useState(null); // { email, twoFactorCode }
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(form.email, form.password, null, rememberMe);
      if (res?.requires2FA) {
        setAdmin2FA({
          email: res.email || form.email,
          twoFactorCode: res.twoFactorCode || '',
        });
        setTwoFactorInput(res.twoFactorCode || '');
        toast.success(t('auth.adminDetected', '2MFA xavfsizlik kodi talab qilinadi.'));
        return;
      }
      toast.success(t('auth.adminLoginSuccess', 'Admin tizimiga kirish muvaffaqiyatli!'));
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidAdminCredentials', 'Noto\'g\'ri admin ma\'lumotlari'));
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorInput.trim()) {
      return toast.error(t('auth.enter2faCode', '2MFA kodini kiriting!'));
    }
    setVerifying2FA(true);
    try {
      await adminLogin(form.email, form.password, twoFactorInput.trim(), rememberMe);
      toast.success(t('auth.admin2faSuccess', '2MFA tasdiqlandi! Admin panelga xush kelibsiz!'));
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidCode', 'Noto\'g\'ri 2MFA kodi'));
    } finally {
      setVerifying2FA(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_65%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-3xl p-8 shadow-2xl">
          {admin2FA ? (
            /* ─── Step 2: 2MFA Security Screen ─── */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3 shadow-glow text-white">
                  <FiKey size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
                  <FiShield size={12} /> {t('auth.admin2mfaStep', '2MFA Himoyasi')}
                </div>
                <h1 className="text-2xl font-bold font-display text-white">{t('auth.admin2mfaTitle', 'Admin 2MFA Tasdiqlash')}</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                  {t('auth.admin2mfaSubtitle', 'Admin panelga kirish uchun 2-bosqichli xavfsizlik kodini kiriting')}
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-lg bg-slate-700 text-slate-300 text-xs font-mono">
                  {admin2FA.email}
                </div>
              </div>

              {admin2FA.twoFactorCode && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <FiKey className="text-blue-400" size={16} />
                    <span className="text-xs text-blue-300">
                      {t('auth.twoFaCodeLabel', '2MFA Kodi:')} <strong className="font-mono text-white text-sm tracking-widest">{admin2FA.twoFactorCode}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorInput(admin2FA.twoFactorCode)}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30"
                  >
                    {t('auth.fillIn', 'Kiritish')}
                  </button>
                </div>
              )}

              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
                    {t('auth.sixDigitLabel', '6 Xonali Xavfsizlik Kodi')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    required
                    value={twoFactorInput}
                    onChange={(e) => setTwoFactorInput(e.target.value)}
                    placeholder="● ● ● ● ● ●"
                    className="w-full text-center font-mono text-2xl tracking-[0.35em] font-extrabold py-3.5 bg-slate-700/70 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying2FA}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-glow disabled:opacity-60"
                >
                  {verifying2FA ? t('auth.verifying', 'Tekshirilmoqda...') : <>{t('auth.enterAdminPanel', 'Admin Panelga Kirish')} <FiArrowRight size={16} /></>}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setAdmin2FA(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <FiArrowLeft size={13} /> {t('auth.backToLogin', 'Orqaga qaytish')}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ─── Step 1: Email + Password Screen ─── */
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-glow">
                  <FiShield size={28} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold font-display text-white">{t('admin.dashboard', 'Admin Panel')}</h1>
                <p className="text-slate-400 text-sm mt-1">{t('admin.controlSystem', 'NIS AI School boshqaruv tizimi')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">{t('auth.email', 'Email')}</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="admin@nis-ai.edu.uz"
                      className="w-full pl-11 pr-4 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">{t('auth.password', 'Parol')}</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-11 py-3 bg-slate-700/60 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-0"
                    />
                    <span>{t('auth.rememberMe', 'Eslab qolish')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-glow disabled:opacity-60"
                >
                  {loading ? t('common.loading', 'Yuklanmoqda...') : <>{t('auth.adminLoginBtn', 'Admin Kirish (2MFA Bosqichiga)')}</>}
                </button>
              </form>

              <div className="mt-6 p-3 bg-slate-700/50 rounded-xl text-xs text-slate-400 text-center">
                <code>admin@nis-ai.edu.uz</code> / <code>NisAdmin2026!</code>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
