const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
let isPrismaConnected = false;

// Path to persistent JSON database file
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Memory cache of persistent data
let fileDb = {
  users: [],
  languages: [],
  branches: [],
  branchTranslations: [],
  teachers: [],
  teacherTranslations: [],
  studentResults: [],
  studentResultTranslations: [],
  projects: [],
  projectTranslations: [],
  news: [],
  newsTranslations: [],
  programs: [],
  programTranslations: [],
  applications: [],
  events: [],
};

// Default initial languages (10 standard languages)
const DEFAULT_LANGUAGES = [
  {
    id: 'lang_en',
    code: 'en',
    name: 'English',
    nativeName: 'English (US / UK)',
    flag: '🇬🇧',
    direction: 'ltr',
    isEnabled: true,
    isDefault: true,
    order: 1,
  },
  {
    id: 'lang_uz',
    code: 'uz',
    name: 'Uzbek',
    nativeName: "O'zbekcha",
    flag: '🇺🇿',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 2,
  },
  {
    id: 'lang_ru',
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 3,
  },
  {
    id: 'lang_tr',
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 4,
  },
  {
    id: 'lang_de',
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 5,
  },
  {
    id: 'lang_fr',
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 6,
  },
  {
    id: 'lang_es',
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 7,
  },
  {
    id: 'lang_ko',
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 8,
  },
  {
    id: 'lang_zh',
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 9,
  },
  {
    id: 'lang_ja',
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    isEnabled: true,
    isDefault: false,
    order: 10,
  },
];

// Helper to save to file
const saveFileDb = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(fileDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save to db.json:', err.message);
  }
};

// Helper to load from file
const loadFileDb = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      fileDb = {
        users: loaded.users || [],
        languages: loaded.languages || [],
        branches: loaded.branches || [],
        branchTranslations: loaded.branchTranslations || [],
        teachers: loaded.teachers || [],
        teacherTranslations: loaded.teacherTranslations || [],
        studentResults: loaded.studentResults || [],
        studentResultTranslations: loaded.studentResultTranslations || [],
        projects: loaded.projects || [],
        projectTranslations: loaded.projectTranslations || [],
        news: loaded.news || [],
        newsTranslations: loaded.newsTranslations || [],
        programs: loaded.programs || [],
        programTranslations: loaded.programTranslations || [],
        applications: loaded.applications || [],
        events: loaded.events || [],
      };
    }
  } catch (err) {
    console.error('Failed to read db.json:', err.message);
  }
};

// Helper to sanitize user (never expose passwordHash)
const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, password, ...rest } = user;
  return {
    ...rest,
    id: user.id || user._id,
    _id: user.id || user._id,
    languageCode: user.languageCode || user.language || 'en',
    language: user.language || user.languageCode || 'en',
  };
};

const formatItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    id: item.id || item._id,
    _id: item.id || item._id,
  };
};

// ─── RELATIONAL LOCALIZATION RESOLVER ──────────────────────────────────────────
/**
 * Resolves localized fields for an entity using the Fallback Chain:
 * 1. Requested language translation
 * 2. English ('en') translation
 * 3. First available translation in any language
 * 4. Entity base properties
 *
 * Never returns undefined or empty text.
 */
function resolveEntityLocalization(entity, translations = [], lang = 'en', translatableKeys = []) {
  if (!entity) return entity;
  const requestedLang = (lang || 'en').toLowerCase();
  const list = Array.isArray(translations) ? translations : [];

  // 1. Find requested translation
  const matchLang = list.find(
    (t) => (t.languageCode || t.lang || '').toLowerCase() === requestedLang
  );

  // 2. Find English fallback
  const matchEn =
    requestedLang !== 'en'
      ? list.find((t) => (t.languageCode || t.lang || '').toLowerCase() === 'en')
      : null;

  // 3. First available translation
  const matchFirst = list[0] || null;

  const localizedProps = {};
  for (const key of translatableKeys) {
    let val = matchLang?.[key];
    if (val === undefined || val === null || val === '') {
      val = matchEn?.[key];
    }
    if (val === undefined || val === null || val === '') {
      val = matchFirst?.[key];
    }
    if (val === undefined || val === null || val === '') {
      val = entity[key];
    }
    localizedProps[key] = val !== undefined && val !== null ? val : '';
  }

  // Also build translations completion dictionary for easy frontend inspect
  const translationsMap = {};
  for (const t of list) {
    const code = (t.languageCode || t.lang || '').toLowerCase();
    if (code) translationsMap[code] = t;
  }

  return {
    ...entity,
    ...localizedProps,
    translations: list,
    _translations: translationsMap,
  };
}

