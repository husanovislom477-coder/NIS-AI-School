/**
 * NIS AI School — Full PostgreSQL Migration Seed
 * db.json dagi barcha ma'lumotlarni PostgreSQL ga ko'chiradi
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const DB_FILE = path.join(__dirname, '../src/data/db.json');

// Helper — null-safe string
const str = (v) => (v !== undefined && v !== null ? String(v) : '');
// Helper — null-safe date
const dt = (v) => (v ? new Date(v) : new Date());
// Helper — generate short id if missing
const safeId = (id, prefix) =>
  id && id.length > 2 ? String(id) : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

async function main() {
  console.log('\n🌱 NIS AI School — PostgreSQL Full Migration başladı...\n');

  // ─── JSON dan o'qish ─────────────────────────────────────────
  if (!fs.existsSync(DB_FILE)) {
    console.log('⚠️  db.json topilmadi, faqat default data yuklanadi');
  }

  let raw = {
    users: [], languages: [], branches: [], branchTranslations: [],
    teachers: [], teacherTranslations: [], studentResults: [],
    studentResultTranslations: [], projects: [], projectTranslations: [],
    news: [], newsTranslations: [], programs: [], programTranslations: [],
    applications: [], events: [],
  };

  if (fs.existsSync(DB_FILE)) {
    try {
      raw = { ...raw, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) };
      console.log('✅ db.json o\'qildi');
    } catch (e) {
      console.warn('⚠️  db.json o\'qishda xatolik:', e.message);
    }
  }

  // ─── 1. LANGUAGES ────────────────────────────────────────────
  console.log('\n📌 Tillar yuklanmoqda...');
  const DEFAULT_LANGUAGES = [
    { id: 'lang_en', code: 'en', name: 'English', nativeName: 'English (US / UK)', flag: '🇬🇧', direction: 'ltr', isEnabled: true, isDefault: true, order: 1 },
    { id: 'lang_uz', code: 'uz', name: 'Uzbek', nativeName: "O'zbekcha", flag: '🇺🇿', direction: 'ltr', isEnabled: true, isDefault: false, order: 2 },
    { id: 'lang_ru', code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', isEnabled: true, isDefault: false, order: 3 },
    { id: 'lang_tr', code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', direction: 'ltr', isEnabled: true, isDefault: false, order: 4 },
    { id: 'lang_de', code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', isEnabled: true, isDefault: false, order: 5 },
    { id: 'lang_fr', code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', isEnabled: true, isDefault: false, order: 6 },
    { id: 'lang_es', code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', isEnabled: true, isDefault: false, order: 7 },
    { id: 'lang_ko', code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', isEnabled: true, isDefault: false, order: 8 },
    { id: 'lang_zh', code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr', isEnabled: true, isDefault: false, order: 9 },
    { id: 'lang_ja', code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', isEnabled: true, isDefault: false, order: 10 },
  ];

  // Merge db.json languages with defaults
  const allLangCodes = new Set(DEFAULT_LANGUAGES.map(l => l.code));
  const extraLangs = (raw.languages || []).filter(l => !allLangCodes.has(l.code));
  const langsToSeed = [...DEFAULT_LANGUAGES, ...extraLangs];

  for (const lang of langsToSeed) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name, nativeName: lang.nativeName, flag: lang.flag || '🌐', isEnabled: lang.isEnabled !== false, isDefault: lang.isDefault === true, order: lang.order || 0 },
      create: {
        id: safeId(lang.id, 'lang'),
        code: lang.code,
        name: lang.name,
        nativeName: lang.nativeName || lang.name,
        flag: lang.flag || '🌐',
        direction: lang.direction || 'ltr',
        isEnabled: lang.isEnabled !== false,
        isDefault: lang.isDefault === true,
        order: lang.order || 0,
      },
    });
  }
  console.log(`  ✅ ${langsToSeed.length} ta til yuklandi`);

  // ─── 2. USERS ────────────────────────────────────────────────
  console.log('\n👤 Foydalanuvchilar yuklanmoqda...');
  let userCount = 0;
  for (const u of raw.users || []) {
    if (!u.email) continue;
    const email = u.email.toLowerCase().trim();
    const role = (u.role || 'USER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';
    const lang = u.languageCode || u.language || 'en';
    try {
      await prisma.user.upsert({
        where: { email },
        update: {
          firstName: str(u.firstName) || 'User',
          lastName: str(u.lastName) || '',
          middleName: str(u.middleName),
          phone: str(u.phone),
          passwordHash: str(u.passwordHash || u.password),
          profileImage: str(u.profileImage || u.avatar),
          role,
          isActive: u.isActive !== false,
          googleId: u.googleId || null,
          language: lang,
          languageCode: lang,
          theme: str(u.theme) || 'light',
          primaryColor: str(u.primaryColor) || '#0066cc',
          secondaryColor: str(u.secondaryColor) || '#00a3ff',
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : null,
        },
        create: {
          id: safeId(u.id || u._id, 'usr'),
          firstName: str(u.firstName) || 'User',
          lastName: str(u.lastName) || '',
          middleName: str(u.middleName),
          email,
          phone: str(u.phone),
          passwordHash: str(u.passwordHash || u.password),
          profileImage: str(u.profileImage || u.avatar),
          role,
          isActive: u.isActive !== false,
          googleId: u.googleId || null,
          language: lang,
          languageCode: lang,
          theme: str(u.theme) || 'light',
          primaryColor: str(u.primaryColor) || '#0066cc',
          secondaryColor: str(u.secondaryColor) || '#00a3ff',
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt) : null,
          createdAt: dt(u.createdAt),
          updatedAt: dt(u.updatedAt),
        },
      });
      userCount++;
    } catch (e) {
      console.warn(`  ⚠️  User skip (${email}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${userCount} ta foydalanuvchi yuklandi`);

  // ─── 3. BRANCHES ─────────────────────────────────────────────
  console.log('\n🏢 Filiallar yuklanmoqda...');
  const branchIdMap = {}; // old_id -> new_id
  let branchCount = 0;

  for (const b of raw.branches || []) {
    if (!b.name) continue;
    const id = safeId(b.id || b._id, 'br');
    branchIdMap[b.id] = id;
    branchIdMap[b._id] = id;
    try {
      await prisma.branch.upsert({
        where: { id },
        update: {
          name: str(b.name),
          description: str(b.description),
          address: str(b.address),
          phone: str(b.phone) || '+998 71 000 00 00',
          latitude: parseFloat(b.latitude) || 0,
          longitude: parseFloat(b.longitude) || 0,
          image: str(b.image),
          images: str(b.images) || '[]',
          video: str(b.video),
          workingHours: str(b.workingHours) || '08:30 - 18:00',
        },
        create: {
          id,
          name: str(b.name),
          description: str(b.description) || str(b.name),
          address: str(b.address) || 'Uzbekistan',
          phone: str(b.phone) || '+998 71 000 00 00',
          latitude: parseFloat(b.latitude) || 0,
          longitude: parseFloat(b.longitude) || 0,
          image: str(b.image),
          images: str(b.images) || '[]',
          video: str(b.video),
          workingHours: str(b.workingHours) || '08:30 - 18:00',
          createdAt: dt(b.createdAt),
          updatedAt: dt(b.updatedAt),
        },
      });
      branchCount++;
    } catch (e) {
      console.warn(`  ⚠️  Branch skip (${b.name}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${branchCount} ta filial yuklandi`);

  // ─── 4. BRANCH TRANSLATIONS ──────────────────────────────────
  console.log('\n🌍 Filial tarjimalari yuklanmoqda...');
  let btCount = 0;
  for (const t of raw.branchTranslations || []) {
    const branchId = branchIdMap[t.branchId] || t.branchId;
    if (!branchId || !t.languageCode) continue;
    // Check branch exists
    const branchExists = await prisma.branch.findUnique({ where: { id: branchId } });
    if (!branchExists) continue;
    try {
      await prisma.branchTranslation.upsert({
        where: { branchId_languageCode: { branchId, languageCode: t.languageCode } },
        update: { name: str(t.name), description: str(t.description), address: str(t.address), workingHours: str(t.workingHours) || '08:30 - 18:00' },
        create: {
          id: safeId(t.id, 'bt'),
          branchId,
          languageCode: t.languageCode,
          name: str(t.name),
          description: str(t.description),
          address: str(t.address),
          workingHours: str(t.workingHours) || '08:30 - 18:00',
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      btCount++;
    } catch (e) {
      console.warn(`  ⚠️  BranchTranslation skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${btCount} ta filial tarjimasi yuklandi`);

  // ─── 5. TEACHERS ─────────────────────────────────────────────
  console.log('\n👨‍🏫 O\'qituvchilar yuklanmoqda...');
  const teacherIdMap = {};
  let teacherCount = 0;

  for (const t of raw.teachers || []) {
    if (!t.firstName) continue;
    const id = safeId(t.id || t._id, 'tc');
    teacherIdMap[t.id] = id;
    teacherIdMap[t._id] = id;
    const branchId = t.branchId ? (branchIdMap[t.branchId] || t.branchId) : null;
    // Verify branch exists
    let finalBranchId = null;
    if (branchId) {
      const exists = await prisma.branch.findUnique({ where: { id: branchId } });
      finalBranchId = exists ? branchId : null;
    }
    try {
      await prisma.teacher.upsert({
        where: { id },
        update: {
          firstName: str(t.firstName),
          lastName: str(t.lastName),
          middleName: str(t.middleName),
          photo: str(t.photo),
          bio: str(t.bio),
          subject: str(t.subject) || 'Computer Science',
          university: str(t.university),
          degree: str(t.degree),
          IELTSScore: str(t.IELTSScore || t.ieltsScore),
          SATScore: str(t.SATScore || t.satScore),
          HSKScore: str(t.HSKScore || t.hskScore),
          certificates: str(t.certificates),
          achievements: str(t.achievements),
          branchId: finalBranchId,
        },
        create: {
          id,
          firstName: str(t.firstName),
          lastName: str(t.lastName),
          middleName: str(t.middleName),
          photo: str(t.photo),
          bio: str(t.bio),
          subject: str(t.subject) || 'Computer Science',
          university: str(t.university),
          degree: str(t.degree),
          IELTSScore: str(t.IELTSScore || t.ieltsScore),
          SATScore: str(t.SATScore || t.satScore),
          HSKScore: str(t.HSKScore || t.hskScore),
          certificates: str(t.certificates),
          achievements: str(t.achievements),
          branchId: finalBranchId,
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      teacherCount++;
    } catch (e) {
      console.warn(`  ⚠️  Teacher skip (${t.firstName}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${teacherCount} ta o'qituvchi yuklandi`);

  // ─── 6. TEACHER TRANSLATIONS ─────────────────────────────────
  console.log('\n🌍 O\'qituvchi tarjimalari yuklanmoqda...');
  let ttCount = 0;
  for (const t of raw.teacherTranslations || []) {
    const teacherId = teacherIdMap[t.teacherId] || t.teacherId;
    if (!teacherId || !t.languageCode) continue;
    const exists = await prisma.teacher.findUnique({ where: { id: teacherId } });
    if (!exists) continue;
    try {
      await prisma.teacherTranslation.upsert({
        where: { teacherId_languageCode: { teacherId, languageCode: t.languageCode } },
        update: { bio: str(t.bio), subject: str(t.subject), university: str(t.university), degree: str(t.degree), certificates: str(t.certificates), achievements: str(t.achievements) },
        create: {
          id: safeId(t.id, 'tt'),
          teacherId,
          languageCode: t.languageCode,
          bio: str(t.bio),
          subject: str(t.subject),
          university: str(t.university),
          degree: str(t.degree),
          certificates: str(t.certificates),
          achievements: str(t.achievements),
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      ttCount++;
    } catch (e) {
      console.warn(`  ⚠️  TeacherTranslation skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${ttCount} ta o'qituvchi tarjimasi yuklandi`);

  // ─── 7. STUDENT RESULTS ──────────────────────────────────────
  console.log('\n🏆 O\'quvchi natijalari yuklanmoqda...');
  const resultIdMap = {};
  let resultCount = 0;

  for (const r of raw.studentResults || []) {
    if (!r.studentName) continue;
    const id = safeId(r.id || r._id, 'sr');
    resultIdMap[r.id] = id;
    resultIdMap[r._id] = id;
    const branchId = r.branchId ? (branchIdMap[r.branchId] || r.branchId) : null;
    let finalBranchId = null;
    if (branchId) {
      const exists = await prisma.branch.findUnique({ where: { id: branchId } });
      finalBranchId = exists ? branchId : null;
    }
    try {
      await prisma.studentResult.upsert({
        where: { id },
        update: {
          studentName: str(r.studentName),
          studentPhoto: str(r.studentPhoto),
          examType: str(r.examType) || 'IELTS',
          score: str(r.score) || '0',
          branchId: finalBranchId,
          year: parseInt(r.year) || new Date().getFullYear(),
          description: str(r.description),
        },
        create: {
          id,
          studentName: str(r.studentName),
          studentPhoto: str(r.studentPhoto),
          examType: str(r.examType) || 'IELTS',
          score: str(r.score) || '0',
          branchId: finalBranchId,
          year: parseInt(r.year) || new Date().getFullYear(),
          description: str(r.description),
          createdAt: dt(r.createdAt),
          updatedAt: dt(r.updatedAt),
        },
      });
      resultCount++;
    } catch (e) {
      console.warn(`  ⚠️  StudentResult skip (${r.studentName}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${resultCount} ta natija yuklandi`);

  // ─── 8. STUDENT RESULT TRANSLATIONS ─────────────────────────
  console.log('\n🌍 Natija tarjimalari yuklanmoqda...');
  let srtCount = 0;
  for (const t of raw.studentResultTranslations || []) {
    const resultId = resultIdMap[t.resultId] || t.resultId;
    if (!resultId || !t.languageCode) continue;
    const exists = await prisma.studentResult.findUnique({ where: { id: resultId } });
    if (!exists) continue;
    try {
      await prisma.studentResultTranslation.upsert({
        where: { resultId_languageCode: { resultId, languageCode: t.languageCode } },
        update: { description: str(t.description) },
        create: {
          id: safeId(t.id, 'srt'),
          resultId,
          languageCode: t.languageCode,
          description: str(t.description),
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      srtCount++;
    } catch (e) {
      console.warn(`  ⚠️  ResultTranslation skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${srtCount} ta natija tarjimasi yuklandi`);

  // ─── 9. PROJECTS ─────────────────────────────────────────────
  console.log('\n🚀 Loyihalar yuklanmoqda...');
  const projectIdMap = {};
  let projectCount = 0;

  for (const p of raw.projects || []) {
    if (!p.title) continue;
    const id = safeId(p.id || p._id, 'prj');
    projectIdMap[p.id] = id;
    projectIdMap[p._id] = id;
    const branchId = p.branchId ? (branchIdMap[p.branchId] || p.branchId) : null;
    let finalBranchId = null;
    if (branchId) {
      const exists = await prisma.branch.findUnique({ where: { id: branchId } });
      finalBranchId = exists ? branchId : null;
    }
    try {
      await prisma.project.upsert({
        where: { id },
        update: {
          title: str(p.title),
          description: str(p.description),
          studentName: str(p.studentName),
          studentPhoto: str(p.studentPhoto),
          projectImage: str(p.projectImage),
          projectUrl: str(p.projectUrl),
          branchId: finalBranchId,
          category: str(p.category) || 'AI & Machine Learning',
        },
        create: {
          id,
          title: str(p.title),
          description: str(p.description) || str(p.title),
          studentName: str(p.studentName) || 'NIS Student',
          studentPhoto: str(p.studentPhoto),
          projectImage: str(p.projectImage),
          projectUrl: str(p.projectUrl),
          branchId: finalBranchId,
          category: str(p.category) || 'AI & Machine Learning',
          createdAt: dt(p.createdAt),
          updatedAt: dt(p.updatedAt),
        },
      });
      projectCount++;
    } catch (e) {
      console.warn(`  ⚠️  Project skip (${p.title}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${projectCount} ta loyiha yuklandi`);

  // ─── 10. PROJECT TRANSLATIONS ────────────────────────────────
  console.log('\n🌍 Loyiha tarjimalari yuklanmoqda...');
  let ptCount = 0;
  for (const t of raw.projectTranslations || []) {
    const projectId = projectIdMap[t.projectId] || t.projectId;
    if (!projectId || !t.languageCode) continue;
    const exists = await prisma.project.findUnique({ where: { id: projectId } });
    if (!exists) continue;
    try {
      await prisma.projectTranslation.upsert({
        where: { projectId_languageCode: { projectId, languageCode: t.languageCode } },
        update: { title: str(t.title), description: str(t.description), category: str(t.category) },
        create: {
          id: safeId(t.id, 'pt'),
          projectId,
          languageCode: t.languageCode,
          title: str(t.title),
          description: str(t.description),
          category: str(t.category),
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      ptCount++;
    } catch (e) {
      console.warn(`  ⚠️  ProjectTranslation skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${ptCount} ta loyiha tarjimasi yuklandi`);

  // ─── 11. NEWS ────────────────────────────────────────────────
  console.log('\n📰 Yangiliklar yuklanmoqda...');
  const newsIdMap = {};
  let newsCount = 0;

  for (const n of raw.news || []) {
    if (!n.title) continue;
    const id = safeId(n.id || n._id, 'nws');
    newsIdMap[n.id] = id;
    newsIdMap[n._id] = id;
    // Generate unique slug
    const baseSlug = str(n.slug) || str(n.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
    const slug = baseSlug || `news-${id}`;
    try {
      await prisma.news.upsert({
        where: { slug },
        update: {
          title: str(n.title),
          shortDescription: str(n.shortDescription),
          content: str(n.content) || str(n.title),
          coverImage: str(n.coverImage),
          author: str(n.author) || 'NIS AI School',
          published: n.published !== false,
          publishedAt: n.publishedAt ? new Date(n.publishedAt) : new Date(),
        },
        create: {
          id,
          title: str(n.title),
          slug,
          shortDescription: str(n.shortDescription),
          content: str(n.content) || str(n.title),
          coverImage: str(n.coverImage),
          author: str(n.author) || 'NIS AI School',
          published: n.published !== false,
          publishedAt: n.publishedAt ? new Date(n.publishedAt) : new Date(),
          createdAt: dt(n.createdAt),
          updatedAt: dt(n.updatedAt),
        },
      });
      newsCount++;
    } catch (e) {
      console.warn(`  ⚠️  News skip (${n.title?.substring(0, 30)}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${newsCount} ta yangilik yuklandi`);

  // ─── 12. NEWS TRANSLATIONS ───────────────────────────────────
  console.log('\n🌍 Yangilik tarjimalari yuklanmoqda...');
  let ntCount = 0;
  for (const t of raw.newsTranslations || []) {
    const newsId = newsIdMap[t.newsId] || t.newsId;
    if (!newsId || !t.languageCode) continue;
    const exists = await prisma.news.findUnique({ where: { id: newsId } });
    if (!exists) continue;
    try {
      await prisma.newsTranslation.upsert({
        where: { newsId_languageCode: { newsId, languageCode: t.languageCode } },
        update: { title: str(t.title), shortDescription: str(t.shortDescription), content: str(t.content) },
        create: {
          id: safeId(t.id, 'nt'),
          newsId,
          languageCode: t.languageCode,
          title: str(t.title),
          shortDescription: str(t.shortDescription),
          content: str(t.content) || str(t.title),
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      ntCount++;
    } catch (e) {
      console.warn(`  ⚠️  NewsTranslation skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${ntCount} ta yangilik tarjimasi yuklandi`);

  // ─── 13. PROGRAMS ────────────────────────────────────────────
  console.log('\n📚 Dasturlar yuklanmoqda...');
  const programIdMap = {};
  let programCount = 0;

  for (const p of raw.programs || []) {
    if (!p.code) continue;
    const id = safeId(p.id || p._id, 'prog');
    programIdMap[p.id] = id;
    programIdMap[p._id] = id;
    try {
      await prisma.program.upsert({
        where: { code: p.code },
        update: {
          image: str(p.image),
          duration: str(p.duration) || '1 year',
          badge: str(p.badge),
          tags: str(p.tags) || '[]',
          order: parseInt(p.order) || 0,
        },
        create: {
          id,
          code: str(p.code),
          image: str(p.image),
          duration: str(p.duration) || '1 year',
          badge: str(p.badge),
          tags: str(p.tags) || '[]',
          order: parseInt(p.order) || 0,
          createdAt: dt(p.createdAt),
          updatedAt: dt(p.updatedAt),
        },
      });
      programCount++;
    } catch (e) {
      console.warn(`  ⚠️  Program skip (${p.code}): ${e.message}`);
    }
  }
  console.log(`  ✅ ${programCount} ta dastur yuklandi`);

  // ─── 14. PROGRAM TRANSLATIONS ────────────────────────────────
  console.log('\n🌍 Dastur tarjimalari yuklanmoqda...');
  let prtCount = 0;
  for (const t of raw.programTranslations || []) {
    const programId = programIdMap[t.programId] || t.programId;
    if (!programId || !t.languageCode) continue;
    const exists = await prisma.program.findUnique({ where: { id: programId } });
    if (!exists) continue;
    try {
      await prisma.programTranslation.upsert({
        where: { programId_languageCode: { programId, languageCode: t.languageCode } },
        update: { title: str(t.title), description: str(t.description), badge: str(t.badge), requirements: str(t.requirements) },
        create: {
          id: safeId(t.id, 'prt'),
          programId,
          languageCode: t.languageCode,
          title: str(t.title),
          description: str(t.description) || str(t.title),
          badge: str(t.badge),
          requirements: str(t.requirements),
          createdAt: dt(t.createdAt),
          updatedAt: dt(t.updatedAt),
        },
      });
      prtCount++;
    } catch (e) {
      console.warn(`  ⚠️  ProgramTranslation skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${prtCount} ta dastur tarjimasi yuklandi`);

  // ─── 15. APPLICATIONS ────────────────────────────────────────
  console.log('\n📋 Arizalar yuklanmoqda...');
  let appCount = 0;
  for (const a of raw.applications || []) {
    if (!a.phone && !a.email) continue;
    const id = safeId(a.id || a._id, 'app');
    const branchId = a.branchId ? (branchIdMap[a.branchId] || a.branchId) : null;
    let finalBranchId = null;
    if (branchId) {
      const exists = await prisma.branch.findUnique({ where: { id: branchId } });
      finalBranchId = exists ? branchId : null;
    }
    let userId = null;
    if (a.userId) {
      const uExists = await prisma.user.findUnique({ where: { id: a.userId } });
      userId = uExists ? a.userId : null;
    }
    const validStatuses = ['NEW', 'REVIEWING', 'ACCEPTED', 'REJECTED'];
    const status = validStatuses.includes((a.status || '').toUpperCase()) ? a.status.toUpperCase() : 'NEW';
    try {
      await prisma.application.upsert({
        where: { id },
        update: {
          fullName: str(a.fullName) || str(a.firstName) + ' ' + str(a.lastName),
          phone: str(a.phone),
          email: str(a.email) || 'noemail@nis.uz',
          selectedProgram: str(a.selectedProgram) || 'AI & Data Science',
          message: str(a.message),
          status,
          branchId: finalBranchId,
          userId,
        },
        create: {
          id,
          fullName: str(a.fullName) || (str(a.firstName) + ' ' + str(a.lastName)).trim() || 'Applicant',
          phone: str(a.phone) || '+998000000000',
          email: str(a.email) || 'noemail@nis.uz',
          selectedProgram: str(a.selectedProgram) || 'AI & Data Science',
          message: str(a.message),
          status,
          branchId: finalBranchId,
          userId,
          createdAt: dt(a.createdAt),
          updatedAt: dt(a.updatedAt),
        },
      });
      appCount++;
    } catch (e) {
      console.warn(`  ⚠️  Application skip: ${e.message}`);
    }
  }
  console.log(`  ✅ ${appCount} ta ariza yuklandi`);

  // ─── 16. EVENTS ──────────────────────────────────────────────
  console.log('\n🎉 Tadbirlar yuklanmoqda...');
  let eventCount = 0;
  for (const e of raw.events || []) {
    if (!e.title) continue;
    const id = safeId(e.id || e._id, 'ev');
    const branchId = e.branchId ? (branchIdMap[e.branchId] || e.branchId) : null;
    let finalBranchId = null;
    if (branchId) {
      const exists = await prisma.branch.findUnique({ where: { id: branchId } });
      finalBranchId = exists ? branchId : null;
    }
    try {
      await prisma.event.upsert({
        where: { id },
        update: {
          title: str(e.title),
          description: str(e.description),
          date: e.date ? new Date(e.date) : new Date(),
          location: str(e.location),
          image: str(e.image),
          branchId: finalBranchId,
        },
        create: {
          id,
          title: str(e.title),
          description: str(e.description) || str(e.title),
          date: e.date ? new Date(e.date) : new Date(),
          location: str(e.location),
          image: str(e.image),
          branchId: finalBranchId,
          createdAt: dt(e.createdAt),
          updatedAt: dt(e.updatedAt),
        },
      });
      eventCount++;
    } catch (e2) {
      console.warn(`  ⚠️  Event skip (${e.title}): ${e2.message}`);
    }
  }
  console.log(`  ✅ ${eventCount} ta tadbir yuklandi`);

  // ─── SUMMARY ─────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('🎉 MIGRATSIYA MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('='.repeat(50));
  console.log(`  Tillar:          ${langsToSeed.length}`);
  console.log(`  Foydalanuvchilar:${userCount}`);
  console.log(`  Filiallar:       ${branchCount}`);
  console.log(`  O'qituvchilar:   ${teacherCount}`);
  console.log(`  Natijalar:       ${resultCount}`);
  console.log(`  Loyihalar:       ${projectCount}`);
  console.log(`  Yangiliklar:     ${newsCount}`);
  console.log(`  Dasturlar:       ${programCount}`);
  console.log(`  Arizalar:        ${appCount}`);
  console.log(`  Tadbirlar:       ${eventCount}`);
  console.log('='.repeat(50));
  console.log('  👤 Admin: admin@nis-ai.edu.uz / NisAdmin2026!');
  console.log('='.repeat(50) + '\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Migration xatolik:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
