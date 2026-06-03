/** @type {import('tailwindcss').Config} */
const accentColors = ['brand', 'blue', 'indigo', 'purple', 'pink', 'orange', 'teal']

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: accentColors.flatMap((c) => [
    `from-${c}-400`,
    `to-${c}-600`,
    `bg-${c}-50`,
    `text-${c}-700`,
    `border-${c}-100`,
    `group-hover:text-${c}-600`,
  ]),
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          'Noto Sans KR',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        // Dongwha Design System Primary palette
        brand: {
          50: '#e6f2ee',
          100: '#cce5dd',
          200: '#99cbbb',
          300: '#66b199',
          400: '#339777',
          500: '#00694d',
          600: '#005d44',
          700: '#004d36',
          800: '#003d2b',
          900: '#002b1e',
        },
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover':
          '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
