/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // PRIMARY — Orange (RCEE college brand)
                primary: {
                    50:  '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    950: '#431407',
                },
                // ACCENT — warm gold / amber
                accent: {
                    50:  '#fffbeb',
                    100: '#fef3c7',
                    200: '#fde68a',
                    300: '#fcd34d',
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                    700: '#b45309',
                    800: '#92400e',
                    900: '#78350f',
                    950: '#451a03',
                },
                // NEUTRAL greys
                dark: {
                    50:  '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                    950: '#0c0a09',
                },
            },
            fontFamily: {
                sans:    ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Poppins', 'Inter', 'sans-serif'],
            },
            backgroundImage: {
                'orange-gradient': 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)',
                'orange-soft':     'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                'hero-gradient':   'linear-gradient(135deg, #7c2d12 0%, #c2410c 40%, #ea580c 100%)',
            },
            boxShadow: {
                'orange-sm':  '0 1px 3px rgba(234,88,12,0.15)',
                'orange-md':  '0 4px 14px rgba(234,88,12,0.2)',
                'orange-lg':  '0 10px 30px rgba(234,88,12,0.25)',
                'orange-glow':'0 0 20px rgba(249,115,22,0.35)',
            },
            animation: {
                'fade-in':    'fadeIn 0.4s ease-out',
                'slide-up':   'slideUp 0.4s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn:   { '0%': { opacity: '0' },                       '100%': { opacity: '1' } },
                slideUp:  { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                pulseSoft:{ '0%,100%': { opacity: '1' },                  '50%':  { opacity: '0.6' } },
            },
        },
    },
    plugins: [],
};
