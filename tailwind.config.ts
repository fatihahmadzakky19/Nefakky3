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
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        orange: {
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
        },
        emerald: {
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        coral: {
          500: '#F43F5E',
          600: '#E11D48',
        },
        cream: {
          50: '#FAF9F6',
          100: '#F4F1EA',
          200: '#EAE5D9',
          300: '#DDD5C4',
          400: '#CBBBA7',
        },
        charcoal: {
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        bronze: {
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        surface: {
          input: '#F8F6F0',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'soft-card': '0 10px 30px -5px rgba(249, 115, 22, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
        'vibrant': '0 12px 35px -8px rgba(234, 88, 12, 0.25)',
        'floating': '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
      }
    },
  },
  plugins: [],
};

export default config;
