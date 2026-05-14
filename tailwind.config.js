/** @type {import('tailwindcss').Config}
 *
 * PPC.io app design system — v5 ("moments not modes")
 * Spec: docs/design-system/DESIGN-SYSTEM.md
 * Source artifacts: docs/design-system/v5-source-artifacts/*.html
 *
 * v5 supersedes the prior canonical brand purple (#8057FF) and smoky black (#0C0C0E)
 * for app surfaces. Marketing site (~/ppc-frontend/) is a separate decision.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* v2 short tokens — Foundation phase 2026-05-14.
         * Used by brand primitives (Sticker, PillButton, Caveat, Mascot) and
         * the v2 page rebuilds. Legacy ppc-* tokens preserved below. */
        ink: '#0F0A1E',
        canvas: '#ECEAFA',   /* Lavender — alias of ppc.canvas for v2 page surfaces */
        purple: '#7F5AF0',   /* Alias of ppc.purple.500 for primary accents */
        redorange: '#F24A2E',
        mint: '#BFE9CC',
        ivory: '#FAF7F0',
        ppc: {
          /* PRIMARY purple — v5: #7F5AF0. Use ONCE per screen max. */
          purple: {
            50:  '#F3F0FF',
            100: '#E9E3FF',
            200: '#D3C6FF',
            300: '#B08EF4',
            400: '#A88CFF',
            500: '#7F5AF0',  /* v5 primary (was #8057FF) */
            600: '#7C45CB',
            700: '#534AB7',  /* v5 accent text/icons (was #532CCC) */
            800: '#3C3489',  /* v5 chip text (was #3B1F99) */
            900: '#170E30',
          },

          /* v5 surface tokens */
          sidebar:    '#0F0A1E',  /* Surface 01 — always dark rail */
          canvas:     '#ECEAFA',  /* Lavender — the only main bg, never pure white */
          card:       '#FFFFFF',
          'card-border': '#d9d4ec',  /* 0.5px solid on every card */
          'panel-soft': '#EEEDFE',  /* "You walk away with" panel + chip bg */

          /* v5 text scale */
          ink:          '#1a1625',  /* primary text on light */
          'text-muted': '#6b6480',  /* secondary text */
          'text-faint': '#b0a9c2',  /* stage numbers, timing, faint UI */
          'text-on-dark': '#b8aeda',  /* sub-text inside dark hero / sticky CTA */

          /* v5 status strips (3px left-border on white cards — Surface 04) */
          status: {
            critical: '#E24B4A',
            warning:  '#BA7517',
            healthy:  '#5DCAA5',
          },

          /* Legacy / general neutrals — retained for backward compat */
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
          black:  '#0C0C0E',  /* legacy "Smoky Black" — use ppc-sidebar for app rails */
          white:  '#FFFFFF',
          success: '#17B26A',
          warning: '#FDB022',
          error:   '#F04438',
        },
      },
      fontFamily: {
        sans:    ['Figtree', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],  /* v5: display = Figtree 800/900, not Outfit */
        mono:    ['"Courier New"', 'ui-monospace', 'Menlo', 'Consolas', 'monospace'],  /* v5: eyebrows + timing */
        serif:   ['PF-Marlet-Display', 'Playfair Display', 'Figtree', 'Georgia', 'serif'],
        hand:    ['Caveat', 'cursive'],  /* v2 — red-orange handwritten annotation */
      },
      letterSpacing: {
        'display-xl': '-0.035em',  /* Figtree 900 / 88px */
        'display':    '-0.025em',  /* Figtree 800 / 38px section H1 */
        'h2':         '-0.020em',
        'body':       '-0.010em',
        'eyebrow':    '0.06em',
        'mono':       '0.012em',
      },
      lineHeight: {
        'display-cinema': '0.92',   /* Surface 03 cinema headline */
        'display-h1':     '1.00',
        'display-h2':     '1.05',
        'display':        '0.965',
        'tight2':         '1.10',
      },
      borderRadius: {
        'pill':    '9999px',
        'card-lg': '14px',  /* outer card on lavender */
        'card':    '12px',  /* inner / smaller card */
        'badge':   '4px',   /* phase badge */
        'chip':    '12px',
      },
      boxShadow: {
        /* No drop-shadows on cards on lavender. Border is the edge. */
        'ppc-glow':  '0 0 0 4px rgba(127,90,240,0.18), 0 8px 24px rgba(127,90,240,0.35)',
        'ppc-cta':   '0 4px 18.4px #463186, 0 0 12.7px #d185ec inset',
        /* v2 primitives — hard offset shadow (after-click sticker recipe). */
        'sticker':   '6px 6px 0 #0F0A1E',
        'btn':       '0 4px 0 #0F0A1E',
      },
      backgroundImage: {
        /* v5 hero radial — drop into the top-right of any dark hero / sticky CTA */
        'grad-hero-glow':      'radial-gradient(circle, rgba(127,90,240,0.30) 0%, transparent 60%)',
        'grad-hero-glow-soft': 'radial-gradient(circle, rgba(127,90,240,0.25) 0%, transparent 65%)',
        'grad-cta':            'linear-gradient(180deg, #7F5AF0 0%, #534AB7 100%)',
        'grad-sheen':          'linear-gradient(90deg, rgba(127,90,240,0) 0%, #534AB7 51%, rgba(83,74,183,0) 100%)',
        'grad-hero-night':     'radial-gradient(120% 80% at 50% 0%, #1A1030 0%, #0F0A1E 60%)',
      },
    },
  },
  plugins: [],
};
