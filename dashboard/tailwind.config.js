/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          50: "#E6EDF3",
          100: "#C9D1D9",
          200: "#B1BAC4",
          300: "#8B949E",
          400: "#6E7681",
          500: "#484F58",
          600: "#30363D",
          700: "#21262D",
          800: "#161B22",
          900: "#0D1117",
          950: "#010409",
        },
        accent: {
          purple: "#8B5CF6",
          "purple-light": "#A78BFA",
          blue: "#3B82F6",
          cyan: "#06B6D4",
          green: "#10B981",
          emerald: "#34D399",
          yellow: "#F59E0B",
          orange: "#F97316",
          red: "#EF4444",
          pink: "#EC4899",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
        "glow-purple":
          "radial-gradient(ellipse at center, rgba(139,92,246,0.15) 0%, transparent 70%)",
        "glow-cyan":
          "radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, transparent 70%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-up": "fadeUp 0.6s ease-out",
        "slide-in": "slideIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "count-up": "countUp 1.5s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(139,92,246,0.1)" },
          "100%": { boxShadow: "0 0 30px rgba(139,92,246,0.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

