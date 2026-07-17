/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zeviqo: {
          50: '#e6f9ff', 100: '#ccf3ff', 200: '#99e7ff', 300: '#66dbff',
          400: '#33cfff', 500: '#00c4ff', 600: '#009ecc', 700: '#006b99',
          800: '#004466', 900: '#002233'
        },
        ember: {
          50: '#fff3e6', 100: '#ffe6cc', 200: '#ffcc99', 300: '#ffb366',
          400: '#ff9933', 500: '#ff6b00', 600: '#cc5500', 700: '#993f00',
          800: '#662a00', 900: '#331500'
        },
        gold: {
          50: '#fffbe6', 100: '#fff7cc', 200: '#fff099', 300: '#ffe866',
          400: '#ffe033', 500: '#f5b800', 600: '#c49900', 700: '#927300',
          800: '#614d00', 900: '#302700'
        },
        plasma: {
          50: '#f3e6ff', 100: '#e6ccff', 200: '#cc99ff', 300: '#b366ff',
          400: '#9a33ff', 500: '#7a45ff', 600: '#6233cc', 700: '#492299',
          800: '#311166', 900: '#180833'
        },
        cyan: {
          50: '#e6fcff', 100: '#b3f9ff', 200: '#80f5ff', 300: '#4df2ff',
          400: '#1aefff', 500: '#00dcef', 600: '#00b3c4', 700: '#008799',
          800: '#005a66', 900: '#002d33'
        },
        ink: {
          50: '#f5f5fa', 100: '#e6e6f0', 200: '#ccccdd', 300: '#b3b3cc',
          400: '#9999bb', 500: '#8080aa', 600: '#666688', 700: '#4d4d66',
          800: '#333344', 900: '#1a1a22', 950: '#080810'
        }
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'route-draw': 'route-draw 2s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards'
      },
      keyframes: {
        'route-draw': { '0%': { strokeDashoffset: '1000' }, '100%': { strokeDashoffset: '0' } },
        'pulse-glow': { '0%, 100%': { opacity: '0.6', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.05)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } }
      }
    }
  },
  plugins: []
};
