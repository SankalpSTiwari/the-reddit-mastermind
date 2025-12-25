import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-reddit-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'monospace'],
      },
      colors: {
        reddit: {
          orange: '#FF4500',
          orangeDark: '#CC3700',
          orangeLight: '#FF6A33',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  safelist: [
    'font-sans',
    // Surface colors
    'bg-surface-50',
    'bg-surface-100',
    'bg-surface-200',
    'bg-surface-300',
    'bg-surface-400',
    'bg-surface-500',
    'bg-surface-600',
    'bg-surface-700',
    'bg-surface-800',
    'bg-surface-900',
    'bg-surface-950',
    'text-surface-50',
    'text-surface-100',
    'text-surface-200',
    'text-surface-300',
    'text-surface-400',
    'text-surface-500',
    'text-surface-600',
    'text-surface-700',
    'text-surface-800',
    'text-surface-900',
    'text-surface-950',
    'border-surface-50',
    'border-surface-100',
    'border-surface-200',
    'border-surface-300',
    'border-surface-400',
    'border-surface-500',
    'border-surface-600',
    'border-surface-700',
    'border-surface-800',
    'border-surface-900',
    'border-surface-950',
    // Reddit colors
    'bg-reddit-orange',
    'bg-reddit-orangeDark',
    'bg-reddit-orangeLight',
    'text-reddit-orange',
    'border-reddit-orange',
  ],
  plugins: [],
};

export default config;
