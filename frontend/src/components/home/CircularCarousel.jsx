import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause } from 'react-icons/fi';
import { carouselImages as defaultImages } from '../../data/carouselImages';
import SectionAnimatedBackground from './SectionAnimatedBackground';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Refined Compact CircularCarousel Component
 * 
 * Inspired by React Bits Circular Carousel (https://reactbits.dev/components/circular-carousel).
 * A compact, visually balanced 3D cylindrical ring carousel:
 * - Noticeably reduced card dimensions & section height
 * - Mathematical 3D ring projection (preserve-3d + dynamic radius)
 * - Momentum drag & touch swipe physics (inertia damping)
 * - Continuous smooth auto-rotation with hover/drag pause
 * - Click-to-focus with shortest-arc angular snapping
 * - Dynamic depth fade (scale, opacity, blur, z-index by cos(angle))
 * - Responsive geometry for desktop, tablet, and mobile
 * - Accessible controls (prev/next, keyboard arrows, play/pause, indicator pills)
 * - Object-fit: cover, prevents image stretching or clipping
 */
export default function CircularCarousel({
  items = defaultImages,
  autoRotateSpeed = 0.14, // degrees per frame
  perspective = 1000,
}) {
  const { t } = useLanguage();
  const containerRef = useRef(null);

  // Responsive dimensions - wider horizontal span, ample vertical clearance to prevent overlap
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') return { cardWidth: 190, cardHeight: 250, radius: 360, stageExtra: 95 };
    const w = window.innerWidth;
    if (w < 640) return { cardWidth: 135, cardHeight: 180, radius: 225, stageExtra: 70 };
    if (w < 1024) return { cardWidth: 160, cardHeight: 215, radius: 290, stageExtra: 85 };
    return { cardWidth: 190, cardHeight: 250, radius: 360, stageExtra: 95 };
  });

  const count = items.length;
  const angleStep = 360 / Math.max(count, 1);

  // Continuous rotation angle in degrees
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  rotationRef.current = rotation;

  // Interactivity states
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  // Pointer drag & inertia physics refs
  const dragStartRef = useRef({ x: 0, time: 0, startAngle: 0 });
  const velocityRef = useRef(0);
  const lastPointerRef = useRef({ x: 0, time: 0 });
  const animFrameRef = useRef(null);
  const isTargetingRef = useRef(false);
  const targetAngleRef = useRef(0);

  // Active index calculation based on current rotation
  const activeIndex = useMemo(() => {
    if (count === 0) return 0;
    const normalized = ((-rotation % 360) + 360) % 360;
    const index = Math.round(normalized / angleStep) % count;
    return (index + count) % count;
  }, [rotation, angleStep, count]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update layout dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setDimensions({ cardWidth: 135, cardHeight: 180, radius: 225, stageExtra: 70 });
      } else if (w < 1024) {
        setDimensions({ cardWidth: 160, cardHeight: 215, radius: 290, stageExtra: 85 });
      } else {
        setDimensions({ cardWidth: 190, cardHeight: 250, radius: 360, stageExtra: 95 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Main animation loop: continuous rotation + inertia glide + target snap
  useEffect(() => {
    let lastTimestamp = performance.now();

    const loop = (timestamp) => {
      const dt = Math.min((timestamp - lastTimestamp) / 16.666, 2.5);
      lastTimestamp = timestamp;

      if (isDragging) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      if (isTargetingRef.current) {
        const diff = targetAngleRef.current - rotationRef.current;
        if (Math.abs(diff) < 0.05) {
          rotationRef.current = targetAngleRef.current;
          setRotation(targetAngleRef.current);
          isTargetingRef.current = false;
        } else {
          const step = diff * 0.12 * dt;
          rotationRef.current += step;
          setRotation(rotationRef.current);
        }
      } else if (Math.abs(velocityRef.current) > 0.02) {
        rotationRef.current += velocityRef.current * dt;
        velocityRef.current *= Math.pow(0.92, dt);
        setRotation(rotationRef.current);
      } else {
        velocityRef.current = 0;
        if (isPlaying && !isHovered && !prefersReducedMotion) {
          rotationRef.current += autoRotateSpeed * dt;
          setRotation(rotationRef.current);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDragging, isPlaying, isHovered, prefersReducedMotion, autoRotateSpeed]);

  // Click to focus card with shortest angular distance
  const rotateToIndex = useCallback((index) => {
    isTargetingRef.current = true;
    velocityRef.current = 0;

    const current = rotationRef.current;
    const targetBase = -index * angleStep;

    const diff = (targetBase - current) % 360;
    let shortestDiff = diff;
    if (diff > 180) shortestDiff -= 360;
    if (diff < -180) shortestDiff += 360;

    targetAngleRef.current = current + shortestDiff;
  }, [angleStep]);

  const handlePrev = useCallback(() => {
    const nextIdx = (activeIndex - 1 + count) % count;
    rotateToIndex(nextIdx);
  }, [activeIndex, count, rotateToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % count;
    rotateToIndex(nextIdx);
  }, [activeIndex, count, rotateToIndex]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  }, [handlePrev, handleNext]);

  // Pointer / Touch drag handling
  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    setIsDragging(true);
    isTargetingRef.current = false;
    velocityRef.current = 0;

    dragStartRef.current = {
      x: e.clientX,
      time: performance.now(),
      startAngle: rotationRef.current,
    };
    lastPointerRef.current = {
      x: e.clientX,
      time: performance.now(),
    };

    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;

    const now = performance.now();
    const currentX = e.clientX;
    const deltaX = currentX - dragStartRef.current.x;

    const degPerPx = 360 / (dimensions.radius * 2 * Math.PI * 1.15);
    const newAngle = dragStartRef.current.startAngle + deltaX * degPerPx;

    const timeDelta = Math.max(now - lastPointerRef.current.time, 1);
    const pxDelta = currentX - lastPointerRef.current.x;
    const instantVelocity = (pxDelta * degPerPx) / (timeDelta / 16.666);

    velocityRef.current = instantVelocity * 0.7 + velocityRef.current * 0.3;

    lastPointerRef.current = { x: currentX, time: now };
    rotationRef.current = newAngle;
    setRotation(newAngle);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    const totalDragged = Math.abs(e.clientX - dragStartRef.current.x);
    if (totalDragged > 6 && Math.abs(velocityRef.current) < 0.5) {
      const nearestIdx = Math.round(-rotationRef.current / angleStep);
      isTargetingRef.current = true;
      targetAngleRef.current = -nearestIdx * angleStep;
    }
  };

  const handleImageError = (id, fallbackUrl) => {
    setFailedImages((prev) => ({
      ...prev,
      [id]: fallbackUrl || true,
    }));
  };

  const activeItem = items[activeIndex] || items[0];

  return (
    <section
      aria-label="NIS AI School Galereyasi"
      className="py-10 sm:py-12 lg:py-14 relative overflow-hidden bg-slate-50/70 select-none section-divider"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Network Canvas Animation in Background */}
      <SectionAnimatedBackground variant="network" />

      {/* Subtle NIS AI Blue Ambient Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">

        {/* ── Section Header (Generous Headroom & Preserved Stacking) ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 lg:mb-16 relative z-20 pointer-events-auto">
          <span className="badge-blue mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            {t('home.carouselBadge', 'Maktab Hayoti & Muhit')}
          </span>
          <h2 className="section-heading text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t('home.carouselTitle', 'NIS AI School Hayoti')}
          </h2>
          <p className="section-subheading mx-auto text-xs sm:text-sm text-slate-600 mt-2 max-w-xl">
            {t(
              'home.carouselSubtitle',
              "Zamonaviy IT kampuslarimiz, robototexnika laboratoriyalari, xalqaro ta'lim muhiti va innovatsion loyihalar bilan tanishing"
            )}
          </p>
        </div>

        {/* ── 3D Circular Carousel Stage (Ample Vertical Space, No Overlap) ── */}
        <div
          ref={containerRef}
          className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y pt-4 pb-2"
          style={{
            marginTop: 'clamp(1rem, 3vw, 2.5rem)',
            height: dimensions.cardHeight + dimensions.stageExtra,
            perspective: `${perspective}px`,
            perspectiveOrigin: '50% 50%',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Rotating 3D Cylinder / Ring */}
          <div
            className="absolute top-1/2 left-1/2 will-change-transform"
            style={{
              width: dimensions.cardWidth,
              height: dimensions.cardHeight,
              marginLeft: -dimensions.cardWidth / 2,
              marginTop: -dimensions.cardHeight / 2,
              transformStyle: 'preserve-3d',
              transform: `rotateY(${rotation}deg)`,
            }}
          >
            {items.map((item, index) => {
              const cardAngle = index * angleStep;

              // Compute normalized relative angle to viewer (0 deg = facing directly front)
              const relAngle = (((cardAngle + rotation) % 360) + 360) % 360;
              const angleFromFront = relAngle > 180 ? relAngle - 360 : relAngle;
              const rad = (angleFromFront * Math.PI) / 180;
              const cosVal = Math.cos(rad);

              // Depth fade calculations inspired by React Bits
              const isFront = Math.abs(angleFromFront) < angleStep / 2;
              const opacity = Math.max(0.25, Math.min(1, (cosVal + 1) / 1.75));
              const scale = 0.88 + Math.max(0, cosVal) * 0.14;
              const blurPx = cosVal < 0 ? Math.min(2.5, Math.abs(cosVal) * 2.5) : 0;
              const zIndex = Math.round(100 + cosVal * 100);

              const imageSrc =
                failedImages[item.id] === true
                  ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
                  : failedImages[item.id] || item.url;

              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    if (Math.abs(lastPointerRef.current.x - dragStartRef.current.x) > 10) return;
                    e.stopPropagation();
                    rotateToIndex(index);
                  }}
                  className={`absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ${
                    isFront
                      ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/25'
                      : 'shadow-md hover:shadow-lg'
                  }`}
                  style={{
                    width: dimensions.cardWidth,
                    height: dimensions.cardHeight,
                    transformStyle: 'preserve-3d',
                    transform: `rotateY(${cardAngle}deg) translateZ(${dimensions.radius}px) scale(${scale})`,
                    opacity: opacity,
                    filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
                    zIndex: zIndex,
                    backfaceVisibility: 'visible',
                  }}
                  title={item.title}
                >
                  {/* Card Background Image (object-cover) */}
                  <img
                    src={imageSrc}
                    alt={item.alt || item.title}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    onError={() => handleImageError(item.id, item.fallbackUrl)}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                    draggable={false}
                  />

                  {/* Gradient Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent pointer-events-none" />

                  {/* Card Top Category Badge & Index */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-md text-blue-700 shadow-xs">
                      {item.category}
                    </span>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-bold">
                      {index + 1}
                    </span>
                  </div>

                  {/* Card Bottom Meta Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 text-white pointer-events-none">
                    <h3 className="font-bold text-xs sm:text-sm font-display leading-tight line-clamp-1 drop-shadow-xs text-white">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-200 mt-0.5 line-clamp-1 leading-snug opacity-90">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Active Card Spotlight & Controls Strip (Compact & Sleek) ── */}
        <div className="mt-4 sm:mt-5 max-w-2xl mx-auto">
          {/* Active Card Quick Highlight Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 shadow-elevation-1 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {activeItem.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {activeIndex + 1} / {count}
                  </span>
                </div>
                <h4 className="font-bold font-display text-slate-900 text-sm sm:text-base truncate">
                  {activeItem.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {activeItem.description}
                </p>
              </div>

              {/* Prev / Next / Auto-play Controls */}
              <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Oldingi rasm"
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-200 hover:border-blue-300 shadow-2xs cursor-pointer"
                >
                  <FiChevronLeft size={16} />
                </button>

                {/* Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? "Aylanishni to'xtatish" : "Aylanishni boshlash"}
                  title={isPlaying ? "Avtomatik aylanishni to'xtatish" : "Avtomatik aylanishni boshlash"}
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-200 hover:border-blue-300 shadow-2xs cursor-pointer"
                >
                  {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Keyingi rasm"
                  className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-200 hover:border-blue-300 shadow-2xs cursor-pointer"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Indicator Pills / Navigation Dots */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-3">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => rotateToIndex(idx)}
                aria-label={`Rasm ${idx + 1}: ${item.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer h-1.5 ${
                  activeIndex === idx
                    ? 'w-5 sm:w-6 bg-blue-600 shadow-xs shadow-blue-500/40'
                    : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          {/* User helper tip */}
          <p className="text-center text-[10px] sm:text-[11px] text-slate-400 mt-1.5 font-medium">
            {t('home.carouselHint', "Sichqoncha yoki barmog'ingiz bilan aylantiring • Rasmni tanlash uchun ustiga bosing")}
          </p>
        </div>

      </div>
    </section>
  );
}
