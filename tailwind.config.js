const defaultTheme = require("tailwindcss/defaultTheme");
const forms = require("@tailwindcss/forms");

/**
 * Port of the Laravel app's tailwind.config.js. Every colour resolves to a CSS
 * custom property so light and dark mode share one class name.
 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const surface = {
  DEFAULT: token("surface"),
  raised: token("surface-raised"),
  sunken: token("surface-sunken"),
};

const ink = {
  DEFAULT: token("ink"),
  muted: token("ink-muted"),
  subtle: token("ink-subtle"),
  inverse: token("ink-inverse"),
};

const brand = {
  DEFAULT: token("brand"),
  hover: token("brand-hover"),
  soft: token("brand-soft"),
  "soft-ink": token("brand-soft-ink"),
  on: token("brand-on"),
};

const status = {
  ok: token("status-ok"),
  "ok-soft": token("status-ok-soft"),
  "ok-ink": token("status-ok-ink"),
  warn: token("status-warn"),
  "warn-soft": token("status-warn-soft"),
  "warn-ink": token("status-warn-ink"),
  danger: token("status-danger"),
  "danger-soft": token("status-danger-soft"),
  "danger-ink": token("status-danger-ink"),
  info: token("status-info"),
  "info-soft": token("status-info-soft"),
  "info-ink": token("status-info-ink"),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      colors: {
        transparent: "transparent",
        current: "currentColor",

        surface,
        ink,
        brand,
        primary: brand,
        status,
      },

      borderRadius: {
        none: "0",
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },

      boxShadow: {
        none: "none",
        float: "0 12px 32px -8px rgb(15 23 42 / 0.16), 0 2px 6px -2px rgb(15 23 42 / 0.08)",
        lift: "0 2px 8px -2px rgb(15 23 42 / 0.12)",
      },

      transitionTimingFunction: {
        swift: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        settle: "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      transitionDuration: {
        quick: "140ms",
        normal: "220ms",
        slow: "380ms",
      },

      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-left": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },

      animation: {
        "fade-rise": "fade-rise 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 200ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
        "slide-left": "slide-left 260ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "spin-slow": "spin-slow 900ms linear infinite",
      },
    },
  },

  plugins: [forms],
};
