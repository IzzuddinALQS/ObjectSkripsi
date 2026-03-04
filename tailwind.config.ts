import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F4C81',
                accent: '#F59E0B',
                success: '#10B981',
                danger: '#EF4444',
                warning: '#FBBF24',
                background: '#F3F4F6',
                card: '#FFFFFF',
                text: {
                    main: '#1F2937',
                    secondary: '#6B7280',
                },
            },
        },
    },
    plugins: [],
};
export default config;
