/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'calamity': {
          'bg-dark': 'var(--color-bg-dark)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-tertiary': 'var(--color-bg-tertiary)',

          'primary': 'var(--color-primary)',
          'primary-light': 'var(--color-primary-light)',
          'primary-dark': 'var(--color-primary-dark)',

          'accent-purple': 'var(--color-accent-purple)',
          'accent-gold': 'var(--color-accent-gold)',
          'accent-green': 'var(--color-accent-green)',
          'accent-cyan': 'var(--color-accent-cyan)',

          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary': 'var(--color-text-tertiary)',

          'border': 'var(--color-border)',
          'border-light': 'var(--color-border-light)',
        },
      },
      fontFamily: {
        'display': ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        'body': ['"Crimson Text"', '"Libre Baskerville"', 'serif'],
        'accent': ['"Marcellus SC"', 'serif'],
      },
      spacing: {
        'ma': '15%',
        'ma-lg': '20%',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in',
        'slow-spin': 'spin 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
      boxShadow: {
        'mystical': '0 0 20px rgba(139, 0, 0, 0.3)',
        'mystical-lg': '0 0 40px rgba(139, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