// ─── DATA MIGRATION & SEEDING ────────────────────────────────────────────────
const seedInitialData = () => {
  let modified = false;

  // 1. Seed Languages
  if (!fileDb.languages || fileDb.languages.length === 0) {
    fileDb.languages = DEFAULT_LANGUAGES.map((l) => ({
      ...l,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    modified = true;
  }

  // 2. Seed Branch Translations
  if (fileDb.branches && fileDb.branches.length > 0 && (!fileDb.branchTranslations || fileDb.branchTranslations.length === 0)) {
    fileDb.branchTranslations = [];
    for (const b of fileDb.branches) {
      if (b.id === 'br_tashkent_01') {
        fileDb.branchTranslations.push(
          {
            id: 'bt_tash_uz',
            branchId: b.id,
            languageCode: 'uz',
            name: 'Toshkent Bosh Kampus',
            description: "Sun'iy intellekt va robototexnika bo'yicha mintaqadagi eng yirik zamonaviy kampus. 1500+ o'quvchi uchun ilmiy laboratoriyalar va sport majmualari.",
            address: "Toshkent sh., Mirzo Ulug'bek tumani, Universitet ko'chasi 7-uy",
            workingHours: '08:00 - 18:30',
          },
          {
            id: 'bt_tash_en',
            branchId: b.id,
            languageCode: 'en',
            name: 'Tashkent Main Campus',
            description: 'The premier modern artificial intelligence and robotics campus in Central Asia. Advanced research laboratories and sports facilities for 1,500+ students.',
            address: '7 University Street, Mirzo Ulugbek District, Tashkent',
            workingHours: '08:00 - 18:30',
          },
          {
            id: 'bt_tash_ru',
            branchId: b.id,
            languageCode: 'ru',
            name: 'Главный кампус в Ташкенте',
            description: 'Крупнейший современный кампус по искусственному интеллекту и робототехнике в регионе. Научные лаборатории и спорткомплексы для 1500+ учащихся.',
            address: 'г. Ташкент, Мирзо-Улугбекский р-н, ул. Университетская, 7',
            workingHours: '08:00 - 18:30',
          }
        );
      } else if (b.id === 'br_samarkand_02') {
        fileDb.branchTranslations.push(
          {
            id: 'bt_sam_uz',
            branchId: b.id,
            languageCode: 'uz',
            name: 'Samarqand Innovatsion Filial',
            description: "Tarixiy zamin va zamonaviy ilm-fan uyg'unligi. Dasturiy ta'minot injiniringi va biotexnologiya yo'nalishlariga ixtisoslashgan innovatsion markaz.",
            address: "Samarqand sh., Registon ko'chasi 14-uy",
            workingHours: '08:30 - 18:00',
          },
          {
            id: 'bt_sam_en',
            branchId: b.id,
            languageCode: 'en',
            name: 'Samarkand Innovation Campus',
            description: 'Harmonious fusion of historic heritage and futuristic science. Innovation center focused on software engineering and biotechnology.',
            address: '14 Registan Street, Samarkand',
            workingHours: '08:30 - 18:00',
          },
          {
            id: 'bt_sam_ru',
            branchId: b.id,
            languageCode: 'ru',
            name: 'Самаркандский инновационный филиал',
            description: 'Слияние исторического наследия и передовой науки. Инновационный центр программной инженерии и биотехнологий.',
            address: 'г. Самарканд, ул. Регистан, 14',
            workingHours: '08:30 - 18:00',
          }
        );
      } else if (b.id === 'br_bukhara_03') {
        fileDb.branchTranslations.push(
          {
            id: 'bt_bux_uz',
            branchId: b.id,
            languageCode: 'uz',
            name: 'Buxoro Yuqori Texnologiyalar Filiali',
            description: "Kiberxavfsizlik, amaliy matematika va chuqur mashinali o'rganish yo'nalishidagi ixtisoslashgan kampus.",
            address: "Buxoro sh., Ibrohim Mo'minov ko'chasi 22-uy",
            workingHours: '08:30 - 18:00',
          },
          {
            id: 'bt_bux_en',
            branchId: b.id,
            languageCode: 'en',
            name: 'Bukhara High-Tech Campus',
            description: 'Specialized campus dedicated to cybersecurity, applied mathematics, and deep machine learning architectures.',
            address: '22 Ibrahim Muminov Street, Bukhara',
            workingHours: '08:30 - 18:00',
          },
          {
            id: 'bt_bux_ru',
            branchId: b.id,
            languageCode: 'ru',
            name: 'Бухарский филиал высоких технологий',
            description: 'Специализированный кампус по кибербезопасности, прикладной математике и глубокому машинному обучению.',
            address: 'г. Бухара, ул. Ибрагима Муминова, 22',
            workingHours: '08:30 - 18:00',
          }
        );
      } else {
        fileDb.branchTranslations.push(
          {
            id: 'bt_' + b.id + '_uz',
            branchId: b.id,
            languageCode: 'uz',
            name: b.name || '',
            description: b.description || '',
            address: b.address || '',
            workingHours: b.workingHours || '08:30 - 18:00',
          },
          {
            id: 'bt_' + b.id + '_en',
            branchId: b.id,
            languageCode: 'en',
            name: b.name || '',
            description: b.description || '',
            address: b.address || '',
            workingHours: b.workingHours || '08:30 - 18:00',
          }
        );
      }
    }
    modified = true;
  }

  // 3. Seed Teacher Translations
  if (fileDb.teachers && fileDb.teachers.length > 0 && (!fileDb.teacherTranslations || fileDb.teacherTranslations.length === 0)) {
    fileDb.teacherTranslations = [];
    for (const t of fileDb.teachers) {
      if (t.id === 'tc_01') {
        fileDb.teacherTranslations.push(
          {
            id: 'tt_01_uz',
            teacherId: t.id,
            languageCode: 'uz',
            bio: "MIT (PhD) bitiruvchisi. Sun'iy intellekt, Kompyuter ko'rishi va Neyron tarmoqlar bo'yicha 12 yillik ilmiy va amaliy tajribaga ega.",
            subject: "Computer Vision & Deep Learning",
            university: "Massachusetts Institute of Technology (MIT)",
            degree: "PhD in Computer Science",
            certificates: "NVIDIA Certified Deep Learning Instructor, Google Developer Expert",
            achievements: "Xalqaro AI konferensiyalarida 15+ ilmiy maqolalar muallifi",
          },
          {
            id: 'tt_01_en',
            teacherId: t.id,
            languageCode: 'en',
            bio: 'MIT (PhD) graduate with 12+ years of research and industry expertise in Artificial Intelligence, Computer Vision, and Neural Networks.',
            subject: 'Computer Vision & Deep Learning',
            university: 'Massachusetts Institute of Technology (MIT)',
            degree: 'PhD in Computer Science',
            certificates: 'NVIDIA Certified Deep Learning Instructor, Google Developer Expert',
            achievements: 'Author of 15+ research publications at premier international AI conferences',
          },
          {
            id: 'tt_01_ru',
            teacherId: t.id,
            languageCode: 'ru',
            bio: 'Выпускник MIT (PhD). Более 12 лет научно-практического опыта в области ИИ, компьютерного зрения и глубоких нейронных сетей.',
            subject: 'Компьютерное зрение и глубокое обучение',
            university: 'Массачусетский технологический институт (MIT)',
            degree: 'PhD по компьютерным наукам',
            certificates: 'NVIDIA Certified Instructor, Google Developer Expert',
            achievements: 'Автор 15+ научных статей на ведущих международных конференциях',
          }
        );
      } else if (t.id === 'tc_02') {
        fileDb.teacherTranslations.push(
          {
            id: 'tt_02_uz',
            teacherId: t.id,
            languageCode: 'uz',
            bio: "Stanford University magistri. Katta hajmdagi ma'lumotlar tahlili va algoritmik dasturlash bo'yicha yetakchi mutaxassis.",
            subject: "Data Science & Algorithms",
            university: "Stanford University",
            degree: "MSc in Data Science",
            certificates: "AWS Certified Machine Learning Specialist",
            achievements: "Olimpiada jamoalari ustozi (IOI medalistlar murabbiyi)",
          },
          {
            id: 'tt_02_en',
            teacherId: t.id,
            languageCode: 'en',
            bio: 'Stanford University MSc graduate. Leading specialist in Big Data analytics, competitive programming, and algorithm design.',
            subject: 'Data Science & Algorithms',
            university: 'Stanford University',
            degree: 'MSc in Data Science',
            certificates: 'AWS Certified Machine Learning Specialist',
            achievements: 'Head Mentor for National Olympiad Teams (IOI Medalists Coach)',
          },
          {
            id: 'tt_02_ru',
            teacherId: t.id,
            languageCode: 'ru',
            bio: 'Магистр Стэнфордского университета. Ведущий специалист по анализу больших данных и алгоритмическому программированию.',
            subject: 'Data Science и алгоритмы',
            university: 'Стэнфордский университет (Stanford)',
            degree: 'MSc по Data Science',
            certificates: 'AWS Certified Machine Learning Specialist',
            achievements: 'Тренер олимпиадных команд (наставник медалистов IOI)',
          }
        );
      } else {
        fileDb.teacherTranslations.push(
          {
            id: 'tt_' + t.id + '_uz',
            teacherId: t.id,
            languageCode: 'uz',
            bio: t.bio || '',
            subject: t.subject || '',
            university: t.university || '',
            degree: t.degree || '',
            certificates: t.certificates || '',
            achievements: t.achievements || '',
          },
          {
            id: 'tt_' + t.id + '_en',
            teacherId: t.id,
            languageCode: 'en',
            bio: t.bio || '',
            subject: t.subject || '',
            university: t.university || '',
            degree: t.degree || '',
            certificates: t.certificates || '',
            achievements: t.achievements || '',
          }
        );
      }
    }
    modified = true;
  }

  // 4. Seed Student Results Translations
  if (fileDb.studentResults && fileDb.studentResults.length > 0 && (!fileDb.studentResultTranslations || fileDb.studentResultTranslations.length === 0)) {
    fileDb.studentResultTranslations = [];
    for (const r of fileDb.studentResults) {
      fileDb.studentResultTranslations.push(
        {
          id: 'rt_' + r.id + '_uz',
          resultId: r.id,
          languageCode: 'uz',
          description: r.description || '',
        },
        {
          id: 'rt_' + r.id + '_en',
          resultId: r.id,
          languageCode: 'en',
          description: r.description
            ? r.description.replace('ball', 'points').replace('Umumiy', 'Overall score')
            : 'Outstanding performance',
        }
      );
    }
    modified = true;
  }

  // 5. Seed Projects Translations
  if (fileDb.projects && fileDb.projects.length > 0 && (!fileDb.projectTranslations || fileDb.projectTranslations.length === 0)) {
    fileDb.projectTranslations = [];
    for (const p of fileDb.projects) {
      if (p.id === 'prj_01') {
        fileDb.projectTranslations.push(
          {
            id: 'pt_01_uz',
            projectId: p.id,
            languageCode: 'uz',
            title: p.title,
            description: "GPS-siz murakkab muhitda 16 tagacha dronlar uchun markazlashmagan konsensus protokoli va kompyuter ko'rish orqali to'qnashuvdan qochish tizimi.",
            category: "Robototexnika va AI",
          },
          {
            id: 'pt_01_en',
            projectId: p.id,
            languageCode: 'en',
            title: p.title,
            description: 'Decentralized consensus protocol and computer vision-based collision avoidance system for swarms of up to 16 autonomous drones in GPS-denied environments.',
            category: 'Robotics & AI',
          },
          {
            id: 'pt_01_ru',
            projectId: p.id,
            languageCode: 'ru',
            title: p.title,
            description: 'Децентрализованный протокол консенсуса и система предотвращения столкновений на базе компьютерного зрения для роя из 16 БПЛА в среде без GPS.',
            category: 'Робототехника и ИИ',
          }
        );
      } else {
        fileDb.projectTranslations.push(
          {
            id: 'pt_' + p.id + '_uz',
            projectId: p.id,
            languageCode: 'uz',
            title: p.title || '',
            description: p.description || '',
            category: p.category || '',
          },
          {
            id: 'pt_' + p.id + '_en',
            projectId: p.id,
            languageCode: 'en',
            title: p.title || '',
            description: p.description || '',
            category: p.category || '',
          }
        );
      }
    }
    modified = true;
  }

  // 6. Seed News Translations
  if (fileDb.news && fileDb.news.length > 0 && (!fileDb.newsTranslations || fileDb.newsTranslations.length === 0)) {
    fileDb.newsTranslations = [];
    for (const n of fileDb.news) {
      if (n.id === 'nws_01') {
        fileDb.newsTranslations.push(
          {
            id: 'nt_01_uz',
            newsId: n.id,
            languageCode: 'uz',
            title: "NIS AI School o'quvchilari Xalqaro Sun'iy Intellekt Olimpiadasida oltin medalni qo'lga kiritishdi",
            shortDescription: "Seul shahrida o'tkazilgan nufuzli IAIO 2026 xalqaro olimpiadasida maktabimiz terma jamoasi tarixiy g'alabani qayd etdi.",
            content: n.content,
          },
          {
            id: 'nt_01_en',
            newsId: n.id,
            languageCode: 'en',
            title: 'NIS AI School Students Win Gold Medals at the International Artificial Intelligence Olympiad',
            shortDescription: 'Our school national team scored a historic victory at the prestigious IAIO 2026 Olympiad held in Seoul, South Korea.',
            content: "At the IAIO 2026 (International Artificial Intelligence Olympiad) held in Seoul with more than 300 gifted students from 48 countries, NIS AI School delegates secured absolute top honors.\n\nTeam member Kamila Karimova solved challenging machine learning and computer vision problems with the highest benchmark score, winning the Gold Medal.",
          },
          {
            id: 'nt_01_ru',
            newsId: n.id,
            languageCode: 'ru',
            title: 'Учащиеся NIS AI School завоевали золотые медали на Международной олимпиаде по ИИ',
            shortDescription: 'Сборная нашей школы одержала историческую победу на престижной олимпиаде IAIO 2026 в Сеуле.',
            content: 'На олимпиаде IAIO 2026 в Сеуле среди более чем 300 участников из 48 стран учащиеся NIS AI School завоевали абсолютное лидерство и золотые медали в области машинного обучения и нейросетей.',
          }
        );
      } else {
        fileDb.newsTranslations.push(
          {
            id: 'nt_' + n.id + '_uz',
            newsId: n.id,
            languageCode: 'uz',
            title: n.title || '',
            shortDescription: n.shortDescription || '',
            content: n.content || '',
          },
          {
            id: 'nt_' + n.id + '_en',
            newsId: n.id,
            languageCode: 'en',
            title: n.title || '',
            shortDescription: n.shortDescription || '',
            content: n.content || '',
          }
        );
      }
    }
    modified = true;
  }

  if (modified) {
    saveFileDb();
  }
};

// Initialize database connection
const initDB = async () => {
  loadFileDb();
  seedInitialData();
  try {
    await prisma.$connect();
    // Verify connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    isPrismaConnected = true;
    console.log('✅ PostgreSQL connected via Prisma ORM');
    console.log(`   DATABASE_URL: ${(process.env.DATABASE_URL || '').replace(/:([^:@]+)@/, ':***@')}`);
  } catch (err) {
    isPrismaConnected = false;
    console.warn(`⚠️  PostgreSQL connection not available: ${err.message}`);
    console.log('📦 Operating with persistent local file database storage (data/db.json)');
    console.log(`   To connect PostgreSQL, run: npm run setup (see setup_postgres.ps1)`);
  }
};

// ─── LANGUAGE OPERATIONS (DYNAMIC LANGUAGES MANAGEMENT) ────────────────────────

const listLanguages = async ({ all = false } = {}) => {
  if (isPrismaConnected) {
    try {
      const where = all ? {} : { isEnabled: true };
      const items = await prisma.language.findMany({
        where,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      });
      if (items && items.length > 0) return items.map(formatItem);
    } catch (_) {}
  }

  let items = fileDb.languages || [];
  if (!all) {
    items = items.filter((l) => l.isEnabled !== false);
  }
  return items.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
};

const findLanguageByCode = async (code) => {
  const norm = (code || '').toLowerCase().trim();
  if (isPrismaConnected) {
    try {
      const l = await prisma.language.findUnique({ where: { code: norm } });
      if (l) return formatItem(l);
    } catch (_) {}
  }
  return fileDb.languages.find((l) => (l.code || '').toLowerCase() === norm) || null;
};

const createLanguage = async (data) => {
  const code = (data.code || '').toLowerCase().trim();
  if (!code) throw new Error('Language code is required.');

  const existing = await findLanguageByCode(code);
  if (existing) throw new Error(`Language with code "${code}" already exists.`);

  const id = data.id || 'lang_' + code;
  const now = new Date();
  const record = {
    id,
    _id: id,
    code,
    name: data.name || code.toUpperCase(),
    nativeName: data.nativeName || data.name || code.toUpperCase(),
    flag: data.flag || '🌐',
    direction: data.direction || 'ltr',
    isEnabled: data.isEnabled !== false,
    isDefault: data.isDefault === true,
    order: data.order !== undefined ? parseInt(data.order) : fileDb.languages.length + 1,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (isPrismaConnected) {
    try {
      const created = await prisma.language.create({ data: record });
      return formatItem(created);
    } catch (_) {}
  }

  fileDb.languages.push(record);
  saveFileDb();
  return record;
};

const updateLanguage = async (code, data) => {
  const norm = (code || '').toLowerCase().trim();
  const now = new Date();

  if (isPrismaConnected) {
    try {
      const updated = await prisma.language.update({
        where: { code: norm },
        data: {
          ...data,
          updatedAt: now,
        },
      });
      return formatItem(updated);
    } catch (_) {}
  }

  const idx = fileDb.languages.findIndex((l) => (l.code || '').toLowerCase() === norm);
  if (idx !== -1) {
    fileDb.languages[idx] = {
      ...fileDb.languages[idx],
      ...data,
      updatedAt: now.toISOString(),
    };
    saveFileDb();
    return fileDb.languages[idx];
  }
  return null;
};

const toggleLanguage = async (code) => {
  const norm = (code || '').toLowerCase().trim();
  const lang = await findLanguageByCode(norm);
  if (!lang) throw new Error('Language not found.');

  // Prevent disabling default English language
  if (norm === 'en' && lang.isEnabled) {
    throw new Error('Default system language (English) cannot be disabled.');
  }

  return updateLanguage(norm, { isEnabled: !lang.isEnabled });
};

const deleteLanguage = async (code) => {
  const norm = (code || '').toLowerCase().trim();
  if (norm === 'en') {
    throw new Error('Default system language (English) cannot be deleted.');
  }

  if (isPrismaConnected) {
    try {
      await prisma.language.delete({ where: { code: norm } });
    } catch (_) {}
  }

  fileDb.languages = fileDb.languages.filter((l) => (l.code || '').toLowerCase() !== norm);
  saveFileDb();
  return true;
};

// ─── USER OPERATIONS ─────────────────────────────────────────────────────────

const findUserById = async (id) => {
  if (isPrismaConnected) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      return formatItem(user);
    } catch (_) {}
  }
  const user = fileDb.users.find((u) => u.id === id || u._id === id);
  return formatItem(user);
};

const findUserByEmail = async (email) => {
  const normEmail = (email || '').toLowerCase().trim();
  if (isPrismaConnected) {
    try {
      const user = await prisma.user.findUnique({ where: { email: normEmail } });
      return formatItem(user);
    } catch (_) {}
  }
  const user = fileDb.users.find((u) => (u.email || '').toLowerCase() === normEmail);
  return formatItem(user);
};

const findUserByGoogleId = async (googleId) => {
  if (isPrismaConnected) {
    try {
      const user = await prisma.user.findUnique({ where: { googleId } });
      return formatItem(user);
    } catch (_) {}
  }
  const user = fileDb.users.find((u) => u.googleId === googleId);
  return formatItem(user);
};

const createUser = async (data) => {
  const normEmail = (data.email || '').toLowerCase().trim();
  const id = data.id || 'usr_' + Date.now() + Math.random().toString(36).substring(2, 7);
  const now = new Date();
  const lang = data.language || data.languageCode || 'en';

  const record = {
    id,
    _id: id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    middleName: data.middleName || data.patronymic || '',
    email: normEmail,
    phone: data.phone || '',
    passwordHash: data.passwordHash || '',
    profileImage: data.profileImage || data.avatar || '',
    role: data.role === 'ADMIN' || data.role === 'admin' ? 'ADMIN' : 'USER',
    isActive: data.isActive !== false,
    googleId: data.googleId || null,
    language: lang,
    languageCode: lang,
    theme: data.theme || 'light',
    primaryColor: data.primaryColor || '#0066cc',
    secondaryColor: data.secondaryColor || '#00a3ff',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt).toISOString() : null,
  };

  if (isPrismaConnected) {
    try {
      const created = await prisma.user.create({
        data: {
          id: record.id,
          firstName: record.firstName,
          lastName: record.lastName,
          middleName: record.middleName,
          email: record.email,
          phone: record.phone,
          passwordHash: record.passwordHash,
          profileImage: record.profileImage,
          role: record.role,
          isActive: record.isActive,
          googleId: record.googleId,
          language: record.language,
          languageCode: record.languageCode,
          theme: record.theme,
          primaryColor: record.primaryColor,
          secondaryColor: record.secondaryColor,
        },
      });
      return formatItem(created);
    } catch (e) {
      console.warn('Prisma createUser failed, saving to fileDb:', e.message);
    }
  }

  fileDb.users.push(record);
  saveFileDb();
  return record;
};

const updateUser = async (id, data) => {
  const now = new Date();
  const updateData = { ...data };
  if (data.language && !data.languageCode) updateData.languageCode = data.language;
  if (data.languageCode && !data.language) updateData.language = data.languageCode;

  if (isPrismaConnected) {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: now,
        },
      });
      return formatItem(updated);
    } catch (_) {}
  }

  const idx = fileDb.users.findIndex((u) => u.id === id || u._id === id);
  if (idx !== -1) {
    fileDb.users[idx] = {
      ...fileDb.users[idx],
      ...updateData,
      updatedAt: now.toISOString(),
    };
    saveFileDb();
    return fileDb.users[idx];
  }
  return null;
};

