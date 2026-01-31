/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'jp-pure-white': '#ffffff',
                'jp-soft-gray': '#f8f9fa',
                'jp-border': '#e0e0e0',
                'jp-dark': '#2d3436',
                'jp-muted': '#636e72',
                'jp-gold': '#c5a059',
                'jp-red': '#b22d35',
            },
            fontFamily: {
                serif: ['"Shippori Mincho"', '"Noto Serif JP"', 'serif'],
            },
        },
    },
    plugins: [],
}

