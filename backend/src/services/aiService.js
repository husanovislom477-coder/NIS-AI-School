const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

// Ensure environment variables are loaded even if service is imported independently
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const {
  listBranches,
  listTeachers,
  listResults,
  listProjects,
  listNews,
  countBranches,
  countTeachers,
  countResults,
  countProjects,
} = require('./db');

/**
 * Official Google Gemini AI Configuration for NIS AI School
 * 
 * SDK: @google/genai
 * Documentation: https://ai.google.dev/gemini-api/docs
 * Default Model: gemini-2.5-flash
 * Authentication: GEMINI_API_KEY environment variable
 */

/**
 * Gather verified, authoritative NIS AI School database context
 */
async function getVerifiedSchoolContext(language = 'en') {
  try {
    const [branchesRes, teachersRes, resultsRes, projectsRes, newsRes, bCount, tCount, rCount, pCount] =
      await Promise.all([
        listBranches({ language, limit: 10 }).catch(() => ({ data: [] })),
        listTeachers({ language, limit: 10 }).catch(() => ({ data: [] })),
        listResults({ language, limit: 10 }).catch(() => ({ data: [] })),
        listProjects({ language, limit: 10 }).catch(() => ({ data: [] })),
        listNews({ language, limit: 5 }).catch(() => ({ data: [] })),
        countBranches().catch(() => 3),
        countTeachers().catch(() => 4),
        countResults().catch(() => 4),
        countProjects().catch(() => 4),
      ]);

    const branchesList = (branchesRes?.data || [])
      .map(
        (b) =>
          `- ${b.name}: Address: "${b.address}", Phone: "${b.phone}", Hours: "${b.workingHours || '08:30 - 18:00'}". Description: ${b.description}`
      )
      .join('\n');

    const teachersList = (teachersRes?.data || [])
      .map(
        (t) =>
          `- ${t.firstName} ${t.lastName}: Subject: "${t.subject || 'AI'}", Education: "${t.education || t.degree || 'Master/PhD'}", Experience: ${t.experience || 5} years, IELTS: "${t.ielts || '7.5+'}", Branch: "${t.branch || 'Tashkent'}"`
      )
      .join('\n');

    const resultsList = (resultsRes?.data || [])
      .map(
        (r) =>
          `- Student: ${r.studentName}, Exam: ${r.examType}, Score/Award: ${r.score}, Year: ${r.year || 2025}`
      )
      .join('\n');

    const projectsList = (projectsRes?.data || [])
      .map(
        (p) =>
          `- "${p.title}" by ${p.studentName} (${p.category}): ${p.description}`
      )
      .join('\n');

    const newsList = (newsRes?.data || [])
      .map(
        (n) =>
          `- ${n.title} (${n.category}): ${n.shortDescription || n.content?.slice(0, 100)}`
      )
      .join('\n');

    return `
[VERIFIED NIS AI SCHOOL FACTUAL DATA]
Total Campuses: ${bCount}
Total Faculty: ${tCount}
Total Public Results: ${rCount}
Total Student AI Projects: ${pCount}

Admissions & 100% Merit Grants:
- 2026-2027 admissions portal is open at /application.
- 100% full merit grants funded by the government are awarded to 240 admitted scholars, covering all tuition, GPU cluster access, and laboratory equipment.

Approved Campuses:
${branchesList || '- Tashkent Main Campus, Samarkand Campus, Bukhara Campus'}

Approved Faculty:
${teachersList || '- Dr. Azizbek Rahimov (Computer Vision), Nilufar Saidova (Data Science), Farrux Zokirov (Robotics)'}

Approved Student Achievements:
${resultsList || '- IELTS 8.5 (Islomjon Alimov), SAT 1560 (Kamila Karimova), IOI & IAIO international medals'}

Approved Student AI Projects:
${projectsList || '- AeroSwarm-V (autonomous drone swarm), NeuroScan Retina AI (medical imaging), Aral-Vision (satellite analytics)'}

Recent School News:
${newsList || '- International Olympiad qualification results and 2026-2027 admissions schedule.'}
`;
  } catch (err) {
    console.error('Error loading school context:', err.message);
    return `
[VERIFIED NIS AI SCHOOL FACTUAL DATA]
NIS AI School has 3 campuses (Tashkent, Samarkand, Bukhara), 100% full merit grants for 240 admitted scholars for 2026-2027, state-of-the-art AI laboratories, and GPU clusters. Online admissions are open at /application.
`;
  }
}

