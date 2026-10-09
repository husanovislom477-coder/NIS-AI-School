import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiCpu,
  FiSend,
  FiRotateCcw,
  FiArrowRight,
  FiMapPin,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiHelpCircle,
  FiMessageSquare,
  FiZap,
} from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { aiAPI } from '../api';
import PageHeroBackground from '../components/common/PageHeroBackground';

export default function AIAgentPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initialMessage = {
    id: 'welcome',
    sender: 'agent',
    text:
      language === 'uz'
        ? "Assalomu alaykum! Men NIS AI School aqlli raqamli yordamchisiman. Maktabimizning filiallari, o'qituvchilar tarkibi, o'quv dasturlari, talabalar natijalari yoki 100% grantli qabul jarayoni haqida istalgan savolingizga javob bera olaman."
        : language === 'ru'
        ? "Здравствуйте! Я интеллектуальный ассистент NIS AI School. С радостью отвечу на ваши вопросы о кампусах, преподавателях, программах обучения, достижениях или поступлении на 100% грант."
        : "Hello! I am your NIS AI School intelligent assistant. I can help answer questions about our smart campuses, international faculty, AI curricula, student achievements, or 100% grant admissions.",
    time: 'Online',
    actions: [
      { label: t('nav.campuses', 'Filiallar'), path: '/campuses' },
      { label: t('home.applyNowBtn', 'Ariza Topshirish'), path: '/application' },
      { label: t('nav.teachers', "O'qituvchilar"), path: '/teachers' },
      { label: t('home.allStudents', 'Yutuqlar'), path: '/students' },
    ],
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedTopics = [
    {
      icon: FiMapPin,
      title: language === 'uz' ? 'Filiallar tarmog\'i' : language === 'ru' ? 'Кампусы школы' : 'Smart Campuses',
      desc: language === 'uz' ? 'Toshkent, Samarqand va Buxoro' : language === 'ru' ? 'Ташкент, Самарканд, Бухара' : 'Tashkent, Samarkand, Bukhara',
      query: language === 'uz' ? 'Maktabning qaysi shaharlarda filiallari bor?' : language === 'ru' ? 'В каких городах расположены кампусы?' : 'Which cities have NIS AI campuses?',
    },
    {
      icon: FiAward,
      title: language === 'uz' ? '100% Grant & Qabul' : language === 'ru' ? '100% Грант и приём' : '100% Grant & Admissions',
      desc: language === 'uz' ? '240 ta o\'rin, barcha xarajatlar qoplanadi' : language === 'ru' ? '240 мест, полное покрытие' : '240 merit-based full grants',
      query: language === 'uz' ? 'Qabul shartlari va 100% grant tartibi qanday?' : language === 'ru' ? 'Каковы условия поступления на грант?' : 'What are the admission requirements and grant terms?',
    },
    {
      icon: FiCpu,
      title: language === 'uz' ? 'O\'qituvchilar tarkibi' : language === 'ru' ? 'Преподаватели' : 'World-Class Faculty',
      desc: language === 'uz' ? 'MIT, Stanford, ETH Zürich' : language === 'ru' ? 'Выпускники ведущих вузов' : 'Alumni from top institutions',
      query: language === 'uz' ? 'Ustozlar kimlar va ularning tajribasi qanday?' : language === 'ru' ? 'Кто преподает в школе?' : 'Who are the teachers at NIS AI School?',
    },
    {
      icon: FiZap,
      title: language === 'uz' ? 'AI Loyihalar' : language === 'ru' ? 'Проекты учеников' : 'Student AI Projects',
      desc: language === 'uz' ? 'Dronlar, kompyuter ko\'rishi, tibbiy AI' : language === 'ru' ? 'Дроны, зрение, медицина' : 'Robotics, Computer Vision, MedAI',
      query: language === 'uz' ? 'O\'quvchilar qanday AI loyihalar yaratgan?' : language === 'ru' ? 'Какие проекты создали ученики?' : 'What AI projects have students built?',
    },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend = inputValue) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await aiAPI.chat({
        message: trimmed,
        language,
        history: historyPayload,
      });

      if (res?.data?.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            text: res.data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: res.data.actions || [],
            model: res.data.model || 'Google Gemini AI',
          },
        ]);
      } else {
        const errorMsg = res?.data?.message || (language === 'uz' ? "Kechirasiz, xatolik yuz berdi." : "Sorry, an error occurred.");
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'agent',
            text: errorMsg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: res?.data?.actions || [],
            isError: true,
          },
        ]);
      }
    } catch (err) {
      console.warn('AI Chat Error:', err.message);
      const serverErrMsg = err?.response?.data?.message;
      const errorText = serverErrMsg || (language === 'uz'
        ? "Kechirasiz, sun'iy intellekt xizmati bilan bog'lanishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
        : "Sorry, unable to connect to the AI service at the moment. Please try again.");

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: errorText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: t('home.applyNowBtn', 'Ariza topshirish'), path: '/application' },
            { label: t('nav.campuses', 'Filiallar'), path: '/campuses' },
          ],
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-28 pb-20">
      <div className="container-custom max-w-5xl">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-3 shadow-elevation-1">
            <FiCpu size={14} className="text-blue-600 animate-pulse" />
            <span>Official Intelligent Assistant</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
            NIS AI AGENT
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            {language === 'uz'
              ? 'Maktab ma\'lumotlar bazasiga ulangan rasmiy raqamli intellektual yo\'riqchi'
              : language === 'ru'
              ? 'Официальный цифровой ассистент, подключенный к базе данных школы'
              : 'Your official intelligent guide to NIS AI School, connected to real database records.'}
          </p>
        </div>

        {/* Suggested Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {suggestedTopics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(topic.query)}
                className="p-3.5 bg-white rounded-2xl border border-slate-200/80 hover:border-school-300 hover:shadow-card transition-all text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-school-50 text-school-600 flex items-center justify-center mb-2 group-hover:bg-school-600 group-hover:text-white transition-colors">
                  <Icon size={16} />
                </div>
                <h3 className="font-bold font-display text-xs text-slate-900 group-hover:text-school-600 transition-colors">
                  {topic.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                  {topic.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Chat Main Window */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-elevation-2 overflow-hidden flex flex-col h-[650px] max-h-[75vh]">
          
          {/* Chat Window Bar */}
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-school-600 to-school-800 text-white flex items-center justify-center shadow-xs">
                <FiCpu size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                    NIS AI AGENT
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-[11px] text-slate-400">
                  {language === 'uz' ? 'Real ma\'lumotlar bazasi sinxronizatsiyasi' : 'Real database synchronized'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Chatni yangilash"
            >
              <FiRotateCcw size={13} />
              <span className="hidden sm:inline">{language === 'uz' ? 'Tozalash' : 'Clear'}</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-slate-50/40">
            {messages.map((m) => {
              const isAgent = m.sender === 'agent';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isAgent
                        ? 'bg-slate-100/90 text-slate-800 border border-slate-200/70 rounded-tl-sm'
                        : 'bg-school-600 text-white rounded-tr-sm shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {/* Quick Action Navigation Buttons */}
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap gap-2">
                        {m.actions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => navigate(act.path)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-700 hover:text-school-800 bg-white px-3 py-1.5 rounded-xl border border-school-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <FiArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">
                    {m.time}
                  </span>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 px-4 py-2.5 rounded-2xl w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-school-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-school-500 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-school-500 animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              placeholder={
                isTyping
                  ? (language === 'uz' ? "Javob tayyorlanmoqda..." : "Generating response...")
                  : language === 'uz'
                  ? 'Savolingizni yozing...'
                  : language === 'ru'
                  ? 'Задайте вопрос...'
                  : 'Ask about NIS AI School...'
              }
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-500/20 focus:border-school-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 rounded-xl bg-school-600 hover:bg-school-700 text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs cursor-pointer shrink-0"
              aria-label="Yuborish"
            >
              <FiSend size={16} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
