import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FiCpu } from 'react-icons/fi';
import AIAgentChatDrawer from '../home/AIAgentChatDrawer';

/**
 * Floating 1x1 NIS AI AGENT Button:
 * Globally available across the application.
 * Positioned in bottom-right, elevated above Mobile Bottom Nav (bottom-20 on mobile, bottom-6 on desktop).
 * Hidden on dedicated /ai-agent page to avoid redundancy.
 */
export default function FloatingAIAgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('nis:open-ai-agent', handleOpen);
    return () => window.removeEventListener('nis:open-ai-agent', handleOpen);
  }, []);

  // Hide on the dedicated /ai-agent page or inside admin panel
  if (location.pathname === '/ai-agent' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open NIS AI Agent"
          title="NIS AI AGENT"
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-school-600 to-school-800 text-white shadow-glow hover:shadow-glow-lg hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-school-400"
        >
          {/* Subtle pulsating outer ring */}
          <span className="absolute -inset-1 rounded-2xl bg-school-500/25 animate-ping opacity-60 pointer-events-none" />

          {/* AI CPU Icon */}
          <FiCpu size={22} className="relative z-10 animate-pulse text-white group-hover:scale-110 transition-transform" />

          {/* Online green indicator badge */}
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />

          {/* Tooltip on hover (desktop only) */}
          <span className="hidden lg:block absolute right-full mr-3 px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-semibold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            NIS AI AGENT
          </span>
        </button>
      </div>

      {/* Real Connected AI Chat Drawer */}
      <AIAgentChatDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
