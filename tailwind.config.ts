import type { Config } from "tailwindcss"

const config: Config = {
  content: {
    relative: true,
    files: [
      "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/ui/**/*.{js,ts,jsx,tsx,mdx}",
      "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
  },
  darkMode: "class",
  theme: {
    fontFamily: {
      garrixon: ["SF Alien Encounters", "sans-serif"],
      burbankblack: ["var(--font-burbankblack)"],
      burbankmedium: ["var(--font-burbankmedium)"],
    },
    extend: {
      boxShadow: {
        "2xl": "0 0 100px 10px rgba(0, 0, 0, 1)",
        "3xl": "-10px 10px 0 0 rgba(0, 0, 0, 1)",
        "4xl": "10px 10px 0 0 rgba(0, 0, 0, 1)",
      },
      fontSize: {
        "btn-lg": [
          "32px",
          {
            letterSpacing: "0.1rem",
          },
        ],
        "btn-md": [
          "24px",
          {
            letterSpacing: "0.1rem",
          },
        ],
        "btn-sm": [
          "18px",
          {
            letterSpacing: "0.1rem",
          },
        ],
      },
      colors: {
        h1layer1fill: "rgba(51, 233, 198, 0.065)",
        h1layer1stroke: "rgba(255,255,255,1)",
        h1layer2stroke: "rgba(51, 233, 233, 1)",
        h1layer3stroke: "rgba(0, 168, 168, 1)",
        selectModeBorder: "rgba(255, 255, 255, 0.4)",
        selectMode1BgFrom: "#4A2071",
        selectMode1BgTo: "#BF5DCB",
        selectMode2BgFrom: "#EAFAFF",
        selectMode2BgTo: "#54C3D6",
        textSelectedEffect: "rgba(150, 150, 255, 0.2)",
        primary: "#0243fd",
        secondary: "#0055ff",
      },
      backgroundImage: {
        bgGradientRadial:
          "radial-gradient(circle,rgba(31, 207, 239, 1) 38%,rgba(41, 84, 181, 1) 100%)",
        "gradient-radial":
          "radial-gradient(circle, rgba(31,207,239,1) 38%, rgba(41,84,181,1) 100%)",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [require("@designbycode/tailwindcss-text-stroke")],
  safelist: ["!duration-[0ms]", "!delay-[0ms]"],
}
export default config
