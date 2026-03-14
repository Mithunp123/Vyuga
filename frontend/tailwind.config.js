/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        hero: ['Syne', 'Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'Outfit', 'ui-monospace', 'monospace'],
        impact: ['"Bebas Neue"', 'Outfit', 'ui-sans-serif', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        marker: ['"Permanent Marker"', 'cursive'],
      },
      colors: {
        brand: {
          cyan: '#0197B2',
          'cyan-light': '#e0f6fa',
          lime: '#5BCB2B',
          'lime-light': '#e8f9de',
        },
      },
    },
  },
}

