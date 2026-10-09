import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../api';
import toast from 'react-hot-toast';
import {
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUploadCloud,
  FiArrowRight,
  FiShield,
  FiCheck,
} from 'react-icons/fi';
import SectionVideoBackground from '../components/home/SectionVideoBackground';
import SectionAnimatedBackground from '../components/home/SectionAnimatedBackground';
import { useLanguage } from '../context/LanguageContext';

export default function ApplicationPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState(null);

  // Form State with all required fields (Existing + Additional)
  const [form, setForm] = useState({
    // 1. Shaxsiy ma'lumotlar
    applicantName: '',
    birthDate: '',
    gender: 'male',
    phone: '',
    email: '',
    region: 'Toshkent shahri',
    address: '',
    parentName: '',
    parentPhone: '',

    // 2. Ta'lim ma'lumotlari
    currentSchool: '',
    currentGrade: '8',
    previousEducation: '',

    // 3. NIS AI School Tanlovi
    campusName: 'NIS Toshkent',
    applicationType: 'student',
    desiredGrade: '9',
    direction: 'Deep Learning & AI',
    subjectsOfInterest: 'Matematika, Fizika, Dasturlash',
    englishLevel: 'Intermediate',
    ieltsScore: '',
    satScore: '',
    certificates: '',
    achievementsSummary: '',

    // 4. Loyihalar va Qiziqishlar
    projectsDescription: '',
    programmingExperience: '',
    startupExperience: '',
    competitions: '',
    futureGoals: '',

    // 5. Motivatsiya va Qo'shimcha
    motivation: '',
    notes: '',
  });

  const [documents, setDocuments] = useState([]);

  // Auto-fill from authenticated user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        applicantName: prev.applicantName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.applicantName.trim()) {
      return toast.error(t('application.validationName', "To'liq ism-familiyangizni kiriting!"));
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      return toast.error(t('application.validationEmail', "To'g'ri email manzilini kiriting!"));
    }
    if (!form.phone.trim()) {
      return toast.error(t('application.validationPhone', "Bog'lanish telefon raqamini kiriting!"));
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        formData.append(key, val);
      });

      documents.forEach((file) => {
        formData.append('documents', file);
      });

      const res = await applicationAPI.submit(formData);

      if (res.data?.success) {
        setSubmittedApp(res.data.data);
        toast.success(t('application.submitSuccess', "Arizangiz muvaffaqiyatli qabul qilindi!"));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || t('application.submitError', "Ariza yuborishda xatolik yuz berdi.");
      toast.error(msg);
      if (err.response?.data?.applicationNumber) {
        setSubmittedApp({
          applicationNumber: err.response.data.applicationNumber,
          applicantName: form.applicantName,
          campusName: form.campusName,
          status: 'PENDING',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── SUCCESS CONFIRMATION VIEW ──────────────────────────────────────────────
  if (submittedApp) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 text-center"
          style={{ boxShadow: '0 24px 64px -12px rgba(15,23,42,0.14), 0 8px 24px -4px rgba(0,0,0,0.06)' }}
        >
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
            <FiCheckCircle size={36} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-3 border border-emerald-200">
            <FiCheck size={13} /> {t('application.successTitle', 'Ariza muvaffaqiyatli qabul qilindi')}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 mb-2">
            {t('application.thankYou', 'Rahmat')}, {submittedApp.applicantName}!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {t('application.successMsg', "Sizning NIS AI School ga topshirgan arizangiz qabul qilindi va qabul komissiyasi tomonidan ko'rib chiqishga yo'naltirildi.")}
          </p>

          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-5 mb-6 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{t('application.appNumber', 'Ariza raqami')}:</span>
              <span className="text-base font-bold font-mono text-school-700 bg-school-50 px-2.5 py-0.5 rounded-lg border border-school-200">
                {submittedApp.applicationNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{t('application.branch', 'Filial')}:</span>
              <span className="font-semibold text-slate-800">{submittedApp.campusName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{t('common.status', 'Holati')}:</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                {t('application.status.REVIEWING', "Ko'rib chiqilmoqda (PENDING)")}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 mb-8 text-left space-y-1">
            <p className="font-semibold text-blue-900">{t('application.nextSteps', 'Keyingi bosqichlar')}:</p>
            <p>{t('application.step1', "1. Qabul komissiyasi arizangizni 2 ish kuni ichida tekshiradi.")}</p>
            <p>{t('application.step2', "2. Siz bilan telefon yoki email orqali saralash imtihoni sanasi bo'yicha bog'lanamiz.")}</p>
            <p>{t('application.step3', "3. Arizangiz holatini o'z shaxsiy profilingizda kuzatib borishingiz mumkin.")}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/profile"
                state={{ defaultTab: 'applications' }}
                className="btn-primary w-full sm:w-auto px-6 py-3 text-xs font-semibold justify-center"
              >
                {t('application.viewMyApps', 'Mening arizalarimni ko\'rish')}
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary w-full sm:w-auto px-6 py-3 text-xs font-semibold justify-center"
              >
                {t('application.registerToTrack', 'Kuzatish uchun hisob ochish')}
              </Link>
            )}
            <Link
              to="/"
              className="btn-outline w-full sm:w-auto px-6 py-3 text-xs font-semibold justify-center"
            >
              {t('application.backHome', 'Bosh sahifaga qaytish')}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── APPLICATION FORM VIEW ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-14 px-4 sm:px-6 relative overflow-hidden">
      {/* Background — Video with Soft, Reduced Overlay */}
      <SectionVideoBackground
        category="campus"
        opacity="opacity-30"
        scrimOpacity="bg-white/30"
        overlayGradient="from-slate-50/50 via-white/35 to-blue-50/45"
      />
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <SectionAnimatedBackground variant="waves" />
      </div>

      {/* Centered Large Container (700px - 850px) */}
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header Block */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-school-700 border border-school-200 mb-3">
            <FiShield size={13} /> {t('application.officialPortal', 'NIS AI School Rasmiy Qabul Portali')}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-slate-900 tracking-tight">
            {t('application.title', "2026-2027 O'quv Yili Uchun Ariza")}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed">
            {t('application.subtitle', "O'zbekistondagi №1 Sun'iy Intellekt maktabiga qabul arizasini to'ldiring. 100% davlat granti va zamonaviy xalqaro ta'lim imkoniyati.")}
          </p>

          {/* Profile Prefill Notice */}
          {isAuthenticated && user ? (
            <div className="mt-5 p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {user.firstName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {user.firstName} {user.lastName} ({user.email}) {t('application.accountActive', 'hisobi faol')}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t('application.prefillNotice', "Ism va aloqa ma'lumotlaringiz shaklga avtomatik kiritildi. Istasangiz, quyida ularni o'zgartirishingiz mumkin.")}
                  </p>
                </div>
              </div>
              <span className="badge-blue text-[11px] flex-shrink-0 whitespace-nowrap">
                {t('application.profileLinked', "Profil bog'langan")}
              </span>
            </div>
          ) : (
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {t('application.linkAccountPrompt', "Arizangizni shaxsiy hisobingiz bilan bog'lang")}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t('application.linkAccountDesc', "Arizangiz holatini profilingizda kuzatish uchun profilingiz orqali kiring. (Ariza avtomatik yuborilmaydi).")}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                <Link
                  to="/login"
                  state={{ from: '/application' }}
                  className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
                >
                  {t('auth.login', 'Tizimga kirish')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Main Application Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8"
        >
          {/* ─── 1. SHAXSIY MA'LUMOTLAR ─── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-school-600 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                {t('application.personalInfo', "Shaxsiy Ma'lumotlar")}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">F.I.Sh. (To'liq ism-familiya) *</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    required
                    name="applicantName"
                    value={form.applicantName}
                    onChange={handleChange}
                    placeholder="Masalan: Alimov Islomjon Baxtiyorovich"
                    className="input-field pl-10 h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="label">Tug'ilgan sana *</label>
                <input
                  type="date"
                  required
                  name="birthDate"
                  value={form.birthDate}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Jinsi</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                >
                  <option value="male">O'g'il bola</option>
                  <option value="female">Qiz bola</option>
                  <option value="other">Boshqa</option>
                </select>
              </div>

              <div>
                <label className="label">Telefon raqami *</label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+998 90 123 45 67"
                    className="input-field pl-10 h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="label">Email manzil *</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="email"
                    required
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alimov@gmail.com"
                    className="input-field pl-10 h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Viloyat / Shahar</label>
                <select
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                >
                  <option value="Toshkent shahri">Toshkent shahri</option>
                  <option value="Toshkent viloyati">Toshkent viloyati</option>
                  <option value="Namangan viloyati">Namangan viloyati</option>
                  <option value="Samarqand viloyati">Samarqand viloyati</option>
                  <option value="Farg'ona viloyati">Farg'ona viloyati</option>
                  <option value="Andijon viloyati">Andijon viloyati</option>
                  <option value="Buxoro viloyati">Buxoro viloyati</option>
                  <option value="Xorazm viloyati">Xorazm viloyati</option>
                  <option value="Qashqadaryo viloyati">Qashqadaryo viloyati</option>
                  <option value="Surxondaryo viloyati">Surxondaryo viloyati</option>
                  <option value="Navoiy viloyati">Navoiy viloyati</option>
                  <option value="Jizzax viloyati">Jizzax viloyati</option>
                  <option value="Sirdaryo viloyati">Sirdaryo viloyati</option>
                  <option value="Qoraqalpog'iston Respublikasi">Qoraqalpog'iston</option>
                </select>
              </div>

              <div>
                <label className="label">Aniq yashash manzili</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Tuman, ko'cha va uy raqami"
                    className="input-field pl-10 h-11 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Ota-onasi / Vasiy F.I.Sh.</label>
                <input
                  type="text"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  placeholder="Ota-onasining to'liq ismi"
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>
              <div>
                <label className="label">Ota-onasi / Vasiy telefoni</label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={form.parentPhone}
                  onChange={handleChange}
                  placeholder="+998 90 987 65 43"
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* ─── 2. HOZIRGI TA'LIM HOLATI ─── */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-school-600 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Hozirgi Ta'lim Holati
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Hozirgi maktab yoki litsey nomi *</label>
                <input
                  type="text"
                  required
                  name="currentSchool"
                  value={form.currentSchool}
                  onChange={handleChange}
                  placeholder="Masalan: 1-sonli ixtisoslashtirilgan maktab"
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="label">Joriy sinfi</label>
                <select
                  name="currentGrade"
                  value={form.currentGrade}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                >
                  <option value="6">6-sinf</option>
                  <option value="7">7-sinf</option>
                  <option value="8">8-sinf</option>
                  <option value="9">9-sinf</option>
                  <option value="10">10-sinf</option>
                  <option value="11">11-sinf</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Oldingi ta'lim tajribasi va chuqurlashtirilgan fanlar</label>
              <input
                type="text"
                name="previousEducation"
                value={form.previousEducation}
                onChange={handleChange}
                placeholder="Matematika va fizika sinfi, xususiy maktab, olimpiada to'garagi..."
                className="input-field h-11 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* ─── 3. NIS AI SCHOOL TANLOVI ─── */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-school-600 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                NIS AI School Qabul Tanlovi
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Tanlangan filial *</label>
                <select
                  name="campusName"
                  value={form.campusName}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm font-semibold text-school-700 bg-school-50/50"
                >
                  <option value="NIS Toshkent">NIS Toshkent (Bosh kampus)</option>
                  <option value="NIS Namangan">NIS Namangan filiali</option>
                  <option value="NIS Samarqand">NIS Samarqand filiali</option>
                </select>
              </div>

              <div>
                <label className="label">Ariza turi *</label>
                <select
                  name="applicationType"
                  value={form.applicationType}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                >
                  <option value="student">Standart O'quvchi Qabuli</option>
                  <option value="olympiad">Olimpiada Maxsus Guruhi</option>
                  <option value="grant">100% Prezident Granti Tanlovi</option>
                  <option value="transfer">Maktabdan ko'chirish (Transfer)</option>
                </select>
              </div>

              <div>
                <label className="label">Qaysi sinfga topshiryapsiz?</label>
                <select
                  name="desiredGrade"
                  value={form.desiredGrade}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm font-semibold"
                >
                  <option value="7">7-sinf</option>
                  <option value="8">8-sinf</option>
                  <option value="9">9-sinf</option>
                  <option value="10">10-sinf</option>
                  <option value="11">11-sinf</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Asosiy qiziqqan yo'nalishingiz</label>
                <select
                  name="direction"
                  value={form.direction}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                >
                  <option value="Deep Learning & AI">Deep Learning & LLM (Sun'iy Intellekt)</option>
                  <option value="Computer Vision">Computer Vision (Kompyuter Ko'rishi)</option>
                  <option value="IOI / ICPC Tayyorlov">IOI / ICPC Algoritmik Dasturlash</option>
                  <option value="Data Science & ML">Data Science & Machine Learning</option>
                  <option value="Robototexnika & ROS2">Robototexnika & Autonomous Drones</option>
                  <option value="IELTS / SAT Tayyorlov">IELTS / SAT & Xalqaro Universitetlar</option>
                </select>
              </div>

              <div>
                <label className="label">Ingliz tili darajasi</label>
                <select
                  name="englishLevel"
                  value={form.englishLevel}
                  onChange={handleChange}
                  className="input-field h-11 text-xs sm:text-sm"
                >
                  <option value="Beginner">Beginner (Boshlang'ich)</option>
                  <option value="Elementary">Elementary (A1-A2)</option>
                  <option value="Intermediate">Intermediate (B1)</option>
                  <option value="Upper-Intermediate">Upper-Intermediate (B2)</option>
                  <option value="Advanced">Advanced (C1)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">IELTS bali (agar mavjud bo'lsa)</label>
                <input
                  type="text"
                  name="ieltsScore"
                  value={form.ieltsScore}
                  onChange={handleChange}
                  placeholder="Masalan: 7.0 yoki 7.5"
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="label">SAT bali (agar mavjud bo'lsa)</label>
                <input
                  type="text"
                  name="satScore"
                  value={form.satScore}
                  onChange={handleChange}
                  placeholder="Masalan: 1420"
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label">Sertifikatlar va olimpiada yutuqlari</label>
              <textarea
                name="achievementsSummary"
                value={form.achievementsSummary}
                onChange={handleChange}
                rows={2}
                placeholder="Viloyat/Respublika informatika olimpiadasi, Kangaroo, SASMO, xalqaro sertifikatlar..."
                className="input-field text-xs sm:text-sm py-2.5"
              />
            </div>
          </div>

          {/* ─── 4. LOYIHALAR VA QIZIQISHLAR ─── */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-school-600 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Loyihalar va Tajriba
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Dasturlash tajribasi (tillar va yillar)</label>
                <input
                  type="text"
                  name="programmingExperience"
                  value={form.programmingExperience}
                  onChange={handleChange}
                  placeholder="Python (2 yil), C++ (1 yil), Scratch..."
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="label">Loyihalar yoki GitHub havolasi</label>
                <input
                  type="text"
                  name="projectsDescription"
                  value={form.projectsDescription}
                  onChange={handleChange}
                  placeholder="github.com/username yoki loyiha nomi"
                  className="input-field h-11 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label">Kelajakdagi maqsadlaringiz</label>
              <input
                type="text"
                name="futureGoals"
                value={form.futureGoals}
                onChange={handleChange}
                placeholder="MIT ga kirish, AI startap yaratish, IOI oltin medalini olish..."
                className="input-field h-11 text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* ─── 5. MOTIVATSIYA VA QO'SHIMCHA IZOH ─── */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-school-600 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h2 className="text-lg font-bold font-display text-slate-900">
                Motivatsiya va Qo'shimcha Izoh
              </h2>
            </div>

            <div>
              <label className="label">
                Nega aynan NIS AI School? (Motivatsion xat) *
              </label>
              <textarea
                required
                name="motivation"
                value={form.motivation}
                onChange={handleChange}
                rows={4}
                placeholder="O'zingiz haqingizda, nima sababdan ushbu maktabda o'qishni xohlashingiz va qanday natijalarga erishmoqchi ekanligingiz haqida yozing..."
                className="input-field text-xs sm:text-sm py-3 leading-relaxed"
              />
            </div>

            <div>
              <label className="label">Hujjatlar va sertifikatlar ilovasi (PDF yoki Rasm)</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-school-400 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                <FiUploadCloud size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  Fayllarni yuklash uchun bosing yoki shu yerga tashlang
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Sertifikat, baholar tabeli yoki portfolio (Maksimal 5 ta fayl, 10MB gacha)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="mt-3 inline-block px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs"
                >
                  Fayl tanlash
                </label>
                {documents.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {documents.map((f, i) => (
                      <span key={i} className="text-[11px] bg-school-50 text-school-700 px-2 py-0.5 rounded-md border border-school-200">
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submission Consent & Submit Button */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-start gap-2.5 text-xs text-slate-500">
              <input
                type="checkbox"
                required
                id="consent"
                className="mt-0.5 rounded text-school-600 focus:ring-school-500 border-slate-300"
              />
              <label htmlFor="consent" className="cursor-pointer leading-tight">
                {t('application.consentText', "Kiritilgan barcha ma'lumotlar to'g'ri va haqqoniy ekanligini tasdiqlayman hamda NIS AI School qabul nizomi shartlariga rozilik bildiraman.")}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="spinner !w-4 !h-4 !border-2 border-white/30 border-t-white" />
                  <span>{t('application.submitting', 'Yuborilmoqda...')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{t('application.submit', 'Ariza topshirish')}</span>
                  <FiArrowRight size={16} />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
