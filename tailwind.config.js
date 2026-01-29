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
            },
            fontFamily: {
                serif: ['"Noto Serif JP"', 'serif'],
            },
        },
    },
    plugins: [],
}
