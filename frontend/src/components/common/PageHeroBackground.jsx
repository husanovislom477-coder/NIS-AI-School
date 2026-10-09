import { useState } from 'react';
import SectionVideoBackground from '../home/SectionVideoBackground';
import SectionAnimatedBackground from '../home/SectionAnimatedBackground';

/**
 * PageHeroBackground — Premium video + canvas animation header background
 * Used across all inner page heroes (About, Teachers, Students, Branches, Achievements, etc.)
 * Strictly z-0, pointer-events-none, 100% responsive and readable.
 */
export default function PageHeroBackground({
  category = 'ambient',
  videoUrl,
  variant = 'network',
  showAnimation = true,
  opacity = 'opacity-25',
}) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" aria-hidden="true">
      {/* 1. Underlying Video Loop */}
      <SectionVideoBackground
        videoUrl={videoUrl}
        category={category}
        theme="hero"
        opacity={opacity}
      />

      {/* 2. Additional Contrast Overlay for Maximum Heading Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-blue-950/20" />

      {/* 3. Optional Particle/Network Canvas Animation */}
      {showAnimation && (
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <SectionAnimatedBackground variant={variant} />
        </div>
      )}

      {/* 3. Floating Geometric Elements */}
      <div className="absolute bottom-10 right-12 w-28 h-14 border border-indigo-400/20 rounded-2xl -rotate-6 backdrop-blur-xs" />
      <div className="hidden sm:block absolute top-1/2 right-1/4 w-12 h-12 border border-sky-400/15 rounded-lg rotate-45" />

      {/* 4. Soft Ambient Glow Orbs */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl" />
    </div>
  );
}
