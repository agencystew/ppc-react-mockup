/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ppc: {
          purple: {
            50:  '#F3F0FF',
            100: '#E9E3FF',
            200: '#D3C6FF',
            300: '#B08EF4',
            400: '#A88CFF',
            500: '#8057FF',
            600: '#7C45CB',
            700: '#532CCC',
            800: '#3B1F99',
            900: '#170E30',
          },
          neutral: {
            25:  '#FAFAFA',
            50:  '#F2F4F7',
            100: '#E5E5F9',
            200: '#DCDCDC',
            300: '#C5C5E2',
            400: '#A2A2C1',
            500: '#80809C',
            600: '#646477',
            700: '#525266',
            800: '#40404F',
            900: '#26262F',
            950: '#16161A',
          },
          black:  '#0C0C0E',
          white:  '#FFFFFF',
          success: '#17B26A',
          warning: '#FDB022',
          error:   '#F04438',
        },
      },
      fontFamily: {
        sans:    ['Figtree', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Outfit', 'Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['Space Mono', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],
        serif:   ['PF-Marlet-Display', 'Playfair Display', 'Figtree', 'Georgia', 'serif'],
      },
      letterSpacing: {
        'display-xl': '-0.035em',
        'display':    '-0.020em',
        'body':       '-0.010em',
        'eyebrow':    '0.06em',
      },
      lineHeight: {
        'display': '0.965',
        'tight2':  '1.10',
      },
      borderRadius: {
        'pill': '9999px',
      },
      boxShadow: {
        'ppc-sm':   '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        'ppc-md':   '0 4px 8px -2px rgba(16,24,40,0.08), 0 2px 4px -2px rgba(16,24,40,0.04)',
        'ppc-lg':   '0 4px 6px -2px rgba(16,24,40,0.03), 0 12px 16px -4px rgba(16,24,40,0.08)',
        'ppc-cta':  '0 4px 18.4px #463186, 0 0 12.7px #d185ec inset',
        'ppc-glow': '0 0 0 4px rgba(128,87,255,0.18), 0 8px 24px rgba(128,87,255,0.35)',
      },
      backgroundImage: {
        'grad-cta':         'linear-gradient(180deg, #8057FF 0%, #532CCC 100%)',
        'grad-sheen':       'linear-gradient(90deg, rgba(128,87,255,0) 0%, #7C45CB 51%, rgba(121,52,153,0) 100%)',
        'grad-hero-night':  'radial-gradient(120% 80% at 50% 0%, #1A1030 0%, #0C0C0E 60%)',
        'grad-text-accent': 'linear-gradient(86deg, #8057FF 6.62%, #FFB58B 94.93%, #7CF3FB 110.55%)',
      },
    },
  },
  plugins: [],
};
