const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#000000',
        paper: '#ffffff',
        surface: '#F0F0F3',
        'surface-selected': '#E0E1E6',
        muted: '#60646C',
        brand: '#3c87f7',
        splash: '#208AEF',
        line: '#E0E1E6',
        field: '#F6F7F9',
        placeholder: '#8B8D98',
        'brand-soft': '#EEF5FF',
        'brand-line': '#BFD8FB',
        danger: '#DC2626',
        'danger-soft': '#FEE2E2',
        success: '#2F855A',
      },
      spacing: {
        half: '2px',
        one: '4px',
        two: '8px',
        three: '16px',
        four: '24px',
        five: '32px',
        six: '64px',
      },
      borderRadius: {
        half: '2px',
        one: '4px',
        two: '8px',
        three: '16px',
        four: '24px',
        five: '32px',
        six: '64px',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      maxWidth: {
        content: '800px',
      },
    },
  },
  plugins: [],
};
