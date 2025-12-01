/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // R Pralas brand colors
        'pralas-teal': {
          50: '#F0FFFE',
          100: '#CCFBF8',
          200: '#99F7F1',
          300: '#5FF3EA',
          400: '#2ECCC9',
          500: '#1DB5B1',
          600: '#17A2A2',
          700: '#127F83',
          800: '#115C66',
          900: '#0D3F48',
        },
        'pralas-gold': {
          50: '#FFFBF0',
          100: '#FFF3D6',
          200: '#FFE5A6',
          300: '#FFD76F',
          400: '#FFC700',
          500: '#FFD700',
          600: '#F4B913',
          700: '#D9980E',
          800: '#B8760B',
          900: '#8F5A08',
        },
      },
    },
  },
  plugins: [],
};

