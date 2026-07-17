/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950:'#080810', 900:'#0c0c18', 800:'#12121f', 700:'#1a1a2e', 600:'#252540' },
        zeviqo: {
          50:'#e8fbff', 100:'#d0f7ff', 200:'#a0efff', 300:'#6ee3ff', 400:'#3dd4ff', 500:'#00c4ff',
          600:'#0098d0', 700:'#0078a8', 800:'#005878', 900:'#003848',
        },
        ember: {
          50:'#fff5ed', 100:'#ffe6d3', 200:'#ffc8a6', 300:'#ffa666', 400:'#ff8527', 500:'#ff6b00',
          600:'#cc5200', 700:'#993d00', 800:'#662900', 900:'#331400',
        },
        gold: {
          50:'#fffaeb', 100:'#fff3c8', 200:'#ffe888', 300:'#ffdc4a', 400:'#ffcc1a', 500:'#f5b800',
          600:'#c49000', 700:'#936c00', 800:'#624800', 900:'#312400',
        },
        plasma: {
          50:'#f5f0ff', 100:'#e8deff', 200:'#d0bcff', 300:'#b494ff', 400:'#9a6dff', 500:'#7a45ff',
          600:'#5c20e6', 700:'#4515b3', 800:'#2e0d80', 900:'#170548',
        },
        cyan: { 300:'#67e8f9', 400:'#22d3ee', 500:'#06b6d4' },
      },
      fontFamily: {
        sans: ['Inter','system-ui','-apple-system','sans-serif'],
        display: ['Poppins','Inter','system-ui','sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,196,255,0.15)',
        'glow-lg': '0 0 40px rgba(0,196,255,0.25)',
        'glow-ember': '0 0 20px rgba(255,107,0,0.2)',
      },
      animation: {
        'progress-shimmer':'progress-shimmer 2s linear infinite',
        'fade-in':'fade-in 0.3s ease-out',
        'slide-up':'slide-up 0.25s ease-out',
        'scale-in':'scale-in 0.2s ease-out',
        'bounce-in':'bounce-in 0.5s cubic-bezier(0.68,-0.55,0.265,1.55)',
        'route-draw':'route-draw 1.5s ease-out forwards',
        'pulse-glow':'pulse-glow 2s ease-in-out infinite',
        'float':'float 3s ease-in-out infinite',
        'shimmer':'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'progress-shimmer': { '0%':{transform:'translateX(-100%)'}, '100%':{transform:'translateX(100%)'} },
        'fade-in': { '0%':{opacity:'0',transform:'translateY(4px)'}, '100%':{opacity:'1',transform:'translateY(0)'} },
        'slide-up': { '0%':{transform:'translateY(100%)'}, '100%':{transform:'translateY(0)'} },
        'scale-in': { '0%':{opacity:'0',transform:'scale(0.95)'}, '100%':{opacity:'1',transform:'scale(1)'} },
        'bounce-in': { '0%':{opacity:'0',transform:'scale(0.3)'}, '50%':{transform:'scale(1.05)'}, '70%':{transform:'scale(0.9)'}, '100%':{opacity:'1',transform:'scale(1)'} },
        'route-draw': { '0%':{strokeDashoffset:'1000'}, '100%':{strokeDashoffset:'0'} },
        'pulse-glow': { '0%,100%':{opacity:'0.3'}, '50%':{opacity:'0.6'} },
        'float': { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-8px)'} },
        'shimmer': { '0%':{backgroundPosition:'-200% 0'}, '100%':{backgroundPosition:'200% 0'} },
      },
    },
  },
  plugins: [],
};
