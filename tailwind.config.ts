import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        factorial: {
          red: "#E51943",
          green: "#009698",
          ink: "#111827",
          mist: "#F9FAFB"
        }
      },
      borderRadius: { "2xl": "1.25rem" },
      boxShadow: { soft: "0 8px 24px rgba(0,0,0,0.06)" }
    }
  },
  plugins: []
};
export default config;
