/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          950: '#0A1628',
          900: '#0F2040',
          800: '#1A3A5C',
          700: '#1E4D7B',
          600: '#1D6FA4',
          500: '#2B8AC6',
          100: '#DBEAFE',
          50: '#EFF6FF',
        },
        accent: {
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          100: '#D1FAE5',
          50: '#ECFDF5',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(15,32,64,0.08)',
        sidebar: '4px 0 24px rgba(10,22,40,0.15)',
        button: '0 2px 8px rgba(29,111,164,0.25)',
      },
    },
  },
  plugins: [],
};