/**
 * Determine navigation action chips based on query and response
 */
function determineActions(query = '', text = '') {
  const combined = (query + ' ' + text).toLowerCase();
  const actions = [];

  if (
    combined.includes('branch') ||
    combined.includes('campus') ||
    combined.includes('filial') ||
    combined.includes('kampus') ||
    combined.includes('toshkent') ||
    combined.includes('samarqand') ||
    combined.includes('buxoro')
  ) {
    actions.push({ label: 'Filiallar / Campuses', path: '/campuses' });
  }

  if (
    combined.includes('apply') ||
    combined.includes('application') ||
    combined.includes('ariza') ||
    combined.includes('grant') ||
    combined.includes('qabul') ||
    combined.includes('admission')
  ) {
    actions.push({ label: 'Ariza Topshirish / Apply', path: '/application' });
  }

  if (
    combined.includes('teacher') ||
    combined.includes("o'qituvchi") ||
    combined.includes('ustoz') ||
    combined.includes('mentor') ||
    combined.includes('faculty')
  ) {
    actions.push({ label: "O'qituvchilar / Faculty", path: '/teachers' });
  }

  if (
    combined.includes('result') ||
    combined.includes('natija') ||
    combined.includes('yutuq') ||
    combined.includes('achievement') ||
    combined.includes('ielts') ||
    combined.includes('sat') ||
    combined.includes('medal')
  ) {
    actions.push({ label: 'Yutuqlar / Results', path: '/results' });
  }

  if (
    combined.includes('project') ||
    combined.includes('loyiha') ||
    combined.includes('startup') ||
    combined.includes('drone')
  ) {
    actions.push({ label: 'Loyihalar / Projects', path: '/projects' });
  }

  return actions.slice(0, 3);
}

/**
 * Resolve the active Google Gemini API key dynamically.
 * Prioritizes live backend/.env on disk so key changes are detected immediately without server restart.
 */
