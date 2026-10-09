import { motion } from 'framer-motion';

/**
 * HeroGeometricEdges — Restored decorative geometric edge & corner elements
 * Subtle, floating, light-blue & blue, responsive, pointer-events-none.
 */
export default function HeroGeometricEdges() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* ─── Upper-Mid Side Floating Elements (Well below header zone) ─── */}
      <motion.div
        animate={{
          y: [5, -5, 5],
          rotate: [8, 14, 8],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-44 left-8 sm:left-24 w-16 h-16 sm:w-20 sm:h-20 rounded-xl border border-blue-200/50 bg-blue-100/25"
      />
      <motion.div
        animate={{
          y: [6, -6, 6],
          rotate: [-8, -4, -8],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-48 right-8 sm:right-28 w-14 h-14 sm:w-18 sm:h-18 rounded-2xl border border-sky-300/40 bg-sky-200/20"
      />

      {/* ─── Middle / Outer Edge Rectangles ─── */}
      <motion.div
        animate={{
          x: [-4, 4, -4],
          rotate: [45, 50, 45],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden lg:block absolute top-1/2 -left-8 w-24 h-24 rounded-2xl border border-blue-300/30 bg-blue-50/50"
      />
      <motion.div
        animate={{
          x: [4, -4, 4],
          rotate: [-35, -30, -35],
          opacity: [0.3, 0.55, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="hidden lg:block absolute top-1/2 -right-8 w-24 h-24 rounded-2xl border border-blue-300/30 bg-blue-50/50"
      />

      {/* ─── Bottom-Left Corner Geometric Rectangles ─── */}
      <motion.div
        animate={{
          y: [7, -7, 7],
          rotate: [6, 10, 6],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute bottom-16 -left-6 sm:left-8 w-32 h-18 sm:w-40 sm:h-22 rounded-2xl border border-blue-300/35 bg-gradient-to-tr from-blue-500/10 to-transparent"
      />

      {/* ─── Bottom-Right Corner Geometric Rectangles ─── */}
      <motion.div
        animate={{
          y: [-7, 7, -7],
          rotate: [-10, -6, -10],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute bottom-20 -right-6 sm:right-12 w-28 h-20 sm:w-36 sm:h-24 rounded-3xl border border-blue-400/30 bg-gradient-to-tl from-blue-600/10 via-sky-300/5 to-transparent"
      />
    </div>
  );
}
