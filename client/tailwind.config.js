/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
            skin: {
                base: 'var(--color-bg-base)',
                'base-secondary': 'var(--color-bg-secondary)',
                'text-base': 'var(--color-text-base)',
                'text-muted': 'var(--color-text-muted)',
                accent: 'var(--color-accent)',
                'accent-hover': 'var(--color-accent-hover)',
                secondary: 'var(--color-secondary)',
                success: 'var(--color-success)',
                danger: 'var(--color-danger)',
                warning: 'var(--color-warning)',
                panel: 'var(--color-panel)',
                border: 'var(--color-border)',
            }
        },
        fontFamily: {
            sans: ['var(--font-primary)', 'sans-serif'],
            display: ['var(--font-display)', 'sans-serif'],
        },
        animation: {
            'float': 'float 6s ease-in-out infinite',
            'bounce-slow': 'bounce 3s infinite',
        },
        keyframes: {
            float: {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-20px)' },
            }
        }
    },
  },
  plugins: [],
}
