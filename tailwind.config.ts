import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#F15A22',
          dim: '#F15A2214',
          mid: '#F15A2240',
        },
        base: '#0D0D0D',
        surface: {
          1: '#111111',
          2: '#1A1A1A',
          3: '#222222',
        },
        footer: '#080808',
        text: {
          primary: '#F5F0EB',
          body: '#C8C4BF',
          muted: '#6B6760',
        },
      },
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