const deleteUser = async (id) => {
  if (isPrismaConnected) {
    try {
      await prisma.user.delete({ where: { id } });
    } catch (_) {}
  }
  fileDb.users = fileDb.users.filter((u) => u.id !== id && u._id !== id);
  saveFileDb();
  return true;
};

const listUsers = async ({ search = '', role = '', page = 1, limit = 20 }) => {
  let items = fileDb.users;
  if (isPrismaConnected) {
    try {
      const where = {};
      if (role) where.role = role.toUpperCase();
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }
      const total = await prisma.user.count({ where });
      const users = await prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
      return {
        data: users.map(sanitizeUser),
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      };
    } catch (_) {}
  }

  if (search) {
    const s = search.toLowerCase();
    items = items.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(s) ||
        u.lastName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
    );
  }
  if (role) {
    items = items.filter((u) => u.role?.toUpperCase() === role.toUpperCase());
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit).map(sanitizeUser);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const countUsers = async () => {
  if (isPrismaConnected) {
    try {
      return await prisma.user.count();
    } catch (_) {}
  }
  return fileDb.users.length;
};

// ─── BRANCH OPERATIONS (MULTILINGUAL) ────────────────────────────────────────

const listBranches = async ({ search = '', language = 'en', limit = 50, page = 1 } = {}) => {
  const transKeys = ['name', 'description', 'address', 'workingHours'];

  if (isPrismaConnected) {
    try {
      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { address: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};
      const total = await prisma.branch.count({ where });
      const branches = await prisma.branch.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          translations: true,
          teachers: true,
          results: true,
          projects: true,
        },
      });

      const localized = branches.map((b) =>
        resolveEntityLocalization(b, b.translations, language, transKeys)
      );

      return {
        data: localized.map(formatItem),
        total,
        page,
        pages: Math.ceil(total / limit) || 1,
      };
    } catch (_) {}
  }

  let items = fileDb.branches || [];
  const translations = fileDb.branchTranslations || [];

  const localizedList = items.map((b) => {
    const bTrans = translations.filter((t) => t.branchId === b.id);
    return resolveEntityLocalization(b, bTrans, language, transKeys);
  });

  let filtered = localizedList;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (b) => b.name?.toLowerCase().includes(s) || b.address?.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findBranchById = async (id, language = 'en') => {
  const transKeys = ['name', 'description', 'address', 'workingHours'];

  if (isPrismaConnected) {
    try {
      const b = await prisma.branch.findUnique({
        where: { id },
        include: {
          translations: true,
          teachers: true,
          results: true,
          projects: true,
        },
      });
      if (b) {
        return formatItem(resolveEntityLocalization(b, b.translations, language, transKeys));
      }
    } catch (_) {}
  }

  const b = fileDb.branches.find((x) => x.id === id || x._id === id);
  if (!b) return null;

  const translations = (fileDb.branchTranslations || []).filter((t) => t.branchId === b.id);
  return formatItem(resolveEntityLocalization(b, translations, language, transKeys));
};

