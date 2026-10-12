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
import MarkdownMessage from '../common/MarkdownMessage';

export default function AIAgentChatDrawer({ isOpen, onClose }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const messagesContainerRef = useRef(null);
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
    toolsUsed: [{ id: 'gemini', name: 'Google Gemini Neural Core' }],
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
      label: language === 'uz' ? '🏫 Filiallar' : '🏫 Campuses',
      query: language === 'uz' ? 'Maktabning qaysi shaharlarda filiallari bor?' : 'Which cities have NIS AI campuses?',
    },
    {
      label: language === 'uz' ? '🎓 100% Grant' : '🎓 100% Grant',
      query: language === 'uz' ? 'Qabul shartlari va 100% grant tartibi qanday?' : 'What are the admission requirements and grant terms?',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 200);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
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
      const historyPayload = messages.slice(-8).map((m) => ({
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
            toolsUsed: [{ id: 'gemini', name: res.data.model || 'Google Gemini' }],
          },
        ]);
      } else {
        const errorMsg =
          res?.data?.message ||
          (language === 'uz' ? 'Kechirasiz, xatolik yuz berdi.' : 'Sorry, an error occurred.');
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
      const errorText =
        serverErrMsg ||
        (language === 'uz'
          ? "Kechirasiz, sun'iy intellekt xizmati bilan bog'lanishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
          : 'Sorry, unable to connect to the AI service at the moment. Please try again.');

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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[440px] max-w-[460px] h-[610px] max-h-[85vh] rounded-3xl flex flex-col overflow-hidden bg-white shadow-2xl border border-slate-200/90"
        role="dialog"
        aria-label="NIS AI Agent Window"
      >
        {/* Clean Modern NIS AI School Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-school-900 via-school-800 to-school-900 text-white flex items-center justify-between border-b border-school-700/60 select-none flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-school-600 border border-school-400/40 flex items-center justify-center flex-shrink-0 shadow-xs">
              <FiCpu size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white truncate font-display">
                  NIS AI AGENT
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions: Reset + Clean Close Button */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={language === 'uz' ? 'Tarixni tozalash' : 'Clear history'}
              aria-label="Clear chat"
            >
              <FiRotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer"
              title={language === 'uz' ? 'Yopish' : 'Close'}
              aria-label="Close"
            >
              <FiX size={17} />
            </button>
          </div>
        </div>

              {/* Suggestions chips row */}
              <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s.query)}
                    className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 rounded-full bg-white text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer shrink-0"
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Chat messages stream */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-50/50 to-white"
              >
                {messages.map((m) => {
                  const isAgent = m.sender === 'agent';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                          isAgent
                            ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                            : 'bg-blue-600 text-white rounded-tr-xs shadow-sm'
                        }`}
                      >
                        {/* Active Tools Executed */}
                        {isAgent && m.toolsUsed && m.toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {m.toolsUsed.map((tool, tIdx) => (
                              <span
                                key={tIdx}
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md"
                              >
                                <FiZap size={10} className="text-blue-600" />
                                {tool.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <MarkdownMessage content={m.text} isAgent={isAgent} />

                        {/* Action buttons */}
                        {m.actions && m.actions.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                            {m.actions.map((act, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  navigate(act.path);
                                  onClose();
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800 bg-blue-50/60 hover:bg-blue-100/60 px-2.5 py-1 rounded-lg border border-blue-200/80 transition-all cursor-pointer"
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
                  <div className="flex items-center gap-1.5 text-slate-400 bg-white border border-slate-200/80 px-3.5 py-2 rounded-2xl w-fit shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.3s]" />
                    <span className="text-[10px] text-slate-400 ml-1 font-medium">Javob tayyorlanmoqda...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSend();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSend();
                    }
                  }}
                  disabled={isTyping}
                  placeholder={
                    isTyping
                      ? (language === 'uz' ? 'Javob shakllanmoqda...' : 'Generating answer...')
                      : language === 'uz'
                      ? 'Savolingizni yozing (Python, fizika, 100% grant, filiallar)...'
                      : language === 'ru'
                      ? 'Задайте вопрос...'
                      : 'Ask NIS AI School agent...'
                  }
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs cursor-pointer shrink-0"
                  aria-label="Yuborish"
                >
                  <FiSend size={14} />
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
  );
}
