import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#059669',
        secondary: '#10B981',
        cta: '#FBBF24',
        background: '#ECFDF5',
        text: '#064E3B',
        cyan: {
          primary: '#0891B2',
          secondary: '#22D3EE',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      borderRadius: {
        'organic': '24px',
        'organic-lg': '32px',
      },
      boxShadow: {
        'organic': '0 8px 32px rgba(0,0,0,0.08)',
        'organic-lg': '0 12px 48px rgba(0,0,0,0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}
export default config