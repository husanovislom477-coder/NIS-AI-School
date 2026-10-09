import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiX,
  FiSend,
  FiCpu,
  FiArrowRight,
  FiRotateCcw,
  FiZap,
} from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { aiAPI } from '../../api';

export default function AIAgentChatDrawer({ isOpen, onClose }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const initialMessage = {
    id: 'welcome',
    sender: 'agent',
    text:
      language === 'uz'
        ? "Assalomu alaykum! Men NIS AI AGENT — universal sun'iy intellekt yordamchisiman. Dasturlash (Python, React, JS, C++), aniq hisob-kitoblar, fanlar (fizika, kimyo, biologiya), shuningdek NIS AI School filiallari, ustozlari va 100% grantli qabul jarayoni haqida istalgan savolingizga yordam beraman."
        : language === 'ru'
        ? "Здравствуйте! Я NIS AI AGENT — универсальный интеллектуальный ассистент. Я могу помочь с программированием, вычислениями, физикой, химией, биологией, а также ответить на любые вопросы о кампусах и 100% грантах NIS AI School."
        : "Hello! I am NIS AI AGENT — your universal intelligent assistant. I can assist with programming, precision math calculations, science concepts, as well as comprehensive admissions and campus information for NIS AI School.",
    time: 'Online',
    actions: [
      { label: t('nav.campuses', 'Filiallar'), path: '/campuses' },
      { label: t('home.applyNowBtn', 'Ariza Topshirish'), path: '/application' },
      { label: t('nav.teachers', "O'qituvchilar"), path: '/teachers' },
      { label: 'AI Agent Page', path: '/ai-agent' },
    ],
    toolsUsed: [{ id: 'general_ai', name: 'Universal AI Agent' }],
  };

  const [messages, setMessages] = useState([initialMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Quick universal prompt suggestions
  const suggestions = [
    {
      label: '⚡ 847 × 923',
      query: 'What is 847 * 923?',
    },
    {
      label: language === 'uz' ? '🔬 Fotosintez' : '🔬 Photosynthesis',
      query: language === 'uz' ? 'Fotosintez jarayoni haqida tushuntir' : 'Explain photosynthesis',
    },
    {
      label: '💻 Python QuickSort',
      query: 'Write a python quick sort algorithm',
    },
    {
      label: language === 'uz' ? "🏫 Filiallar" : '🏫 Campuses',
      query: language === 'uz' ? "Maktabning qaysi shaharlarda filiallari bor?" : 'Which cities have NIS AI campuses?',
    },
    {
      label: language === 'uz' ? '🎓 100% Grant' : '🎓 100% Grant',
      query: language === 'uz' ? "Qabul shartlari va 100% grant tartibi qanday?" : 'What are the admission requirements and grant terms?',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

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
            toolsUsed: [{ id: 'gemini', name: res.data.model || 'Google Gemini AI' }],
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
      console.warn('Backend AI chat error:', err.message);
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
            { label: t('nav.campuses', 'Filiallar'), path: '/campuses' },
            { label: t('home.applyNowBtn', 'Ariza topshirish'), path: '/application' },
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Chat Drawer / Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] max-w-[460px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-elevation-4 border border-slate-200/90 flex flex-col z-50 overflow-hidden"
            role="dialog"
            aria-label="NIS AI Agent"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-school-600 via-school-700 to-school-800 text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner">
                    <FiCpu size={20} className="animate-pulse" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-school-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold font-display text-sm leading-tight text-white">
                      NIS AI Agent
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-white/20 text-white/90">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-100 font-medium">
                    {language === 'uz'
                      ? 'Maktab aqlli AI yo\'riqchisi'
                      : language === 'ru'
                      ? 'Интеллектуальный школьный гид'
                      : 'Intelligent School Guide'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Yangilash"
                >
                  <FiRotateCcw size={15} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Yopish"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Quick Suggestions Chips Bar */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(s.query)}
                  className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 hover:text-school-700 hover:bg-school-50 border border-slate-200 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-white to-slate-50/50">
              {messages.map((m) => {
                const isAgent = m.sender === 'agent';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        isAgent
                          ? 'bg-slate-100/90 text-slate-800 border border-slate-200/60 rounded-tl-sm'
                          : 'bg-school-600 text-white rounded-tr-sm shadow-xs'
                      }`}
                    >
                      {/* Active Tools Executed */}
                      {isAgent && m.toolsUsed && m.toolsUsed.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {m.toolsUsed.map((tool, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-school-700 bg-white border border-school-200/80 px-2 py-0.5 rounded-md shadow-2xs"
                            >
                              <FiZap size={10} className="text-school-600" />
                              {tool.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="whitespace-pre-wrap font-sans">{m.text}</div>

                      {/* Quick Action Buttons attached to message */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex flex-wrap gap-1.5">
                          {m.actions.map((act, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                navigate(act.path);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-school-700 hover:text-school-800 bg-white px-2.5 py-1 rounded-lg border border-school-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                            >
                              <span>{act.label}</span>
                              <FiArrowRight size={11} />
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
                <div className="flex items-center gap-1 text-slate-400 bg-slate-100 px-3 py-2 rounded-2xl w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-school-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-school-500 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-school-500 animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
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
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-school-500/20 focus:border-school-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-school-600 hover:bg-school-700 text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs cursor-pointer shrink-0"
                aria-label="Yuborish"
              >
                <FiSend size={14} />
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