const saveBranchTranslations = (branchId, translationsInput = []) => {
  let list = [];
  if (Array.isArray(translationsInput)) {
    list = translationsInput;
  } else if (typeof translationsInput === 'object' && translationsInput !== null) {
    list = Object.entries(translationsInput).map(([code, vals]) => ({
      languageCode: code,
      ...vals,
    }));
  }

  if (!fileDb.branchTranslations) fileDb.branchTranslations = [];

  for (const item of list) {
    const langCode = (item.languageCode || item.lang || '').toLowerCase().trim();
    if (!langCode) continue;

    const existingIdx = fileDb.branchTranslations.findIndex(
      (t) => t.branchId === branchId && (t.languageCode || '').toLowerCase() === langCode
    );

    const record = {
      id: existingIdx !== -1 ? fileDb.branchTranslations[existingIdx].id : 'bt_' + branchId + '_' + langCode,
      branchId,
      languageCode: langCode,
      name: item.name || '',
      description: item.description || '',
      address: item.address || '',
      workingHours: item.workingHours || '08:30 - 18:00',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      fileDb.branchTranslations[existingIdx] = record;
    } else {
      record.createdAt = new Date().toISOString();
      fileDb.branchTranslations.push(record);
    }
  }
};

const createBranch = async (data) => {
  const id = data.id || 'br_' + Date.now();
  const now = new Date();
  const record = {
    id,
    _id: id,
    name: data.name || '',
    description: data.description || '',
    address: data.address || '',
    phone: data.phone || '',
    latitude: data.latitude ? parseFloat(data.latitude) : 0,
    longitude: data.longitude ? parseFloat(data.longitude) : 0,
    image: data.image || data.coverImage || '',
    images: data.images || '[]',
    video: data.video || '',
    workingHours: data.workingHours || '08:30 - 18:00',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.branches.push(record);

  // Handle translations if provided
  if (data.translations) {
    saveBranchTranslations(id, data.translations);
  } else {
    // Generate default translation for 'en' and 'uz' from base fields
    saveBranchTranslations(id, [
      { languageCode: 'en', name: data.name, description: data.description, address: data.address, workingHours: data.workingHours },
      { languageCode: 'uz', name: data.name, description: data.description, address: data.address, workingHours: data.workingHours },
    ]);
  }

  saveFileDb();
  return formatItem(record);
};

const updateBranch = async (id, data) => {
  const now = new Date();
  const idx = fileDb.branches.findIndex((x) => x.id === id || x._id === id);
  if (idx === -1) return null;

  fileDb.branches[idx] = {
    ...fileDb.branches[idx],
    ...data,
    updatedAt: now.toISOString(),
  };

  if (data.translations) {
    saveBranchTranslations(id, data.translations);
  }

  saveFileDb();
  return formatItem(fileDb.branches[idx]);
};

const deleteBranch = async (id) => {
  fileDb.branches = fileDb.branches.filter((x) => x.id !== id && x._id !== id);
  if (fileDb.branchTranslations) {
    fileDb.branchTranslations = fileDb.branchTranslations.filter((t) => t.branchId !== id);
  }
  saveFileDb();
  return true;
};

const countBranches = async () => fileDb.branches.length;

// ─── TEACHER OPERATIONS (MULTILINGUAL) ───────────────────────────────────────

const listTeachers = async ({ search = '', branchId = '', language = 'en', limit = 50, page = 1 } = {}) => {
  const transKeys = ['bio', 'subject', 'university', 'degree', 'certificates', 'achievements'];

  let items = fileDb.teachers || [];
  const translations = fileDb.teacherTranslations || [];

  const localizedList = items.map((t) => {
    const tTrans = translations.filter((tr) => tr.teacherId === t.id);
    return resolveEntityLocalization(t, tTrans, language, transKeys);
  });

  let filtered = localizedList;
  if (branchId) filtered = filtered.filter((t) => t.branchId === branchId);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.firstName?.toLowerCase().includes(s) ||
        t.lastName?.toLowerCase().includes(s) ||
        t.subject?.toLowerCase().includes(s) ||
        t.university?.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findTeacherById = async (id, language = 'en') => {
  const transKeys = ['bio', 'subject', 'university', 'degree', 'certificates', 'achievements'];
  const t = fileDb.teachers.find((x) => x.id === id || x._id === id);
  if (!t) return null;

  const translations = (fileDb.teacherTranslations || []).filter((tr) => tr.teacherId === t.id);
  return formatItem(resolveEntityLocalization(t, translations, language, transKeys));
};

const saveTeacherTranslations = (teacherId, translationsInput = []) => {
  let list = [];
  if (Array.isArray(translationsInput)) {
    list = translationsInput;
  } else if (typeof translationsInput === 'object' && translationsInput !== null) {
    list = Object.entries(translationsInput).map(([code, vals]) => ({
      languageCode: code,
      ...vals,
    }));
  }

  if (!fileDb.teacherTranslations) fileDb.teacherTranslations = [];

  for (const item of list) {
    const langCode = (item.languageCode || item.lang || '').toLowerCase().trim();
    if (!langCode) continue;

    const existingIdx = fileDb.teacherTranslations.findIndex(
      (t) => t.teacherId === teacherId && (t.languageCode || '').toLowerCase() === langCode
    );

    const record = {
      id: existingIdx !== -1 ? fileDb.teacherTranslations[existingIdx].id : 'tt_' + teacherId + '_' + langCode,
      teacherId,
      languageCode: langCode,
      bio: item.bio || '',
      subject: item.subject || 'Computer Science / AI',
      university: item.university || '',
      degree: item.degree || '',
      certificates: item.certificates || '',
      achievements: item.achievements || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      fileDb.teacherTranslations[existingIdx] = record;
    } else {
      record.createdAt = new Date().toISOString();
      fileDb.teacherTranslations.push(record);
    }
  }
};

const createTeacher = async (data) => {
  const id = data.id || 'tc_' + Date.now();
  const now = new Date();
  const record = {
    id,
    _id: id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    middleName: data.middleName || '',
    photo: data.photo || '',
    bio: data.bio || '',
    subject: data.subject || 'Computer Science / AI',
    university: data.university || '',
    degree: data.degree || '',
    IELTSScore: data.IELTSScore || '',
    SATScore: data.SATScore || '',
    HSKScore: data.HSKScore || '',
    certificates: data.certificates || '',
    achievements: data.achievements || '',
    branchId: data.branchId || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.teachers.push(record);

  if (data.translations) {
    saveTeacherTranslations(id, data.translations);
  } else {
    saveTeacherTranslations(id, [
      { languageCode: 'en', bio: data.bio, subject: data.subject, university: data.university, degree: data.degree, certificates: data.certificates, achievements: data.achievements },
      { languageCode: 'uz', bio: data.bio, subject: data.subject, university: data.university, degree: data.degree, certificates: data.certificates, achievements: data.achievements },
    ]);
  }

  saveFileDb();
  return formatItem(record);
};

const updateTeacher = async (id, data) => {
  const now = new Date();
  const idx = fileDb.teachers.findIndex((x) => x.id === id || x._id === id);
  if (idx === -1) return null;

  fileDb.teachers[idx] = {
    ...fileDb.teachers[idx],
    ...data,
    updatedAt: now.toISOString(),
  };

  if (data.translations) {
    saveTeacherTranslations(id, data.translations);
  }

  saveFileDb();
  return formatItem(fileDb.teachers[idx]);
};

const deleteTeacher = async (id) => {
  fileDb.teachers = fileDb.teachers.filter((x) => x.id !== id && x._id !== id);
  if (fileDb.teacherTranslations) {
    fileDb.teacherTranslations = fileDb.teacherTranslations.filter((t) => t.teacherId !== id);
  }
  saveFileDb();
  return true;
};

const countTeachers = async () => fileDb.teachers.length;

// ─── STUDENT RESULTS OPERATIONS (MULTILINGUAL) ───────────────────────────────

const listResults = async ({ search = '', branchId = '', examType = '', language = 'en', limit = 50, page = 1 } = {}) => {
  const transKeys = ['description'];
  let items = fileDb.studentResults || [];
  const translations = fileDb.studentResultTranslations || [];

  const localizedList = items.map((r) => {
    const rTrans = translations.filter((tr) => tr.resultId === r.id);
    return resolveEntityLocalization(r, rTrans, language, transKeys);
  });

  let filtered = localizedList;
  if (branchId) filtered = filtered.filter((r) => r.branchId === branchId);
  if (examType) filtered = filtered.filter((r) => r.examType === examType);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (r) => r.studentName?.toLowerCase().includes(s) || r.examType?.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findResultById = async (id, language = 'en') => {
  const transKeys = ['description'];
  const r = fileDb.studentResults.find((x) => x.id === id || x._id === id);
  if (!r) return null;
  const translations = (fileDb.studentResultTranslations || []).filter((tr) => tr.resultId === r.id);
  return formatItem(resolveEntityLocalization(r, translations, language, transKeys));
};

const saveResultTranslations = (resultId, translationsInput = []) => {
  let list = [];
  if (Array.isArray(translationsInput)) {
    list = translationsInput;
  } else if (typeof translationsInput === 'object' && translationsInput !== null) {
    list = Object.entries(translationsInput).map(([code, vals]) => ({
      languageCode: code,
      ...vals,
    }));
  }

  if (!fileDb.studentResultTranslations) fileDb.studentResultTranslations = [];

  for (const item of list) {
    const langCode = (item.languageCode || item.lang || '').toLowerCase().trim();
    if (!langCode) continue;

    const existingIdx = fileDb.studentResultTranslations.findIndex(
      (t) => t.resultId === resultId && (t.languageCode || '').toLowerCase() === langCode
    );

    const record = {
      id: existingIdx !== -1 ? fileDb.studentResultTranslations[existingIdx].id : 'rt_' + resultId + '_' + langCode,
      resultId,
      languageCode: langCode,
      description: item.description || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      fileDb.studentResultTranslations[existingIdx] = record;
    } else {
      record.createdAt = new Date().toISOString();
      fileDb.studentResultTranslations.push(record);
    }
  }
};

const createResult = async (data) => {
  const id = data.id || 'res_' + Date.now();
  const now = new Date();
  const record = {
    id,
    _id: id,
    studentName: data.studentName || '',
    studentPhoto: data.studentPhoto || data.photo || '',
    examType: data.examType || 'IELTS',
    score: String(data.score || ''),
    branchId: data.branchId || null,
    year: data.year ? parseInt(data.year) : 2026,
    description: data.description || '',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.studentResults.push(record);

  if (data.translations) {
    saveResultTranslations(id, data.translations);
  } else {
    saveResultTranslations(id, [
      { languageCode: 'en', description: data.description },
      { languageCode: 'uz', description: data.description },
    ]);
  }

  saveFileDb();
  return formatItem(record);
};

const updateResult = async (id, data) => {
  const now = new Date();
  const idx = fileDb.studentResults.findIndex((x) => x.id === id || x._id === id);
  if (idx === -1) return null;

  fileDb.studentResults[idx] = {
    ...fileDb.studentResults[idx],
    ...data,
    updatedAt: now.toISOString(),
  };

  if (data.translations) {
    saveResultTranslations(id, data.translations);
  }

  saveFileDb();
  return formatItem(fileDb.studentResults[idx]);
};

const deleteResult = async (id) => {
  fileDb.studentResults = fileDb.studentResults.filter((x) => x.id !== id && x._id !== id);
  if (fileDb.studentResultTranslations) {
    fileDb.studentResultTranslations = fileDb.studentResultTranslations.filter((t) => t.resultId !== id);
  }
  saveFileDb();
  return true;
};

const countResults = async () => fileDb.studentResults.length;

// ─── PROJECT / STARTUP OPERATIONS (MULTILINGUAL) ─────────────────────────────

const listProjects = async ({ search = '', category = '', branchId = '', language = 'en', limit = 50, page = 1 } = {}) => {
  const transKeys = ['title', 'description', 'category'];
  let items = fileDb.projects || [];
  const translations = fileDb.projectTranslations || [];

  const localizedList = items.map((p) => {
    const pTrans = translations.filter((tr) => tr.projectId === p.id);
    return resolveEntityLocalization(p, pTrans, language, transKeys);
  });

  let filtered = localizedList;
  if (branchId) filtered = filtered.filter((p) => p.branchId === branchId);
  if (category) filtered = filtered.filter((p) => p.category === category);
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title?.toLowerCase().includes(s) ||
        p.studentName?.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findProjectById = async (id, language = 'en') => {
  const transKeys = ['title', 'description', 'category'];
  const p = fileDb.projects.find((x) => x.id === id || x._id === id);
  if (!p) return null;
  const translations = (fileDb.projectTranslations || []).filter((tr) => tr.projectId === p.id);
  return formatItem(resolveEntityLocalization(p, translations, language, transKeys));
};

const saveProjectTranslations = (projectId, translationsInput = []) => {
  let list = [];
  if (Array.isArray(translationsInput)) {
    list = translationsInput;
  } else if (typeof translationsInput === 'object' && translationsInput !== null) {
    list = Object.entries(translationsInput).map(([code, vals]) => ({
      languageCode: code,
      ...vals,
    }));
  }

  if (!fileDb.projectTranslations) fileDb.projectTranslations = [];

  for (const item of list) {
    const langCode = (item.languageCode || item.lang || '').toLowerCase().trim();
    if (!langCode) continue;

    const existingIdx = fileDb.projectTranslations.findIndex(
      (t) => t.projectId === projectId && (t.languageCode || '').toLowerCase() === langCode
    );

    const record = {
      id: existingIdx !== -1 ? fileDb.projectTranslations[existingIdx].id : 'pt_' + projectId + '_' + langCode,
      projectId,
      languageCode: langCode,
      title: item.title || '',
      description: item.description || '',
      category: item.category || 'AI & Machine Learning',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      fileDb.projectTranslations[existingIdx] = record;
    } else {
      record.createdAt = new Date().toISOString();
      fileDb.projectTranslations.push(record);
    }
  }
};

const createProject = async (data) => {
  const id = data.id || 'prj_' + Date.now();
  const now = new Date();
  const record = {
    id,
    _id: id,
    title: data.title || '',
    description: data.description || '',
    studentName: data.studentName || '',
    studentPhoto: data.studentPhoto || '',
    projectImage: data.projectImage || data.image || '',
    projectUrl: data.projectUrl || '',
    branchId: data.branchId || null,
    category: data.category || 'AI & Machine Learning',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.projects.push(record);

  if (data.translations) {
    saveProjectTranslations(id, data.translations);
  } else {
    saveProjectTranslations(id, [
      { languageCode: 'en', title: data.title, description: data.description, category: data.category },
      { languageCode: 'uz', title: data.title, description: data.description, category: data.category },
    ]);
  }

  saveFileDb();
  return formatItem(record);
};

const updateProject = async (id, data) => {
  const now = new Date();
  const idx = fileDb.projects.findIndex((x) => x.id === id || x._id === id);
  if (idx === -1) return null;

  fileDb.projects[idx] = {
    ...fileDb.projects[idx],
    ...data,
    updatedAt: now.toISOString(),
  };

  if (data.translations) {
    saveProjectTranslations(id, data.translations);
  }

  saveFileDb();
  return formatItem(fileDb.projects[idx]);
};

const deleteProject = async (id) => {
  fileDb.projects = fileDb.projects.filter((x) => x.id !== id && x._id !== id);
  if (fileDb.projectTranslations) {
    fileDb.projectTranslations = fileDb.projectTranslations.filter((t) => t.projectId !== id);
  }
  saveFileDb();
  return true;
};

const countProjects = async () => fileDb.projects.length;

// ─── NEWS OPERATIONS (MULTILINGUAL) ─────────────────────────────────────────

const listNews = async ({ search = '', publishedOnly = true, language = 'en', limit = 50, page = 1 } = {}) => {
  const transKeys = ['title', 'shortDescription', 'content'];
  let items = fileDb.news || [];
  const translations = fileDb.newsTranslations || [];

  if (publishedOnly) items = items.filter((n) => n.published !== false);

  const localizedList = items.map((n) => {
    const nTrans = translations.filter((tr) => tr.newsId === n.id);
    return resolveEntityLocalization(n, nTrans, language, transKeys);
  });

  let filtered = localizedList;
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (n) => n.title?.toLowerCase().includes(s) || n.shortDescription?.toLowerCase().includes(s)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findNewsBySlugOrId = async (param, language = 'en') => {
  const transKeys = ['title', 'shortDescription', 'content'];
  const n = fileDb.news.find((x) => x.id === param || x._id === param || x.slug === param);
  if (!n) return null;
  const translations = (fileDb.newsTranslations || []).filter((tr) => tr.newsId === n.id);
  return formatItem(resolveEntityLocalization(n, translations, language, transKeys));
};

const saveNewsTranslations = (newsId, translationsInput = []) => {
  let list = [];
  if (Array.isArray(translationsInput)) {
    list = translationsInput;
  } else if (typeof translationsInput === 'object' && translationsInput !== null) {
    list = Object.entries(translationsInput).map(([code, vals]) => ({
      languageCode: code,
      ...vals,
    }));
  }

  if (!fileDb.newsTranslations) fileDb.newsTranslations = [];

  for (const item of list) {
    const langCode = (item.languageCode || item.lang || '').toLowerCase().trim();
    if (!langCode) continue;

    const existingIdx = fileDb.newsTranslations.findIndex(
      (t) => t.newsId === newsId && (t.languageCode || '').toLowerCase() === langCode
    );

    const record = {
      id: existingIdx !== -1 ? fileDb.newsTranslations[existingIdx].id : 'nt_' + newsId + '_' + langCode,
      newsId,
      languageCode: langCode,
      title: item.title || '',
      shortDescription: item.shortDescription || item.excerpt || '',
      content: item.content || '',
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      fileDb.newsTranslations[existingIdx] = record;
    } else {
      record.createdAt = new Date().toISOString();
      fileDb.newsTranslations.push(record);
    }
  }
};

const createNews = async (data) => {
  const id = data.id || 'nws_' + Date.now();
  const slug =
    data.slug ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString(36);
  const now = new Date();

  const record = {
    id,
    _id: id,
    title: data.title || '',
    slug,
    shortDescription: data.shortDescription || data.excerpt || '',
    content: data.content || '',
    coverImage: data.coverImage || data.image || '',
    author: data.author || 'NIS AI School',
    published: data.published !== false,
    publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString() : now.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.news.push(record);

  if (data.translations) {
    saveNewsTranslations(id, data.translations);
  } else {
    saveNewsTranslations(id, [
      { languageCode: 'en', title: data.title, shortDescription: data.shortDescription, content: data.content },
      { languageCode: 'uz', title: data.title, shortDescription: data.shortDescription, content: data.content },
    ]);
  }

  saveFileDb();
  return formatItem(record);
};

const updateNews = async (id, data) => {
  const now = new Date();
  const idx = fileDb.news.findIndex((x) => x.id === id || x._id === id);
  if (idx === -1) return null;

  fileDb.news[idx] = {
    ...fileDb.news[idx],
    ...data,
    updatedAt: now.toISOString(),
  };

  if (data.translations) {
    saveNewsTranslations(id, data.translations);
  }

  saveFileDb();
  return formatItem(fileDb.news[idx]);
};

const deleteNews = async (id) => {
  fileDb.news = fileDb.news.filter((x) => x.id !== id && x._id !== id);
  if (fileDb.newsTranslations) {
    fileDb.newsTranslations = fileDb.newsTranslations.filter((t) => t.newsId !== id);
  }
  saveFileDb();
  return true;
};

const countNews = async () => fileDb.news.length;

// ─── PROGRAM OPERATIONS (MULTILINGUAL) ───────────────────────────────────────

const listPrograms = async ({ language = 'en' } = {}) => {
  const transKeys = ['title', 'description', 'badge', 'requirements'];
  let items = fileDb.programs || [];
  const translations = fileDb.programTranslations || [];

  return items.map((p) => {
    const pTrans = translations.filter((tr) => tr.programId === p.id);
    return formatItem(resolveEntityLocalization(p, pTrans, language, transKeys));
  });
};

const findProgramById = async (id, language = 'en') => {
  const transKeys = ['title', 'description', 'badge', 'requirements'];
  const p = fileDb.programs.find((x) => x.id === id || x._id === id || x.code === id);
  if (!p) return null;
  const translations = (fileDb.programTranslations || []).filter((tr) => tr.programId === p.id);
  return formatItem(resolveEntityLocalization(p, translations, language, transKeys));
};

// ─── APPLICATION OPERATIONS ──────────────────────────────────────────────────

const listApplications = async ({ search = '', status = '', userId = '', branchId = '', limit = 50, page = 1 } = {}) => {
  let items = fileDb.applications;
  if (status) items = items.filter((a) => a.status === status);
  if (userId) items = items.filter((a) => a.userId === userId);
  if (branchId) items = items.filter((a) => a.branchId === branchId);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(
      (a) =>
        a.fullName?.toLowerCase().includes(s) ||
        a.email?.toLowerCase().includes(s) ||
        a.phone?.toLowerCase().includes(s)
    );
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findApplicationById = async (id) => {
  const a = fileDb.applications.find((x) => x.id === id || x._id === id);
  return formatItem(a);
};

const createApplication = async (data) => {
  const id = data.id || 'app_' + Date.now();
  const now = new Date();
  const record = {
    id,
    _id: id,
    userId: data.userId || null,
    fullName: data.fullName || '',
    phone: data.phone || '',
    email: data.email || '',
    branchId: data.branchId || null,
    selectedProgram: data.selectedProgram || data.program || 'AI & Data Science',
    message: data.message || '',
    status: data.status || 'NEW',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.applications.push(record);
  saveFileDb();
  return record;
};

const updateApplicationStatus = async (id, status) => {
  const now = new Date();
  const idx = fileDb.applications.findIndex((x) => x.id === id || x._id === id);
  if (idx !== -1) {
    fileDb.applications[idx].status = status;
    fileDb.applications[idx].updatedAt = now.toISOString();
    saveFileDb();
    return fileDb.applications[idx];
  }
  return null;
};

const deleteApplication = async (id) => {
  fileDb.applications = fileDb.applications.filter((x) => x.id !== id && x._id !== id);
  saveFileDb();
  return true;
};

const countApplications = async (filter = {}) => {
  if (filter.status) {
    return fileDb.applications.filter((a) => a.status === filter.status).length;
  }
  return fileDb.applications.length;
};

// ─── EVENT OPERATIONS ────────────────────────────────────────────────────────

const listEvents = async ({ search = '', limit = 50, page = 1 } = {}) => {
  let items = fileDb.events;
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(
      (e) => e.title?.toLowerCase().includes(s) || e.location?.toLowerCase().includes(s)
    );
  }
  const total = items.length;
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit).map(formatItem);

  return {
    data: paged,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
  };
};

const findEventById = async (id) => {
  const e = fileDb.events.find((x) => x.id === id || x._id === id);
  return formatItem(e);
};

const createEvent = async (data) => {
  const id = data.id || 'ev_' + Date.now();
  const now = new Date();
  const record = {
    id,
    _id: id,
    title: data.title || '',
    description: data.description || '',
    date: data.date ? new Date(data.date).toISOString() : now.toISOString(),
    location: data.location || '',
    image: data.image || '',
    branchId: data.branchId || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  fileDb.events.push(record);
  saveFileDb();
  return record;
};

const updateEvent = async (id, data) => {
  const now = new Date();
  const idx = fileDb.events.findIndex((x) => x.id === id || x._id === id);
  if (idx !== -1) {
    fileDb.events[idx] = {
      ...fileDb.events[idx],
      ...data,
      updatedAt: now.toISOString(),
    };
    saveFileDb();
    return fileDb.events[idx];
  }
  return null;
};

const deleteEvent = async (id) => {
  fileDb.events = fileDb.events.filter((x) => x.id !== id && x._id !== id);
  saveFileDb();
  return true;
};

const countEvents = async () => fileDb.events.length;

module.exports = {
  prisma,
  initDB,
  sanitizeUser,
  resolveEntityLocalization,
  // Languages (Dynamic languages management)
  listLanguages,
  findLanguageByCode,
  createLanguage,
  updateLanguage,
  toggleLanguage,
  deleteLanguage,
  DEFAULT_LANGUAGES,
  // Users
  findUserById,
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  countUsers,
  // Branches
  listBranches,
  findBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
  countBranches,
  // Teachers
  listTeachers,
  findTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  countTeachers,
  // Student Results
  listResults,
  findResultById,
  createResult,
  updateResult,
  deleteResult,
  countResults,
  // Projects
  listProjects,
  findProjectById,
  createProject,
  updateProject,
  deleteProject,
  countProjects,
  // News
  listNews,
  findNewsBySlugOrId,
  createNews,
  updateNews,
  deleteNews,
  countNews,
  // Programs
  listPrograms,
  findProgramById,
  // Applications
  listApplications,
  findApplicationById,
  createApplication,
  updateApplicationStatus,
  deleteApplication,
  countApplications,
  // Events
  listEvents,
  findEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  countEvents,
};
