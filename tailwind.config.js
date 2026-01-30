/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'jp-green': '#1b3022',
                'jp-black': '#1a1a1b',
                'jp-gold': '#c5a059',
                'jp-red': '#b22d35',
                'jp-paper': '#f9f5eb',
                'off-white': '#f9f3e9',
                'jp-navy': '#0a1622',
            },
            fontFamily: {
                serif: ['"Shippori Mincho"', '"Noto Serif JP"', 'serif'],
            },
        },
    },
    plugins: [],
}

