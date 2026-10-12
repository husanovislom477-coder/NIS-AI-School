import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Keyboard, A11y } from 'swiper/modules';
import { schoolGalleryData } from '../../data/schoolGalleryData';

// Core Swiper CSS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * SchoolGallerySwiper — Recreated EXACTLY like the user's reference screenshot:
 * - Single full-bleed slide container with rounded-[32px] corners
 * - NO text, NO "Slide 1 / Slide 2", NO words at all over the slides
 * - Sleek, pure white open chevron arrows on left and right borders
 * - Horizontal row of circular pagination dots at bottom center (active = solid white)
 * - Pure high-quality photography and atmosphere
 * - Full responsive adaptation across mobile, tablet, and desktop
 */
export default function SchoolGallerySwiper({
  slides = schoolGalleryData,
  className = '',
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mq.matches);
    }
  }, []);

  return (
    <section className={`relative py-10 sm:py-14 overflow-hidden ${className}`}>
      <div className="container-custom">
        {/* Main Slider Wrapper Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Card Frame matching reference rounded corners, shadow, and aspect ratio */}
          <div className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950 aspect-[16/9] min-h-[260px] xs:min-h-[320px] sm:min-h-[400px] md:min-h-[480px]">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, Keyboard, A11y]}
              navigation={{
                prevEl: '#nis-ref-slider-prev',
                nextEl: '#nis-ref-slider-next',
              }}
              pagination={{
                el: '#nis-ref-slider-pagination',
                clickable: true,
                bulletClass: 'nis-ref-bullet',
                bulletActiveClass: 'nis-ref-bullet-active',
              }}
              keyboard={{ enabled: true }}
              autoplay={
                !reducedMotion
                  ? {
                      delay: 4500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                  : false
              }
              loop={true}
              speed={600}
              grabCursor={true}
              slidesPerView={1}
              className="w-full h-full"
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={slide.id || index} className="w-full h-full relative select-none">
                  {/* Background School Photography Layer */}
                  <img
                    src={slide.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Gradient Overlay matching reference rich blue/indigo tone */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-blue-950/40 to-purple-950/60 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20" />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Left Sleek Navigation Arrow matching reference screenshot */}
            <button
              type="button"
              id="nis-ref-slider-prev"
              aria-label="Previous slide"
              className="absolute left-3 xs:left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 z-20 text-white/75 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer p-1 sm:p-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            >
              <svg
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-14 md:h-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Sleek Navigation Arrow matching reference screenshot */}
            <button
              type="button"
              id="nis-ref-slider-next"
              aria-label="Next slide"
              className="absolute right-3 xs:right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 z-20 text-white/75 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer p-1 sm:p-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
            >
              <svg
                className="w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-14 md:h-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Bottom Center Circular Pagination Dots matching reference screenshot */}
            <div
              id="nis-ref-slider-pagination"
              className="absolute bottom-4 sm:bottom-6 md:bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 sm:gap-2.5 pointer-events-auto"
            />
          </div>
        </div>
      </div>

      {/* Styles for Pagination Indicators matching reference dots */}
      <style>{`
        .nis-ref-bullet {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.38);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          display: inline-block;
        }
        @media (min-width: 640px) {
          .nis-ref-bullet {
            width: 9px;
            height: 9px;
          }
        }
        .nis-ref-bullet:hover {
          background: rgba(255, 255, 255, 0.75);
        }
        .nis-ref-bullet-active {
          background: #ffffff !important;
          transform: scale(1.2);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </section>
  );
}
