/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Mode Mystical Palette
        'calamity': {
          // Background
          'bg-dark': '#1a0f0f',      // Carmesim muito escuro
          'bg-secondary': '#2d1a1a', // Carmesim escuro
          'bg-tertiary': '#3d2626',  // Carmesim médio
          
          // Primary
          'primary': '#8b0000',       // Vermelho sangue
          'primary-light': '#a00000', // Vermelho sangue claro
          'primary-dark': '#6b0000',  // Vermelho sangue escuro
          
          // Accents
          'accent-purple': '#6a0dad', // Roxo ametista
          'accent-gold': '#b8860b',   // Dourado antigo
          'accent-green': '#556b2f',  // Verde musgo
          'accent-cyan': '#4a7c7e',   // Cyan místico
          
          // Text
          'text-primary': '#e0d5d0',    // Creme claro
          'text-secondary': '#a89080', // Creme acinzentado
          'text-tertiary': '#6d5d50',  // Creme escuro
          
          // Border
          'border': '#5a3a3a',        // Carmesim médio
          'border-light': '#7a5a5a',  // Carmesim claro
        },
      },
      fontFamily: {
        'display': ['"Cinzel"', '"Cormorant Garamond"', 'serif'],
        'body': ['"Crimson Text"', '"Libre Baskerville"', 'serif'],
        'accent': ['"Marcellus SC"', 'serif'],
      },
      fontSize: {
        // Proportions based on golden ratio
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.35rem',      // 21.6px (1rem * 1.35)
        '2xl': '1.618rem',    // 25.88px (golden ratio)
        '3xl': '2.118rem',    // 33.88px (1.618 * 1.618)
        '4xl': '2.618rem',    // 41.88px
        '5xl': '3.236rem',    // 51.77px
        '6xl': '4.236rem',    // 67.77px
      },
      spacing: {
        'ma': '15%',  // Ma (negative space)
        'ma-lg': '20%',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-in',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'glow': 'glow 3s ease-in-out infinite',
        'slow-spin': 'spin 60s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 10px rgba(139, 0, 0, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(139, 0, 0, 0.8)',
          },
        },
      },
      transitionDuration: {
        '800': '800ms',
        '1200': '1200ms',
      },
      backgroundImage: {
        'mystical-gradient': 'linear-gradient(135deg, #1a0f0f 0%, #2d1a1a 50%, #3d2626 100%)',
      },
      boxShadow: {
        'mystical': '0 0 20px rgba(139, 0, 0, 0.3)',
        'mystical-lg': '0 0 40px rgba(139, 0, 0, 0.4)',
        'glow-gold': '0 0 20px rgba(184, 134, 11, 0.2)',
      },
    },
  },
  plugins: [],
}
