import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FAF8F5',
          100: '#F5F1EA',
          200: '#EDE6DA',
          300: '#DFD5C5',
          400: '#CBBBA7',
        },
        charcoal: {
          700: '#4A4A4A',
          800: '#333333',
          900: '#222222',
        },
        bronze: {
          500: '#9E7444',
          600: '#8A6337',
          700: '#75522C',
        },
        surface: {
          input: '#F0EEEA',
          border: '#E3DFD7',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 15px rgba(0, 0, 0, 0.03)',
        'floating': '0 30px 60px -20px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
};

export default config;
