// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}", // Esto es importante para Next.js App Router
        "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Para Pages Router (si también lo usas)
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        // Asegúrate de que cubre todas las carpetas donde usas clases de Tailwind
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};