import type { Config } from "tailwindcss";
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { bg: c("bg"), surface: c("surface"), surface2: c("surface2"), line: c("line"), fg: c("fg"), muted: c("muted"), accent: c("accent"), "accent-fg": c("accent-fg"), pos: c("pos"), neg: c("neg"), warn: c("warn"), gold: c("gold") },
    fontFamily: { sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"] },
    boxShadow: {
      soft: "0 1px 2px rgb(var(--shadow) / .05), 0 10px 28px -14px rgb(var(--shadow) / .14)",
      lift: "0 2px 6px rgb(var(--shadow) / .08), 0 24px 48px -20px rgb(var(--shadow) / .32)",
    },
    keyframes: {
      rise: { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
      fade: { from: { opacity: "0" }, to: { opacity: "1" } },
      pop: { from: { opacity: "0", transform: "translateY(-4px) scale(.97)" }, to: { opacity: "1", transform: "none" } },
      float: { "0%,100%": { transform: "translate3d(0,0,0)" }, "50%": { transform: "translate3d(24px,-18px,0)" } },
      shimmer: { to: { backgroundPosition: "-200% 0" } },
      pulseDot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
    },
    animation: {
      rise: "rise .5s cubic-bezier(.2,.7,.2,1) both", fade: "fade .35s ease-out both", pop: "pop .16s ease-out both",
      float: "float 22s ease-in-out infinite", shimmer: "shimmer 1.6s linear infinite", dot: "pulseDot 1.6s ease-in-out infinite",
    },
  } },
  plugins: [],
} satisfies Config;
