/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:  'var(--color-bg-primary)',
          surface:  'var(--color-bg-surface)',
          card:     'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        accent: {
          gold:        '#C9A84C',
          'gold-light':'#F0D98A',
          'gold-dark': '#A8873A',
          'gold-muted':'#8A6B2E',
          green:       '#52B788',
          'green-dark':'#3A8A64',
          amber:       '#D97706',
          teal:        '#0D9488',
          red:         '#E05252',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
          faint:     'var(--color-text-faint)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          light:   'var(--color-border-light)',
          gold:    '#C9A84C',
        },
      },
      fontFamily: {
        arabic: ['Amiri', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        arabic: ['22px', { lineHeight: '1.9' }],
        'arabic-lg': ['26px', { lineHeight: '1.9' }],
        'arabic-sm': ['18px', { lineHeight: '1.9' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'counter-pop': 'counterPop 0.18s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0.35)' },
          '50%': { boxShadow: '0 0 0 10px rgba(201,168,76,0)' },
        },
        counterPop: {
          '0%': { transform: 'scale(1.25)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        gold: '0 0 20px rgba(201,168,76,0.18)',
        'gold-md': '0 0 32px rgba(201,168,76,0.25)',
        card: '0 2px 12px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
