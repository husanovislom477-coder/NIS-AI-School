const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Branch = require('../models/Branch');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const News = require('../models/News');
const Event = require('../models/Event');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for seeding...');
};

const seedData = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    News.deleteMany({}),
    Event.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // 1. Create Admin User
  const admin = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@nis-ai.edu.uz',
    password: process.env.ADMIN_PASSWORD || 'NisAdmin2026!',
    role: 'admin',
    isActive: true,
  });
  console.log(`👤 Admin created: ${admin.email}`);

  // 2. Create Demo User
  await User.create({
    firstName: 'Islomjon',
    lastName: 'Alimov',
    email: 'islomjon@gmail.com',
    password: 'islomjon123',
    role: 'user',
    isActive: true,
  });
  console.log('👤 Demo user created: islomjon@gmail.com / islomjon123');

  // 3. Create Branches
  const branches = await Branch.insertMany([
    {
      name: 'NIS AI School — Toshkent',
      nameRu: 'NIS AI Школа — Ташкент',
      nameEn: 'NIS AI School — Tashkent',
      shortName: 'NIS Toshkent',
      location: 'Toshkent',
      address: "Toshkent sh., Yunusobod tumani, Amir Temur ko'chasi, 108-uy",
      phone: '+998 71 200 00 55',
      email: 'tashkent@nis-ai.edu.uz',
      description: "Toshkent shahridagi bosh kampus. 500 dan ortiq o'quvchi va 40 ta tajribali o'qituvchi.",
      descriptionRu: 'Главный кампус в Ташкенте. Более 500 учеников и 40 опытных преподавателей.',
      descriptionEn: 'Main campus in Tashkent. Over 500 students and 40 experienced teachers.',
      workingHours: '09:00 - 18:00 (Du-Sha)',
      established: 2020,
      studentCount: 520,
      teacherCount: 40,
      images: [
        'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800&auto=format&fit=crop&q=80',
      ],
      coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
      featured: true,
      order: 1,
    },
    {
      name: 'NIS AI School — Namangan',
      nameRu: 'NIS AI Школа — Наманган',
      nameEn: 'NIS AI School — Namangan',
      shortName: 'NIS Namangan',
      location: 'Namangan',
      address: "Namangan sh., Uychi ko'chasi, 45-uy",
      phone: '+998 69 220 00 55',
      email: 'namangan@nis-ai.edu.uz',
      description: "Namangan viloyatidagi filial. 250 dan ortiq o'quvchi bilan faoliyat yuritadi.",
      descriptionRu: 'Филиал в Наманганской области. Более 250 учеников.',
      descriptionEn: 'Branch in Namangan region. Over 250 students.',
      workingHours: '09:00 - 18:00 (Du-Sha)',
      established: 2022,
      studentCount: 260,
      teacherCount: 20,
      images: [
        'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
      ],
      coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      featured: false,
      order: 2,
    },
    {
      name: 'NIS AI School — Samarqand',
      nameRu: 'NIS AI Школа — Самарканд',
      nameEn: 'NIS AI School — Samarkand',
      shortName: 'NIS Samarqand',
      location: 'Samarqand',
      address: "Samarqand sh., Registon ko'chasi, 12-uy",
      phone: '+998 66 230 00 55',
      email: 'samarkand@nis-ai.edu.uz',
      description: "Samarqand shahrida joylashgan zamonaviy filial. 300 o'quvchi tahsil oladi.",
      workingHours: '09:00 - 18:00 (Du-Sha)',
      established: 2023,
      studentCount: 310,
      teacherCount: 24,
      images: [
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&auto=format&fit=crop&q=80',
      ],
      coverImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      order: 3,
    },
  ]);
  console.log(`🏫 ${branches.length} branches created`);

  // 4. Create Teachers
  const teachers = await Teacher.insertMany([
    {
      firstName: 'Azamat',
      lastName: 'Tursunov',
      patronymic: 'Bahodirovich',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      subject: 'Deep Learning va LLM',
      subjectEn: 'Deep Learning & LLMs',
      subjectRu: 'Глубокое Обучение',
      branchId: branches[0]._id,
      age: 34,
      university: 'Massachusetts Institute of Technology (MIT)',
      education: 'PhD',
      experience: 10,
      biography: "MIT da PhD darajasini olgan, DeepMind va Google Brain da ilmiy tadqiqotchi sifatida ishlagan. Transformer arxitekturasi va LLM sohasida 20 dan ortiq maqola muallifi.",
      biographyEn: "PhD from MIT, former research scientist at DeepMind and Google Brain. Author of 20+ papers on transformer architectures and LLMs.",
      certificates: [{ type: 'IELTS', score: '8.5', year: 2018 }, { type: 'Google ML Engineer', score: 'Professional', year: 2021 }],
      achievements: ["IOI 2014 Kumush medal", "ICPC 2016 Dunyo finalisti", "Google Research Award 2022"],
      featured: true, order: 1,
    },
    {
      firstName: 'Elena',
      lastName: 'Rostova',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      subject: 'Robototexnika va ROS2',
      subjectEn: 'Robotics & ROS2',
      subjectRu: 'Робототехника и ROS2',
      branchId: branches[0]._id,
      age: 31,
      university: 'ETH Zürich',
      education: 'PhD',
      experience: 8,
      biography: "ETH Zürich robotika laboratoriyasida PhD qilgan. SLAM va avtonom dron boshqaruvida mutaxassis.",
      biographyEn: "PhD from ETH Zürich Robotics Lab. Expert in SLAM and autonomous drone control.",
      achievements: ["IEEE Senior Member", "Best Paper — ICRA 2023"],
      featured: true, order: 2,
    },
    {
      firstName: 'Sardorbek',
      lastName: 'Mirzayev',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      subject: 'Olimpiada Dasturlash (IOI/ICPC)',
      subjectEn: 'Competitive Programming',
      subjectRu: 'Олимпиадное Программирование',
      branchId: branches[0]._id,
      age: 28,
      university: 'National University of Uzbekistan',
      education: 'Master',
      experience: 6,
      biography: "IOI oltin medali sovrindori. O'z talabalaridan 3 ta IOI medalist tayyorlagan.",
      biographyEn: "IOI gold medalist. Has coached 3 IOI medalists among his students.",
      achievements: ["IOI 2018 Gold Medal", "ICPC 2019 World Finals Silver", "ACM Senior Member"],
      featured: true, order: 3,
    },
    {
      firstName: 'Sofia',
      lastName: 'Chen',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
      subject: 'Kompyuter Ko\'rishi va CV',
      subjectEn: 'Computer Vision & Spatial AI',
      subjectRu: 'Компьютерное Зрение',
      branchId: branches[0]._id,
      age: 32,
      university: 'Stanford University',
      education: 'PhD',
      experience: 9,
      biography: "Stanford AI Lab postdoc. 3D Gaussian Splatting va NeRF sohasida peshqadam tadqiqotchi.",
      biographyEn: "Stanford AI Lab postdoc researcher. Pioneer in 3D Gaussian Splatting and NeRF.",
      achievements: ["CVPR Best Paper 2023", "ICCV Outstanding Reviewer", "NSF Fellowship"],
      featured: true, order: 4,
    },
    {
      firstName: 'Kamol',
      lastName: 'Nazarov',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
      subject: 'Data Science va Big Data',
      subjectEn: 'Data Science & Big Data',
      subjectRu: 'Наука о данных',
      branchId: branches[1]._id,
      age: 35,
      university: 'Columbia University',
      education: 'Master',
      experience: 11,
      biography: "Amazon va Microsoft da Senior Data Scientist sifatida ishlagan.",
      achievements: ["Kaggle Grandmaster", "AWS Certified ML Specialist"],
      featured: false, order: 5,
    },
  ]);
  console.log(`👨‍🏫 ${teachers.length} teachers created`);

  // 5. Create Students
  const students = await Student.insertMany([
    {
      firstName: 'Islomjon',
      lastName: 'Alimov',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      branchId: branches[0]._id,
      grade: '11-A',
      graduationYear: 2026,
      results: [
        { type: 'IELTS', score: '8.0', year: 2025 },
        { type: 'SAT', score: '1540', year: 2025 },
      ],
      awards: [
        { title: "IOI 2025 Bronza Medal", year: 2025, level: 'International' },
        { title: "O'zbekiston Informatika Olimpiadasi — 1-o'rin", year: 2025, level: 'National' },
      ],
      projects: [
        { title: 'AeroSwarm-V: Autonomous Drone Swarms', description: 'GPS-siz 16 dron uchun decentralized consensus protocol.', year: 2025 },
      ],
      startup: 'TechVision UZ — Computer Vision startapi',
      biography: "Toshkent shahridan chiqqan 17 yoshli AI mutaxassisi. MIT CS dasturiga qabul qilingan.",
      biographyEn: "17-year-old AI specialist from Tashkent. Admitted to MIT CS program.",
      achievements: ["IOI Bronze 2025", "Google Generation Scholar 2025", "NIS AI Valedictorian 2026"],
      university: 'MIT (qabul qilingan)',
      featured: true, order: 1,
    },
    {
      firstName: 'Kamila',
      lastName: 'Karimova',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      branchId: branches[0]._id,
      grade: '10-B',
      results: [
        { type: 'IELTS', score: '8.5', year: 2025 },
      ],
      awards: [
        { title: "IAIO 2025 Oltin Medal", year: 2025, level: 'International' },
        { title: "National Girls in AI Competition — 1st Place", year: 2025, level: 'National' },
      ],
      projects: [
        { title: 'NeuroScan Retina AI', description: 'Mobil kamera orqali diabetik retinopatiyani aniqlash.', year: 2025 },
      ],
      biography: "16 yoshli AI tadqiqotchi. Nature Digital Medicine jurnalida maqolasi chop etilgan.",
      university: 'Stanford (Early Decision qabul)',
      featured: true, order: 2,
    },
    {
      firstName: 'Alisher',
      lastName: 'Vohidov',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      branchId: branches[0]._id,
      grade: '11-B',
      results: [
        { type: 'IELTS', score: '7.5', year: 2025 },
        { type: 'SAT', score: '1490', year: 2025 },
      ],
      awards: [
        { title: "Copernicus Earth AI Prize Finalist", year: 2025, level: 'International' },
      ],
      projects: [
        { title: 'Aral-Vision Satellite Sentinel', description: "Sentinel-2 multispektral ma'lumotlardan tuproq sho'rlanishini bashorat qilish.", year: 2025 },
      ],
      university: "ETH Zürich (qabul qilingan)",
      featured: true, order: 3,
    },
    {
      firstName: 'Dilnoza',
      lastName: 'Yusupova',
      photo: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=300&auto=format&fit=crop&q=80',
      branchId: branches[1]._id,
      grade: '11-A',
      results: [{ type: 'IELTS', score: '7.0', year: 2025 }],
      awards: [{ title: "Regional Math Olympiad — 1-o'rin", year: 2025, level: 'Regional' }],
      university: "KAIST (qabul qilingan)",
      featured: false, order: 4,
    },
  ]);
  console.log(`🎓 ${students.length} students created`);

  // 6. Create News
  const adminId = admin._id;
  const newsItems = await News.insertMany([
    {
      title: "NIS AI School'da Yangi GPU Superkompyuter Klasteri Ochildi",
      titleRu: "В NIS AI School открылся новый кластер GPU суперкомпьютеров",
      titleEn: "NIS AI School Opens New GPU Supercomputer Cluster",
      shortDescription: "64 ta NVIDIA H100 GPU dan iborat 10 PFLOPS quvvatli yangi superkompyuter klasteri ochildi.",
      content: `NIS AI School ning Toshkent kampusida 64 ta NVIDIA H100 GPU'dan iborat, 10 PFLOPS hisoblash quvvatiga ega yangi superkompyuter klasteri rasman ochildi.

Ushbu infratuzilma O'zbekistondagi eng kuchli ta'lim AI klasteri hisoblanadi. Talabalar endi o'zlarining katta til modellarini (LLM) va kompyuter ko'rish modellarini to'g'ridan-to'g'ri ushbu klasterda o'qitishlari mumkin.

Klaster 400 Gb/s InfiniBand tarmoq orqali ulangan bo'lib, NVLink 900 GB/s o'tkazuvchanlikni ta'minlaydi.`,
      category: 'academic',
      author: adminId,
      authorName: 'NIS AI School',
      published: true,
      publishedAt: new Date('2026-09-15'),
      coverImage: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&auto=format&fit=crop&q=80',
      featured: true,
    },
    {
      title: "Islomjon Alimov IOI 2025 Bronza Medalini Qo'lga Kiritdi",
      titleEn: "Islomjon Alimov Wins IOI 2025 Bronze Medal",
      shortDescription: "NIS AI School talabasi Islomjon Alimov Xalqaro Informatika Olimpiadasida bronza medal qozondi.",
      content: "NIS AI School 11-sinf talabasi Islomjon Alimov Qozog'istonda bo'lib o'tgan IOI 2025 da 600 balldan 487 ball to'plab bronza medalini qo'lga kiritdi.",
      category: 'olympiad',
      author: adminId,
      authorName: 'NIS AI School',
      published: true,
      publishedAt: new Date('2026-09-10'),
      coverImage: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: "NIS AI School 2026 Qabul Natijalar Rasman E'lon Qilindi",
      titleEn: "NIS AI School 2026 Admission Results Officially Announced",
      shortDescription: "2026-2027 o'quv yili uchun qabul natijalari va grant sovrindorlari ma'lum qilindi.",
      content: "Ushbu yil 2400 dan ortiq ariza bo'lib, 240 ta o'quvchi 100% prezident granti bilan qabul qilindi. Barcha qabul qilingan o'quvchilar tajribali yetakchi tadqiqotchilar tomonidan individual yo'naltiriladi.",
      category: 'announcement',
      author: adminId,
      authorName: 'NIS AI School',
      published: true,
      publishedAt: new Date('2026-09-01'),
      coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: "Kamila Karimova IAIO 2025 Oltin Medalini Qo'lga Kiritdi",
      titleEn: "Kamila Karimova Wins IAIO 2025 Gold Medal",
      shortDescription: "16 yoshli o'quvchimiz Xalqaro Suniy Intellekt Olimpiadasida oltin medal qozondi.",
      content: "Kamila Karimova Seulda bo'lib o'tgan IAIO 2025 da 1-o'rinni egalladi. U tibbiy tasvirlarni tahlil qiluvchi modelni yaratdi.",
      category: 'olympiad',
      author: adminId,
      authorName: 'NIS AI School',
      published: true,
      publishedAt: new Date('2026-08-20'),
      coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: "NIS AI School Va MIT O'rtasida Hamkorlik Shartnomasi Imzolandi",
      titleEn: "NIS AI School Signs Collaboration Agreement with MIT",
      shortDescription: "MIT va NIS AI School o'rtasidagi strategik hamkorlik o'qituvchilar almashinuvi va qo'shma tadqiqotlarni o'z ichiga oladi.",
      content: "Ushbu shartnoma asosida MIT professori har yili 2 oy NIS AI School'da dars beradi. NIS talabalari MIT'ning yozgi AI dasturiga imtiyozli qabul qilinadi.",
      category: 'general',
      author: adminId,
      authorName: 'NIS AI School',
      published: true,
      publishedAt: new Date('2026-07-15'),
      coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
    },
    {
      title: "Yangi O'quv Yili Uchun Deep Learning Dasturi Yangilandi",
      titleEn: "Deep Learning Curriculum Updated for New Academic Year",
      shortDescription: "2026-2027 o'quv yilidan boshlab GPT-4 arxitekturasi va multimodal AI modullari kiritildi.",
      content: "Yangi o'quv yilidan GPT-4 va Claude arxitekturalari, multimodal AI (matn, tasvir, video) va agentik AI modullari qo'shildi.",
      category: 'academic',
      author: adminId,
      authorName: 'NIS AI School',
      published: false, // Draft
      coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop&q=80',
    },
  ]);
  console.log(`📰 ${newsItems.length} news items created (5 published, 1 draft)`);

  // 7. Create Events
  await Event.insertMany([
    {
      title: "NIS AI Hackathon 2026 — Q4",
      titleEn: "NIS AI Hackathon 2026 — Q4",
      category: 'hackathon',
      coverImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      date: new Date('2026-11-15'),
      time: '09:00',
      location: 'NIS AI School Toshkent Bosh Kampus',
      branchId: branches[0]._id,
      shortDescription: "24 soatlik katta hackathon. 50+ komandalarga ruxsat beriladi.",
      shortDescriptionEn: "24-hour major hackathon open to 50+ teams.",
      published: true,
      featured: true,
    },
    {
      title: "IOI 2027 Tayyorlov Bo'limi Boshlandi",
      titleEn: "IOI 2027 Preparation Course Launched",
      category: 'olympiad',
      coverImage: 'https://images.unsplash.com/photo-1459664018906-085c36f472af?w=800&auto=format&fit=crop&q=80',
      date: new Date('2026-10-01'),
      time: '14:00',
      location: 'Online (NIS AI Digital Campus)',
      shortDescription: "IOI 2027 uchun intensiv tayyorlov kursi — Sardorbek Mirzayev rahbarligida.",
      published: true,
    },
    {
      title: "NIS AI Demo Day — Talabalar Loyihalari Taqdimoti",
      titleEn: "NIS AI Demo Day — Student Projects Showcase",
      category: 'conference',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      date: new Date('2026-12-20'),
      time: '10:00',
      location: 'NIS AI School Asosiy Auditoriyasi, Toshkent',
      branchId: branches[0]._id,
      shortDescription: "Yil yakunida barcha talabalar o'zlarining loyihalarini investorlar va universitetlar oldida taqdim etishadi.",
      published: true,
      featured: true,
    },
  ]);
  console.log('🗓️  3 events created');

  console.log('\n✅ Seeding completed successfully!');
  console.log('═══════════════════════════════════════');
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@nis-ai.edu.uz'}`);
  console.log(`Password: ${process.env.ADMIN_PASSWORD || 'NisAdmin2026!'}`);
  console.log('Demo User: islomjon@gmail.com / islomjon123');
  console.log('═══════════════════════════════════════');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
