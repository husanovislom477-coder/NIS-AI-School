const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DATA_DIR = path.join(__dirname, '../src/data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_LANGUAGES = [
  { id: 'lang_en', code: 'en', name: 'English', nativeName: 'English (US / UK)', flag: '🇬🇧', direction: 'ltr', isEnabled: true, isDefault: true, order: 1 },
  { id: 'lang_uz', code: 'uz', name: 'Uzbek', nativeName: "O'zbekcha", flag: '🇺🇿', direction: 'ltr', isEnabled: true, isDefault: false, order: 2 },
  { id: 'lang_ru', code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr', isEnabled: true, isDefault: false, order: 3 },
  { id: 'lang_tr', code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', direction: 'ltr', isEnabled: true, isDefault: false, order: 4 },
  { id: 'lang_de', code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr', isEnabled: true, isDefault: false, order: 5 },
  { id: 'lang_fr', code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', isEnabled: true, isDefault: false, order: 6 },
  { id: 'lang_es', code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', isEnabled: true, isDefault: false, order: 7 },
  { id: 'lang_ko', code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', direction: 'ltr', isEnabled: true, isDefault: false, order: 8 },
  { id: 'zh', code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr', isEnabled: true, isDefault: false, order: 9 },
  { id: 'ja', code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr', isEnabled: true, isDefault: false, order: 10 },
];

async function seed() {
  console.log('🌱 Starting clean production database seed...');

  const adminPasswordHash = await bcrypt.hash('NisAdmin2026!', 10);

  const initialAdmin = {
    id: 'usr_admin_01',
    firstName: 'System',
    lastName: 'Administrator',
    middleName: '',
    email: 'admin@nis-ai.edu.uz',
    phone: '+998 71 200 01 01',
    passwordHash: adminPasswordHash,
    profileImage: '',
    role: 'ADMIN',
    isActive: true,
    googleId: null,
    languageCode: 'en',
    language: 'en',
    theme: 'light',
    primaryColor: '#0066cc',
    secondaryColor: '#00a3ff',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Maintain database configuration in JSON storage
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let existing = { users: [], languages: [], branches: [], branchTranslations: [], teachers: [], teacherTranslations: [], studentResults: [], studentResultTranslations: [], projects: [], projectTranslations: [], news: [], newsTranslations: [], programs: [], programTranslations: [], applications: [], events: [] };
  if (fs.existsSync(DB_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      // fresh file
    }
  }

  // Ensure initial admin is present and secure
  const adminIndex = existing.users ? existing.users.findIndex(u => u.email === initialAdmin.email) : -1;
  if (adminIndex === -1) {
    existing.users = [initialAdmin, ...(existing.users || []).filter(u => u.role !== 'ADMIN')];
  } else {
    existing.users[adminIndex] = {
      ...existing.users[adminIndex],
      role: 'ADMIN',
      isActive: true,
      passwordHash: adminPasswordHash,
    };
  }

  // Remove fake sample users like TestUser
  existing.users = (existing.users || []).filter(u => !u.firstName?.toLowerCase().includes('test') && !u.email?.toLowerCase().includes('test'));

  // Ensure default languages
  if (!existing.languages || existing.languages.length === 0) {
    existing.languages = DEFAULT_LANGUAGES.map(l => ({
      ...l,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  console.log(`✅ System configuration & Admin successfully verified in ${DB_FILE}`);

  // 2. PostgreSQL Prisma Sync (if available)
  try {
    await prisma.$connect();
    console.log('📡 Connected to PostgreSQL via Prisma. Syncing system admin and languages...');

    await prisma.user.upsert({
      where: { email: initialAdmin.email },
      update: {
        role: 'ADMIN',
        isActive: true,
        passwordHash: adminPasswordHash,
      },
      create: {
        id: initialAdmin.id,
        firstName: initialAdmin.firstName,
        lastName: initialAdmin.lastName,
        email: initialAdmin.email,
        phone: initialAdmin.phone,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    for (const lang of DEFAULT_LANGUAGES) {
      await prisma.language.upsert({
        where: { code: lang.code },
        update: { isEnabled: lang.isEnabled, isDefault: lang.isDefault, name: lang.name, nativeName: lang.nativeName },
        create: {
          code: lang.code,
          name: lang.name,
          nativeName: lang.nativeName,
          flag: lang.flag,
          direction: lang.direction,
          isEnabled: lang.isEnabled,
          isDefault: lang.isDefault,
          order: lang.order,
        },
      });
    }
    console.log('✅ PostgreSQL system records verified.');
  } catch (err) {
    console.log(`ℹ️ PostgreSQL note: ${err.message}. Using persistent JSON database storage.`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
