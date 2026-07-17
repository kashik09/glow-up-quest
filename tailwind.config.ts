import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#fdf4ff",
        ink: "#2d1b4e",
        muted: "#6b5b7d",
        card: "rgba(255, 255, 255, 0.7)",
        // Pastel palette
        pink: {
          light: "#fce7f3",
          DEFAULT: "#f9a8d4",
          bright: "#ec4899",
        },
        purple: {
          light: "#f3e8ff",
          DEFAULT: "#c4b5fd",
          bright: "#a855f7",
        },
        blue: {
          light: "#e0f2fe",
          DEFAULT: "#93c5fd",
          bright: "#3b82f6",
        },
        yellow: {
          light: "#fef9c3",
          DEFAULT: "#fde047",
          bright: "#eab308",
        },
      },
      boxShadow: {
        soft: "0 8px 32px rgba(139, 92, 246, 0.15)",
        glow: "0 0 20px rgba(249, 168, 212, 0.4)",
        "glow-purple": "0 0 20px rgba(196, 181, 253, 0.5)",
        "glow-blue": "0 0 20px rgba(147, 197, 253, 0.5)",
      },
      borderRadius: {
        xl: "24px",
        "2xl": "32px",
      },
      borderWidth: {
        "3": "3px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "serif"],
        body: ["var(--font-body)", "Space Grotesk", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "bounce-in": "bounceIn 0.6s ease-out",
        "wiggle": "wiggle 0.5s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float-up": "floatUp 1.5s ease-out forwards",
        "sink-down": "sinkDown 0.5s ease-in-out forwards",
        "shake": "shake 0.5s ease-in-out",
        "spin-slow": "spin 3s linear infinite",
        "confetti-fall": "confettiFall 1s ease-out forwards",
        "scale-pop": "scalePop 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "50%": { transform: "scale(1.02)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(249, 168, 212, 0.4)" },
          "50%": { boxShadow: "0 0 30px rgba(196, 181, 253, 0.6)" },
        },
        floatUp: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "100%": { opacity: "0", transform: "translateY(-60px) scale(1.2)" },
        },
        sinkDown: {
          "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "30%": { transform: "translateY(-8px) scale(1.02)" },
          "100%": { opacity: "0.7", transform: "translateY(20px) scale(0.98)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
        confettiFall: {
          "0%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
          "100%": { opacity: "0", transform: "translateY(100px) rotate(720deg)" },
        },
        scalePop: {
          "0%": { transform: "scale(0.8)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
