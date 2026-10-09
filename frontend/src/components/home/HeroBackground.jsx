import { useEffect, useRef, useState, useMemo } from 'react';
import HeroGeometricEdges from './HeroGeometricEdges';
import HeroThreeScene from './HeroThreeScene';

/**
 * HeroBackground:
 * Premium education/technology-focused school background.
 * Configurable via VITE_HERO_VIDEO_URL and VITE_HERO_POSTER_URL.
 * Supports WebM & MP4, poster fallback, lazy loading, and prefers-reduced-motion.
 */
export default function HeroBackground() {
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const canvasRef = useRef(null);

  // Configurable URLs
  const videoUrl = useMemo(
    () =>
      import.meta.env.VITE_HERO_VIDEO_URL ||
      'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-1728-large.mp4',
    []
  );

  const posterUrl = useMemo(
    () =>
      import.meta.env.VITE_HERO_POSTER_URL ||
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=80',
    []
  );

  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Animated Canvas Fallback: Soft blue light waves and subtle particles
  useEffect(() => {
    if (isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particleCount = Math.min(width > 768 ? 20 : 10, 24);
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    let step = 0;

    const render = () => {
      step += 0.006;
      ctx.clearRect(0, 0, width, height);

      // 1. Soft blue sinusoidal ambient wave
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, height * 0.65);
      for (let x = 0; x <= width; x += 20) {
        const y =
          height * 0.65 +
          Math.sin(x * 0.003 + step) * 18 +
          Math.sin(x * 0.007 - step * 0.8) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      const waveGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
      waveGrad.addColorStop(0, 'rgba(0, 102, 204, 0.025)');
      waveGrad.addColorStop(1, 'rgba(186, 224, 253, 0.01)');
      ctx.fillStyle = waveGrad;
      ctx.fill();
      ctx.restore();

      // 2. Floating particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 102, 204, ${p.alpha * 0.5})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isReducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* ─── Layer 1: Configurable School Video Loop or Reduced-Motion Poster ─── */}
      {!videoError && !isReducedMotion ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={posterUrl}
          onCanPlay={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-16' : 'opacity-0'
          }`}
          style={{ filter: 'saturate(0.9) brightness(0.96)' }}
        >
          {videoUrl.endsWith('.webm') && <source src={videoUrl} type="video/webm" />}
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        /* Static education poster fallback */
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center opacity-10 transition-opacity duration-1000"
          style={{ backgroundImage: `url(${posterUrl})` }}
        />
      )}

      {/* ─── Layer 2: Protective Gradients & White Readability Overlay ─── */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/94 via-white/82 to-white/98" />
      <div className="absolute inset-0 bg-radial from-transparent via-blue-50/25 to-white/80" />

      {/* ─── Layer 3: Animated Canvas Light Waves & Particles ─── */}
      {!isReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* ─── Layer 4: Interactive Three.js 3D Educational & Technology Scene ─── */}
      <HeroThreeScene />

      {/* ─── Layer 5: Soft ambient blurred light shapes ─── */}
      <div className="absolute top-0 right-1/4 w-[480px] h-[360px] bg-blue-300/12 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/5 w-[520px] h-[380px] bg-sky-200/15 rounded-full blur-3xl" />

      {/* ─── Layer 6: Restored Rectangular / Geometric Corner & Edge Elements ─── */}
      <HeroGeometricEdges />
    </div>
  );
}
