import { useState, useEffect, useMemo } from 'react';

/**
 * SectionVideoBackground — High-Quality Educational Background Video Loop
 * Provides context-aware video footage representing NIS AI School:
 * Modern campuses, robotics & AI tech, students collaborating, classrooms, and academic achievements.
 * Features:
 * - Subtle, low-contrast, muted, playsInline, autoPlay background loop
 * - High-resolution category poster images as instant and reduced-motion fallback
 * - Muted blue and translucent overlays ensuring 100% heading and text legibility
 * - Respects prefers-reduced-motion
 * - Strictly pointer-events-none, z-0 behind content
 */
const EDUCATION_VIDEO_PRESETS = {
  hero: '/videos/campus-loop.mp4',
  campus: '/videos/campus-loop.mp4',
  branches: '/videos/campus-loop.mp4',
  architecture: '/videos/campus-loop.mp4',
  teachers: 'https://assets.mixkit.co/videos/preview/mixkit-teacher-giving-a-lecture-to-students-in-a-classroom-42880-large.mp4',
  tech: '/videos/ai-vision.mp4',
  coding: '/videos/ai-vision.mp4',
  ai: '/videos/ai-vision.mp4',
  science: 'https://assets.mixkit.co/videos/preview/mixkit-students-working-in-a-science-laboratory-42884-large.mp4',
  labs: 'https://assets.mixkit.co/videos/preview/mixkit-students-working-in-a-science-laboratory-42884-large.mp4',
  library: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-studying-in-a-library-42931-large.mp4',
  schoolLife: '/videos/campus-loop.mp4',
  achievements: '/videos/ambient-loop.mp4',
  ambient: '/videos/ambient-loop.mp4',
  media: '/videos/campus-loop.mp4',
};

const EDUCATION_POSTER_PRESETS = {
  hero: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80',
  campus: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80',
  branches: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80',
  teachers: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&auto=format&fit=crop&q=80',
  tech: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1600&auto=format&fit=crop&q=80',
  coding: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80',
  ai: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1600&auto=format&fit=crop&q=80',
  science: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&auto=format&fit=crop&q=80',
  labs: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1600&auto=format&fit=crop&q=80',
  library: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1600&auto=format&fit=crop&q=80',
  schoolLife: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80',
  achievements: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80',
  ambient: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=80',
  media: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&auto=format&fit=crop&q=80',
};

export default function SectionVideoBackground({
  videoUrl,
  category = 'campus',
  posterUrl,
  overlayGradient = 'from-white/94 via-white/84 to-white/96',
  opacity = 'opacity-15',
  theme = 'light',
  className = '',
  scrimOpacity,
}) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initialSrc = useMemo(
    () => videoUrl || EDUCATION_VIDEO_PRESETS[category] || '/videos/campus-loop.mp4',
    [videoUrl, category]
  );
  const [currentSrc, setCurrentSrc] = useState(initialSrc);

  const effectivePoster = useMemo(
    () => posterUrl || EDUCATION_POSTER_PRESETS[category] || EDUCATION_POSTER_PRESETS.campus,
    [posterUrl, category]
  );

  // Check prefers-reduced-motion
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(mq.matches);
    }
  }, []);

  const handleVideoError = () => {
    // Fallback seamlessly to local verified video or poster
    if (currentSrc !== '/videos/campus-loop.mp4') {
      setCurrentSrc('/videos/campus-loop.mp4');
    } else {
      setHasError(true);
    }
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Background Subtle Mesh Grid */}
      <div className="absolute inset-0 bg-subtle-grid opacity-15" />

      {/* Video Element or Static Poster Fallback */}
      {!isReducedMotion && !hasError && currentSrc ? (
        <video
          key={currentSrc}
          autoPlay
          loop
          muted
          playsInline
          poster={effectivePoster}
          onCanPlay={() => setVideoLoaded(true)}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${opacity} ${
            videoLoaded ? 'scale-100' : 'scale-105 opacity-0'
          }`}
          style={{
            filter:
              theme === 'blue' || theme === 'hero'
                ? 'hue-rotate(200deg) saturate(1.3) brightness(0.9)'
                : 'saturate(0.9)',
          }}
        >
          <source src={currentSrc} type="video/mp4" />
        </video>
      ) : (
        /* Pristine Educational Photography Poster Fallback */
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 transition-opacity duration-700"
          style={{ backgroundImage: `url(${effectivePoster})` }}
        />
      )}

      {/* ─── OVERLAY LAYER 1: Protective Contrast Scrim ─── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          scrimOpacity !== undefined
            ? scrimOpacity
            : theme === 'blue' || theme === 'hero'
            ? 'bg-slate-950/50'
            : theme === 'dark'
            ? 'bg-slate-950/70'
            : 'bg-white/60'
        }`}
      />

      {/* ─── OVERLAY LAYER 2: Thematic Gradient Color Mask ─── */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          theme === 'blue' || theme === 'hero'
            ? 'from-[#051c38]/94 via-[#003875]/86 to-[#0052a3]/90'
            : theme === 'dark'
            ? 'from-slate-950/95 via-slate-900/90 to-slate-950/96'
            : overlayGradient
        }`}
      />

      {/* ─── OVERLAY LAYER 3: Soft Radial Vignette for Depth & Focus ─── */}
      <div
        className={`absolute inset-0 ${
          theme === 'blue' || theme === 'hero'
            ? 'bg-radial from-transparent via-blue-900/20 to-slate-950/50'
            : theme === 'dark'
            ? 'bg-radial from-transparent via-slate-950/30 to-black/60'
            : 'bg-radial from-transparent via-blue-50/20 to-white/60'
        }`}
      />

      {/* ─── OVERLAY LAYER 4: High-Tech Dot Matrix Pattern ─── */}
      <div className="absolute inset-0 bg-subtle-grid opacity-15" />

      {/* Subtle corner light blooms */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-300/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