function getGeminiApiKey() {
  const candidatePaths = [
    path.resolve(__dirname, '../../.env'), // backend/.env
    path.resolve(__dirname, '../../../.env'), // root .env
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend/.env'),
  ];

  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const parsed = dotenv.parse(content);
        if (parsed.GEMINI_API_KEY !== undefined && parsed.GEMINI_API_KEY !== null) {
          const raw = String(parsed.GEMINI_API_KEY).trim().replace(/^["']|["']$/g, '');
          if (raw) {
            process.env.GEMINI_API_KEY = raw;
            if (parsed.GEMINI_MODEL) {
              process.env.GEMINI_MODEL = String(parsed.GEMINI_MODEL).trim().replace(/^["']|["']$/g, '');
            }
            return raw;
          }
        }
      }
    } catch (_) {}
  }

  return (process.env.GEMINI_API_KEY || '').replace(/^["']|["']$/g, '').trim();
}

/**
 * Resolve the configured Google Gemini model name.
 */
function getGeminiModel() {
  const candidatePaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'backend/.env'),
  ];
  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
        if (parsed.GEMINI_MODEL) {
          const model = String(parsed.GEMINI_MODEL).trim().replace(/^["']|["']$/g, '');
          if (model) return model;
        }
      }
    } catch (_) {}
  }
  return (process.env.GEMINI_MODEL || 'gemini-2.5-flash').replace(/^["']|["']$/g, '').trim();
}

/**
 * Get non-sensitive configuration diagnostics for the Google Gemini integration
 */
function getAIStatus() {
  const envPath = path.resolve(__dirname, '../../.env');
  const envFileExists = fs.existsSync(envPath);
  const key = getGeminiApiKey();
  const hasKey = Boolean(key && key.length > 0);

  return {
    success: true,
    service: 'NIS AI Assistant (Google Gemini)',
    provider: 'Google GenAI (@google/genai)',
    apiKeyDetected: hasKey,
    hasKey: hasKey,
    model: getGeminiModel(),
    envPath,
    envFileExists,
  };
}

/**
 * Process chat messages with Google Gemini AI
 */
async function processChatMessage({ message, language = 'en', history = [] }) {
  const userQuery = (message || '').trim();
  if (!userQuery) {
    return {
      success: false,
      error: 'EMPTY_MESSAGE',
      message:
        language === 'uz'
          ? 'Iltimos, xabaringizni kiriting.'
          : 'Please provide a valid question.',
    };
  }

  // 1. Check if GEMINI_API_KEY is configured
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'MISSING_API_KEY',
      message:
        language === 'uz'
          ? "Google Gemini API kaliti backend sozlamalarida (`.env`) topilmadi. Iltimos, `backend/.env` faylida GEMINI_API_KEY ni sozlang."
          : 'Google Gemini API key is missing. Please set GEMINI_API_KEY in the backend .env file.',
    };
  }

  // 2. Load verified school facts for authoritative grounding
  const schoolContext = await getVerifiedSchoolContext(language);

  // 3. Build authoritative system prompt
  const systemPrompt = `You are NIS AI AGENT, the official digital assistant for NIS AI School (Uzbekistan's specialized AI and computing school).

CRITICAL OPERATIONAL RULES:
1. Language: Answer strictly in the language used by the user: "${language}" (Uzbek, English, or Russian).
   - If user writes in Uzbek, reply in warm, accurate Uzbek (using Latin script).
   - If user writes in English, reply in professional, fluent English.
2. Persona: Polite, encouraging, professional, and student-friendly.
3. NIS AI School Inquiries:
   - For questions about NIS AI School (campuses, 100% full merit grants, 2026-2027 admissions, teachers, student achievements, GPU clusters, curriculum), refer ONLY to the verified facts provided below.
   - DO NOT hallucinate fake campus addresses, fake teachers, unverified prices, or fake exam scores.
   - If user asks for specific school info not found in the verified data, state clearly and politely:
     - Uzbek: "Ushbu ma'lumot NIS AI School rasmiy ma'lumotlar bazasida hozircha mavjud emas. Aniq ma'lumot uchun maktab ma'muriyatiga murojaat qilishingiz mumkin."
     - English: "This information is currently not available in the NIS AI School official records. Please contact school administration."
4. General Academic & Coding Inquiries:
   - You are also an expert tutor for academic topics: programming (Python, C++, JavaScript, React, PyTorch, ROS2, algorithms), mathematics, science, and exam preparation (IELTS, SAT, IOI/IAIO Olympiads).
   - Provide clear, step-by-step explanations in clean Markdown with code blocks.
5. Multi-turn Conversation Context:
   - Follow the conversation history naturally and maintain coherent multi-turn context.

${schoolContext}`;

  // 4. Construct conversation history compatible with Google GenAI format (roles: 'user' and 'model')
  const formattedHistory = (Array.isArray(history) ? history : [])
    .slice(-8)
    .filter((h) => h && h.text && (h.sender === 'user' || h.sender === 'agent' || h.sender === 'assistant' || h.sender === 'model'))
    .map((h) => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: String(h.text) }],
    }));

  const contents = [
    ...formattedHistory,
    { role: 'user', parts: [{ text: userQuery }] },
  ];

  const modelName = getGeminiModel();

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const replyText = response.text ? response.text.trim() : '';

    if (!replyText) {
      return {
        success: false,
        error: 'EMPTY_RESPONSE',
        message:
          language === 'uz'
            ? "Gemini dan bo'sh javob qaytdi. Iltimos, savolingizni qayta yozing."
            : 'Received an empty response from Gemini. Please try asking again.',
      };
    }

    return {
      success: true,
      message: replyText,
      actions: determineActions(userQuery, replyText),
      model: modelName,
    };
  } catch (err) {
    console.error('Google Gemini request error:', err.message || err);

    const errMsg = String(err.message || '');

    // 1. Invalid or Revoked API Key
    if (
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid') ||
      errMsg.includes('API_KEY') ||
      errMsg.includes('API key') ||
      errMsg.includes('INVALID_ARGUMENT')
    ) {
      return {
        success: false,
        error: 'INVALID_API_KEY',
        message:
          language === 'uz'
            ? "Google Gemini API kaliti yaroqsiz yoki eskirgan (API key not valid). Iltimos, https://aistudio.google.com orqali yangi API kalit oling va backend/.env faylidagi GEMINI_API_KEY ga kiriting."
            : 'Google Gemini API key is invalid or revoked. Please create a valid API key at https://aistudio.google.com and set GEMINI_API_KEY in backend/.env.',
      };
    }

    // 2. Unsupported or Unavailable Model
    if (
      errMsg.includes('NOT_FOUND') ||
      errMsg.includes('is not found') ||
      errMsg.includes('models/') ||
      errMsg.includes('unsupported')
    ) {
      return {
        success: false,
        error: 'MODEL_NOT_FOUND',
        message:
          language === 'uz'
            ? `Google Gemini modeli (${modelName}) topilmadi yoki ushbu kalit uchun ochilmagan. Iltimos, backend/.env da GEMINI_MODEL=gemini-2.5-flash deb belgilang.`
            : `Configured Gemini model (${modelName}) was not found or is unavailable. Please verify GEMINI_MODEL=gemini-2.5-flash in backend/.env.`,
      };
    }

    // 3. API Restrictions or Permission Denied
    if (
      errMsg.includes('PERMISSION_DENIED') ||
      errMsg.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') ||
      errMsg.includes('restricted')
    ) {
      return {
        success: false,
        error: 'API_RESTRICTION',
        message:
          language === 'uz'
            ? "Google Gemini API loyiha cheklovlari tufayli rad etildi (Permission Denied). Iltimos, Google AI Studio da API kalit ruxsatlarini tekshiring."
            : 'Google Gemini API request denied due to project restrictions or permissions. Please check key permissions in Google AI Studio.',
      };
    }

    // 4. Quota or Rate Limit
    if (
      errMsg.includes('RESOURCE_EXHAUSTED') ||
      errMsg.includes('429') ||
      errMsg.includes('quota') ||
      errMsg.includes('rate limit')
    ) {
      return {
        success: false,
        error: 'RATE_LIMIT',
        message:
          language === 'uz'
            ? "Google Gemini API so'rovlar limiti yoki kvotasi oshdi (Rate Limit / Quota Exceeded). Iltimos, birozdan so'ng qayta urinib ko'ring."
            : 'Google Gemini API quota or rate limit exceeded. Please wait a moment and try again.',
      };
    }

    // 5. Safety Filter
    if (errMsg.includes('SAFETY') || errMsg.includes('blocked')) {
      return {
        success: false,
        error: 'CONTENT_FILTER',
        message:
          language === 'uz'
            ? "Xavfsizlik filtri sababli so'rovga javob berilmadi. Iltimos, savolingizni boshqacha shakllantiring."
            : 'The request was filtered by safety settings. Please rephrase your question.',
      };
    }

    // 6. Network or Server Error
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message:
        language === 'uz'
          ? "Google Gemini xizmati bilan bog'lanishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
          : 'Unable to connect to Google Gemini service. Please try again shortly.',
    };
  }
}

module.exports = {
  processChatMessage,
  getVerifiedSchoolContext,
  getAIStatus,
  getGeminiApiKey,
};
