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
        // Editorial Culinary Brand Tokens (Nefakky Dapur Otentik)
        brand: {
          canvas: '#FBFBFA',
          surface: '#FFFFFF',
          subtle: '#F5F5F4',
          border: '#E7E5E4',
          'border-strong': '#D6D3D1',
          ink: '#1C1917',
          'ink-light': '#44403C',
          muted: '#78716C',
          faint: '#A8A29E',
          terracotta: {
            DEFAULT: '#C2410C',
            hover: '#9A3412',
            active: '#7C2D12',
            light: '#FFF7ED',
            soft: '#FFEDD5',
          },
          amber: {
            DEFAULT: '#D97706',
            hover: '#B45309',
            light: '#FEF3C7',
          },
          forest: {
            DEFAULT: '#15803D',
            light: '#DCFCE7',
          },
          crimson: {
            DEFAULT: '#B91C1C',
            light: '#FEE2E2',
          },
        },
        // Semantic & compatibility mappings
        primary: '#1C1917',
        secondary: '#C2410C',
        background: '#FBFBFA',
        surface: '#FFFFFF',
        error: '#B91C1C',
        'error-container': '#FEE2E2',
        citrus: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          500: '#C2410C',
          600: '#9A3412',
          700: '#7C2D12',
        },
        navy: {
          50: '#FBFBFA',
          100: '#F5F5F4',
          200: '#E7E5E4',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
          950: '#0C0A09',
        },
        gold: {
          400: '#FBBF24',
          500: '#D97706',
          600: '#B45309',
        },
        emerald: {
          500: '#15803D',
          600: '#166534',
          700: '#14532D',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(28, 25, 23, 0.04), 0 1px 2px -1px rgba(28, 25, 23, 0.04)',
        'card': '0 4px 6px -1px rgba(28, 25, 23, 0.04), 0 2px 4px -2px rgba(28, 25, 23, 0.04)',
        'elevated': '0 10px 15px -3px rgba(28, 25, 23, 0.06), 0 4px 6px -4px rgba(28, 25, 23, 0.04)',
        'dropdown': '0 20px 25px -5px rgba(28, 25, 23, 0.08), 0 8px 10px -6px rgba(28, 25, 23, 0.04)',
      },
      borderRadius: {
        'card': '1rem',
        'badge': '9999px',
        'btn': '0.75rem',
      }
    },
  },
  plugins: [],
};

export default config;
