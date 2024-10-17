import type { Config } from 'tailwindcss';

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: 'var(--background-primary)',
        bgSecondary: 'var(--background-secondary)',
        indicoPrimary: 'var(--indico-primary)',
        indicoSecondary: 'var(--indico-secondary)',
      },
      fontFamily: {
        cabin: ['Cabin', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
