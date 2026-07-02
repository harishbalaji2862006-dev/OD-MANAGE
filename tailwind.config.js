/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cozy: '#8C82F2',
          light: '#F1EEFE',
          dark: '#675CC4',
        },
        cozy: {
          lavender: '#E8E5F7',
          'lavender-dark': '#8C82F2',
          blue: '#E0ECF8',
          'blue-dark': '#4A90E2',
          green: '#E3F5EC',
          'green-dark': '#3BB77E',
          cream: '#FDFBF7',
          peach: '#FCEEE8',
          'peach-dark': '#E07A5F',
          beige: '#FAF8F3',
          slate: '#4A5568',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        'cozy-lg': '18px',
        'cozy-xl': '24px',
      },
      boxShadow: {
        'cozy': '0 8px 30px rgb(0 0 0 / 0.03)',
        'cozy-hover': '0 12px 40px rgb(0 0 0 / 0.06)',
        'glass': '0 8px 32px 0 rgba(140, 130, 242, 0.03)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 4s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
    },
  },
  plugins: [],
}
