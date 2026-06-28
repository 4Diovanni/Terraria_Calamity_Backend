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
          // Backgrounds
          'bg-dark':      'var(--color-bg-dark)',
          'bg-secondary': 'var(--color-bg-secondary)',
          'bg-tertiary':  'var(--color-bg-tertiary)',

          // Primary (danger / negação / main CTA)
          'primary':       'var(--color-primary)',
          'primary-light': 'var(--color-primary-light)',
          'primary-dark':  'var(--color-primary-dark)',
          'danger':        'var(--color-primary)',

          // Accents
          'accent-purple':       'var(--color-accent-purple)',
          'accent-purple-light': 'var(--color-accent-purple-light)',
          'accent-purple-dark':  'var(--color-accent-purple-dark)',
          'accent-gold':         'var(--color-accent-gold)',
          'accent-green':        'var(--color-accent-green)',
          'accent-blue':         'var(--color-accent-blue)',
          'accent-cyan':         'var(--color-accent-cyan)',

          // Semantic aliases
          'success': 'var(--color-accent-green)',

          // Text
          'text-primary':   'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'text-tertiary':  'var(--color-text-tertiary)',

          // Borders
          'border':       'var(--color-border)',
          'border-light': 'var(--color-border-light)',
        },
      },
      fontFamily: {
        'display': ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        'body':    ['"Crimson Text"', '"Libre Baskerville"', 'serif'],
        'accent':  ['"Marcellus SC"', 'serif'],
      },
      spacing: {
        'ma':    '15%',
        'ma-lg': '20%',
      },
      animation: {
        'fade-in':  'fadeIn 0.8s ease-in',
        'slow-spin': 'spin 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionDuration: {
        '800':  '800ms',
        '1200': '1200ms',
      },
      boxShadow: {
        'mystical':    '0 0 20px rgba(155, 28, 28, 0.3)',
        'mystical-lg': '0 0 40px rgba(155, 28, 28, 0.4)',
        'glow-gold':   '0 0 15px rgba(212, 160, 23, 0.5), 0 0 30px rgba(212, 160, 23, 0.2)',
        'glow-purple': '0 0 15px rgba(124, 58, 237, 0.4)',
      },
    },
  },
  plugins: [],
}
