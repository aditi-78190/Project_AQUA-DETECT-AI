/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: {
          950: '#04070d',
          900: '#070d18',
          850: '#0a1220',
          800: '#0d1626',
          700: '#13203a',
          600: '#1a2d4d',
          500: '#243d63',
          400: '#345582',
        },
        sonar: {
          50: '#e6fbff',
          100: '#b3f3ff',
          200: '#80ebff',
          300: '#4de3ff',
          400: '#1ad9ff',
          500: '#00c2e6',
          600: '#0099bd',
          700: '#00708c',
          800: '#00475a',
          900: '#002430',
        },
        bio: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warn: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        anomaly: {
          400: '#c084fc',
          500: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 194, 230, 0.25)',
        'glow-lg': '0 0 48px rgba(0, 194, 230, 0.35)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'grid-sonar': "linear-gradient(rgba(0,194,230,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,230,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        ping2: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        ping2: 'ping2 2.4s cubic-bezier(0,0,0.2,1) infinite',
        sweep: 'sweep 4s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
