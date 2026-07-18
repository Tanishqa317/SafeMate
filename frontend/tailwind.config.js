/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#030305',
        panel: 'rgba(9, 10, 15, 0.65)',
        edge: 'rgba(255, 255, 255, 0.04)',
        mint: {
          DEFAULT: '#00ffaa',
          glow: 'rgba(0, 255, 170, 0.3)',
        },
        amber: {
          cyber: '#ffaa00',
          glow: 'rgba(255, 170, 0, 0.3)',
        },
        crimson: {
          vitals: '#ff1e56',
          glow: 'rgba(255, 30, 86, 0.5)',
        },
        slate: {
          hud: '#8a94a6',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        md: '12px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan-line': 'scanline 6s linear infinite',
        flicker: 'flicker 0.1s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
