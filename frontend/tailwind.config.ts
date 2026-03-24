import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white:   'rgb(var(--color-white) / <alpha-value>)',
        navy:    { DEFAULT: 'rgb(var(--color-navy) / <alpha-value>)' },
        violet:  { DEFAULT: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
        cyan:    { DEFAULT: '#06B6D4', light: '#67E8F9' },
        emerald: { DEFAULT: '#10B981' },
        amber:   { DEFAULT: '#F59E0B' },
        rose:    { DEFAULT: '#EF4444' },
        slate:   { 
          300: 'rgb(var(--color-slate-300) / <alpha-value>)',
          400: 'rgb(var(--color-slate-400) / <alpha-value>)', 
          500: 'rgb(var(--color-slate-500) / <alpha-value>)' 
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'aletheia-hero': 'radial-gradient(ellipse at 50% 0%, var(--hero-center) 0%, var(--hero-edge) 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        }
      }
    }
  },
  plugins: [],
};
export default config;
