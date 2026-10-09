import { useState } from 'react';

/**
 * SectionVideoBackground — Subtle, low-contrast, muted background video loop
 * with seamless animated fallback when video is offline or unsupported.
 * Strictly pointer-events-none, z-0, behind all content.
 */
const VIDEO_PRESETS = {
  ai: '/videos/ai-vision.mp4',
  tech: '/videos/ai-vision.mp4',
  coding: '/videos/ai-vision.mp4',
  campus: '/videos/campus-loop.mp4',
  architecture: '/videos/campus-loop.mp4',
  ambient: '/videos/ambient-loop.mp4',
  stars: '/videos/ambient-loop.mp4',
  education: '/videos/ambient-loop.mp4',
  achievements: '/videos/ambient-loop.mp4',
  media: '/videos/campus-loop.mp4',
};

export default function SectionVideoBackground({
  videoUrl,
  category = 'ambient',
  overlayGradient = 'from-white/92 via-white/80 to-white/95',
  opacity = 'opacity-15',
  theme = 'light',
  className = '',
  scrimOpacity,
}) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(videoUrl || VIDEO_PRESETS[category] || '/videos/ambient-loop.mp4');

  const handleVideoError = () => {
    // If custom URL failed (e.g. 403 hotlink block), fallback seamlessly to local video
    if (currentSrc !== '/videos/ambient-loop.mp4') {
      setCurrentSrc('/videos/ambient-loop.mp4');
    }
  };

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Fallback subtle animated mesh & dot pattern */}
      <div className="absolute inset-0 bg-subtle-grid opacity-20" />

      {/* Video Element */}
      {currentSrc && (
        <video
          key={currentSrc}
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoLoaded(true)}
          onError={handleVideoError}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${opacity} ${
            videoLoaded ? 'scale-100' : 'scale-105 opacity-0'
          }`}
          style={{
            filter:
              theme === 'blue' || theme === 'hero'
                ? 'hue-rotate(200deg) saturate(1.4) brightness(0.85)'
                : 'saturate(0.9)',
          }}
        >
          <source src={currentSrc} type="video/mp4" />
        </video>
      )}

      {/* ─── OVERLAY LAYER 1: Protective Contrast Scrim ─── */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          scrimOpacity !== undefined
            ? scrimOpacity
            : theme === 'blue' || theme === 'hero'
            ? 'bg-slate-950/45'
            : theme === 'dark'
            ? 'bg-slate-950/65'
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
