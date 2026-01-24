/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.5715" }],
        base: ["1rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        xl: ["1.25rem", { lineHeight: "1.5", letterSpacing: "-0.017em" }],
        "2xl": ["1.5rem", { lineHeight: "1.415", letterSpacing: "-0.017em" }],
        "3xl": [
          "1.875rem",
          { lineHeight: "1.3333", letterSpacing: "-0.017em" },
        ],
        "4xl": ["2.25rem", { lineHeight: "1.2777", letterSpacing: "-0.017em" }],
        "5xl": ["3rem", { lineHeight: "1", letterSpacing: "-0.017em" }],
        "6xl": ["4rem", { lineHeight: "1", letterSpacing: "-0.017em" }],
        "7xl": ["4.5rem", { lineHeight: "1", letterSpacing: "-0.017em" }],
      },
      animation: {
        endless: "endless 20s linear infinite",
      },
      keyframes: {
        swing: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-100px)" },
        },
        endless: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-245px)" },
        },
      },
      colors: {
        bgBlack: "#0E0E0E",
        phantom: "#1E1E24",
        ranger: {
          "100": "#E3FFDC",
          "200": "#E3FFDC",
          "300": "#E3FFDC",
          "400": "#CBFFC0",
          "500": "#B7E5AD",
          "600": "#A2CC9A",
          "700": "#8EB286",
          "800": "#7A9973",
          "900": "#668060",
          "950": "#51664D",
        }
      },
    },
  },
  daisyui: {
    themes: ["dark"], // You can customize this as needed
  },
};
