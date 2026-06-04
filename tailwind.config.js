/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000',
        'surface': '#111',
        'surface-elevated': '#1a1a1a',
        'text-primary': '#f5f5f7',
        'text-secondary': '#a1a1a6',
        'text-tertiary': '#6e6e73',
        'gold': '#d4a853',
        'gold-hover': '#c49a3f',
        'red': '#bf3a30',
        'red-hover': '#a33229',
        'border': 'rgba(255,255,255,0.06)',
        'border-active': 'rgba(255,255,255,0.12)',
        'glass-bg': 'rgba(0,0,0,0.72)',
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
          '"SF Pro Text"', '"Helvetica Neue"', 'Arial', 'sans-serif'
        ],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-lg': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
        'subhead': ['1.0625rem', { lineHeight: '1.47', letterSpacing: '-0.01em' }],
      },
      spacing: {
        'section': '6rem',
        'section-lg': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.8s ease-out',
        'toast-in': 'toastIn 0.4s ease-out',
        'toast-out': 'toastOut 0.3s ease-in forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        toastOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
