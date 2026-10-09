import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import {
  FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShield, FiUser, FiPhone, FiKey, FiArrowLeft,
} from 'react-icons/fi';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';

export default function LoginPage({ defaultTab }) {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  // Determine active tab: 'login' or 'register'
  const initialTab = defaultTab || (location.pathname === '/register' ? 'register' : 'login');
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab if user navigates via browser forward/back
  useEffect(() => {
    if (location.pathname === '/register') {
      setActiveTab('register');
    } else if (location.pathname === '/login') {
      setActiveTab('login');
    }
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'register' ? '/register' : '/login', { replace: true, state: location.state });
  };

  // Auth context
  const { login, register } = useAuth();

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state (All existing inputs preserved)
  const [regForm, setRegForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showRegPw, setShowRegPw] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Admin 2MFA state
  const [admin2FA, setAdmin2FA] = useState(null); // { email, twoFactorCode }
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await login(loginForm.email, loginForm.password, null, rememberMe);
      if (res?.requires2FA) {
        setAdmin2FA({
          email: res.email || loginForm.email,
          twoFactorCode: res.twoFactorCode || '',
        });
        setTwoFactorInput(res.twoFactorCode || '');
        toast.success(t('auth.adminDetected', "Admin hisobi aniqlandi! 2MFA tasdiqlash bosqichi talab qilinadi."));
        return;
      }
      toast.success(t('auth.welcomeBack', 'Xush kelibsiz!'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidCredentials', 'Email yoki parol noto\'g\'ri'));
    } finally {
      setLoginLoading(false);
    }
  };

  // 2MFA submission
  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorInput.trim()) {
      return toast.error(t('auth.enter2faCode', "2MFA tasdiqlash kodini kiriting!"));
    }
    setTwoFactorLoading(true);
    try {
      await login(loginForm.email, loginForm.password, twoFactorInput.trim(), rememberMe);
      toast.success(t('auth.admin2faSuccess', "2MFA muvaffaqiyatli tasdiqlandi! Admin panelga xush kelibsiz!"));
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidCode', "Noto'g'ri 2MFA kodi"));
    } finally {
      setTwoFactorLoading(false);
    }
  };

  // Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      return toast.error(t('auth.passwordMismatch', "Parollar mos kelmadi!"));
    }
    if (regForm.password.length < 6) {
      return toast.error(t('auth.passwordMinLength', "Parol kamida 6 belgi bo'lishi kerak"));
    }
    setRegLoading(true);
    try {
      await register({
        firstName: regForm.firstName,
        lastName: regForm.lastName,
        email: regForm.email,
        phone: regForm.phone,
        password: regForm.password,
      });
      toast.success(t('auth.registerSuccess', 'Hisob muvaffaqiyatli yaratildi!'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.registerError', "Ro'yxatdan o'tishda xatolik"));
    } finally {
      setRegLoading(false);
    }
  };

  const regField = (name, label, type = 'text', icon, placeholder) => (
    <div>
      <label className="label text-xs">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
        <input
          type={type}
          required={name !== 'phone'}
          value={regForm[name]}
          onChange={(e) => setRegForm({ ...regForm, [name]: e.target.value })}
          placeholder={placeholder}
          className="input-field pl-10 text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-16 sm:py-20 relative overflow-hidden">
      {/* Dynamic AI Video Background */}
      <SectionVideoBackground
        category="ai"
        opacity="opacity-30"
        theme="hero"
      />
      <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
        <SectionAnimatedBackground variant="network" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="card-elevated p-6 sm:p-9">
          {admin2FA ? (
            /* ─── Admin 2MFA Verification Step ─── */
            <motion.div
              key="admin-2fa"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center mx-auto mb-3 shadow-btn text-white">
                  <FiShield size={26} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-school-50 text-school-700 border border-school-200/80 mb-2">
                  <FiKey size={12} /> {t('auth.admin2mfaStep', '2MFA Xavfsizlik Bosqichi')}
                </div>
                <h1 className="text-2xl font-bold font-display text-slate-900">
                  {t('auth.admin2mfaTitle', 'Admin 2MFA Tasdiqlash')}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  {t('auth.admin2mfaSubtitle', 'Admin panelga kirish uchun 2-bosqichli xavfsizlik kodini kiriting')}
                </p>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono font-medium">
                  {admin2FA.email}
                </div>
              </div>

              {/* Live 2MFA Code Helper */}
              {admin2FA.twoFactorCode && (
                <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl flex items-center justify-between mb-5 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-school-600 text-white flex items-center justify-center font-bold">
                      <FiKey size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] text-blue-700 font-medium">{t('auth.twoFaCodeLabel', 'Xavfsizlik 2MFA kodi:')}</p>
                      <p className="text-sm font-extrabold font-mono tracking-widest text-slate-900">
                        {admin2FA.twoFactorCode}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorInput(admin2FA.twoFactorCode)}
                    className="text-xs font-bold text-school-600 hover:text-school-800 bg-white px-3 py-1 rounded-lg border border-school-200 shadow-xs active:scale-95 transition-all"
                  >
                    {t('auth.fillIn', 'Kiritish')}
                  </button>
                </div>
              )}

              {/* 2MFA Form */}
              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div>
                  <label className="label text-center text-xs">{t('auth.sixDigitLabel', '6 Xonali 2MFA Kod')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={twoFactorInput}
                      onChange={(e) => setTwoFactorInput(e.target.value)}
                      placeholder="● ● ● ● ● ●"
                      className="input-field text-center font-mono text-xl tracking-[0.35em] font-extrabold py-3.5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={twoFactorLoading}
                  className="btn-primary w-full justify-center py-3.5 font-bold shadow-glow disabled:opacity-60"
                >
                  {twoFactorLoading ? (
                    <div className="spinner !w-4 !h-4 !border-2 border-white/30 border-t-white" />
                  ) : (
                    <>{t('auth.enterAdminPanel', 'Admin Panelga Kirish')} <FiArrowRight size={15} /></>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setAdmin2FA(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <FiArrowLeft size={13} /> {t('auth.backToLogin', 'Orqaga (Oddiy login)')}
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Logo & Brand */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-school-600 to-school-800 flex items-center justify-center mx-auto mb-3 shadow-btn">
                  <span className="text-white font-black font-display text-base tracking-wider">NIS</span>
                </div>
                <h1 className="text-2xl font-bold font-display text-slate-900">
                  {activeTab === 'login' ? t('auth.login', 'Tizimga kirish') : t('auth.register', 'Hisob yaratish')}
                </h1>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  {activeTab === 'login' ? t('auth.loginSubtitle', 'NIS AI School hisobingizga kiring') : t('auth.registerSubtitle', 'NIS AI School platformasiga qo‘shiling')}
                </p>
              </div>

              {/* Top Authentication Tabs */}
              <div className="relative flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`relative flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 z-10 text-center ${
                    activeTab === 'login'
                      ? 'text-school-700 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {activeTab === 'login' && (
                    <motion.div
                      layoutId="activeAuthTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 -z-10"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  {t('auth.login', 'Kirish')}
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`relative flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 z-10 text-center ${
                    activeTab === 'register'
                      ? 'text-school-700 font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {activeTab === 'register' && (
                    <motion.div
                      layoutId="activeAuthTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 -z-10"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                    />
                  )}
                  {t('auth.register', 'Ro‘yxatdan o‘tish')}
                </button>
              </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="login-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="label">{t('auth.email', 'Email')}</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="email@example.com"
                        className="input-field pl-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">{t('auth.password', 'Parol')}</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type={showLoginPw ? 'text' : 'password'}
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="input-field pl-11 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPw(!showLoginPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showLoginPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 transition-colors">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-school-600 focus:ring-school-500 border-slate-300 transition cursor-pointer"
                      />
                      <span className="font-medium">{t('auth.rememberMe', 'Eslab qolish')}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="btn-primary w-full justify-center py-3 mt-2 font-bold disabled:opacity-60"
                  >
                    {loginLoading ? (
                      <div className="spinner !w-4 !h-4 !border-2 border-white/30 border-t-white" />
                    ) : (
                      <>{t('auth.loginBtn', 'Kirish')} <FiArrowRight size={15} /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs sm:text-sm text-slate-500 mt-6">
                  {t('auth.noAccount', "Hisobingiz yo'qmi?")}{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className="text-school-600 font-semibold hover:underline"
                  >
                    {t('auth.register', "Ro'yxatdan o'ting")}
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Registration Form (Strictly NO Google button) */}
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    {regField('firstName', `${t('auth.firstName', 'Ism')} *`, 'text', <FiUser size={14} />, t('auth.firstName', 'Ism'))}
                    {regField('lastName', `${t('auth.lastName', 'Familiya')} *`, 'text', <FiUser size={14} />, t('auth.lastName', 'Familiya'))}
                  </div>
                  {regField('email', `${t('auth.email', 'Email manzil')} *`, 'email', <FiMail size={14} />, 'email@example.com')}
                  {regField('phone', t('auth.phoneOptional', 'Telefon (ixtiyoriy)'), 'tel', <FiPhone size={14} />, '+998 90 123 45 67')}
                  
                  <div>
                    <label className="label text-xs">{t('auth.passwordMinLabel', 'Parol (kamida 6 belgi) *')}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <FiLock size={14} />
                      </span>
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        required
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPw(!showRegPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showRegPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label text-xs">{t('auth.confirmPasswordLabel', 'Parolni tasdiqlang *')}</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <FiLock size={14} />
                      </span>
                      <input
                        type={showRegPw ? 'text' : 'password'}
                        required
                        value={regForm.confirmPassword}
                        onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading}
                    className="btn-primary w-full justify-center py-3 mt-2 font-bold disabled:opacity-60"
                  >
                    {regLoading ? (
                      <div className="spinner !w-4 !h-4 !border-2 border-white/30 border-t-white" />
                    ) : (
                      <>{t('auth.registerBtn', "Ro'yxatdan o'tish")} <FiArrowRight size={15} /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-slate-500 mt-5">
                  {t('auth.hasAccount', 'Hisobingiz bormi?')}{' '}
                  <button
                    type="button"
                    onClick={() => handleTabChange('login')}
                    className="text-school-600 font-semibold hover:underline"
                  >
                    {t('auth.login', 'Kirish')}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Application Portal Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
              <FiShield size={11} />
              <span>{t('auth.noticeTitle', 'Login ≠ Ariza topshirish')}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">{t('auth.noticeText', "O'quvchi sifatida ariza topshirmoqchimisiz?")}</p>
              <Link
                to="/application"
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-school-600 hover:underline"
              >
                {t('auth.applyPortal', 'Ariza topshirish portali')} <FiArrowRight size={12} />
              </Link>
            </div>
          </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
