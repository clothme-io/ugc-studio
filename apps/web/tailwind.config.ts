import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf4f3',
          100: '#fce8e6',
          500: '#e85d4c',
          600: '#d44332',
          700: '#b13426',
        },
      },
    },
  },
  plugins: [],
};

export default config;
