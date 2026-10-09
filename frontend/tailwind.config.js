/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // School White + Blue Palette
        school: {
          50: '#f0f6ff',   // Very light blue tint
          100: '#e0edff',  // Soft ice blue
          200: '#bae0fd',  // Light sky tint
          300: '#7cc4fa',
          400: '#38a5f6',
          500: '#0f87ee',  // Vibrant primary
          600: '#0066cc',  // Core School Blue
          700: '#0052a8',  // Deep School Blue
          800: '#044487',
          900: '#0a3a6f',  // Dark royal blue
          950: '#062347',  // Deepest blue
        },
        navy: {
          50: '#f4f6fa',
          100: '#e8ecf4',
          200: '#ced7e8',
          300: '#a5b7d4',
          400: '#7590bd',
          500: '#5271a6',
          600: '#3d5687',
          700: '#32456e',
          800: '#1e2942',
          900: '#0f172a',  // Deep Navy for dark sections/footer
          950: '#080d1a',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0b132b',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.04)',
        'subtle': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        'card': '0 2px 16px -2px rgba(15,23,42,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'card-hover': '0 16px 48px -8px rgba(0,102,204,0.18), 0 6px 20px -4px rgba(15,23,42,0.08)',
        'glow': '0 0 28px rgba(0,102,204,0.25), 0 4px 16px rgba(0,102,204,0.15)',
        'glow-lg': '0 0 56px rgba(0,102,204,0.38), 0 8px 32px rgba(0,102,204,0.2)',
        'btn': '0 4px 14px -2px rgba(0,102,204,0.38), 0 2px 6px rgba(0,0,0,0.08)',
        'btn-hover': '0 8px 24px -4px rgba(0,102,204,0.48), 0 4px 12px rgba(0,0,0,0.1)',
        'inner-glow': 'inset 0 0 20px rgba(0,102,204,0.08)',
        'elevation-1': '0 2px 8px -1px rgba(15,23,42,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'elevation-2': '0 4px 20px -4px rgba(15,23,42,0.10), 0 2px 8px -2px rgba(0,0,0,0.06)',
        'elevation-3': '0 12px 40px -8px rgba(15,23,42,0.14), 0 4px 16px -4px rgba(0,0,0,0.06)',
        'elevation-4': '0 24px 64px -12px rgba(15,23,42,0.18), 0 8px 24px -4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-gentle': 'floatGentle 7s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'blob-float': 'blobFloat 22s ease-in-out infinite',
        'breathe': 'breathe 7s ease-in-out infinite',
        'drift-slow': 'driftSlow 28s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(1.5deg)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        blobFloat: {
          '0%, 100%': { transform: 'translate(0,0) scale(1) rotate(0deg)' },
          '25%': { transform: 'translate(22px,-35px) scale(1.06) rotate(4deg)' },
          '50%': { transform: 'translate(-18px,22px) scale(0.97) rotate(-3deg)' },
          '75%': { transform: 'translate(28px,12px) scale(1.04) rotate(2deg)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.07', transform: 'scale(1)' },
          '50%': { opacity: '0.15', transform: 'scale(1.09)' },
        },
        driftSlow: {
          '0%, 100%': { transform: 'translateX(0) translateY(0)' },
          '33%': { transform: 'translateX(18px) translateY(-12px)' },
          '66%': { transform: 'translateX(-12px) translateY(10px)' },
        },
      },
    },
  },
  plugins: [],
};
