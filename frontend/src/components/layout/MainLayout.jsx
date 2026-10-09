import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import SubtleBackground from './SubtleBackground';
import FloatingAIAgentButton from '../common/FloatingAIAgentButton';

/**
 * Main Layout for NIS AI School Digital Profile Platform
 * Incorporates the White + Blue design foundation with sticky Navbar,
 * accessible Desktop Pages Selector, Subtle Animated Background, Mobile Bottom Navigation,
 * and global 1x1 floating NIS AI AGENT button.
 */
export default function MainLayout() {
  return (
    <div className="relative min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-school-100 selection:text-school-800">
      {/* Subtle Animated Background */}
      <SubtleBackground />

      {/* Sticky Desktop & Mobile Top Header */}
      <Navbar />

      {/* Main Page Content with bottom clearance for Mobile Bottom Nav */}
      <main className="relative z-10 flex-1 pb-24 sm:pb-28 xl:pb-0">
        <Outlet />
      </main>

      {/* Public Footer */}
      <Footer />

      {/* Global 1x1 Floating NIS AI AGENT Button */}
      <FloatingAIAgentButton />

      {/* Mobile Fixed Bottom Navigation Bar & Pages Drawer */}
      <MobileBottomNav />
    </div>
  );
}
