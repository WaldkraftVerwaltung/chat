import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slack: {
          aubergine: '#3F0E40',
          'aubergine-light': '#522653',
          'aubergine-dark': '#350D36',
          hover: '#4A154B',
          active: '#1164A3',
          text: '#CFC3CF',
          'text-bright': '#FFFFFF',
          green: '#007A5A',
          'green-hover': '#005E46',
          red: '#E01E5A',
          blue: '#1264A3',
          'mention-bg': '#E8F5FA',
          border: '#E8E8E8',
          'msg-hover': '#F8F8F8',
          'gray-text': '#616061',
          'input-border': '#C4C4C4',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
