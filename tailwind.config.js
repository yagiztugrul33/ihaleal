/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  blocklist: ['[-:TZ.]'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // AÇIK & MİNİMAL tasarım sistemi — tek kaynak src/styles/tema.css.
        // Marka sınıfları artık CSS değişkenlerine bağlı; koyu palet kaldırıldı.
        lux: {
          deep: "var(--zemin)",
          base: "var(--zemin)",
          elevated: "var(--zemin-yumusak)",
          surface: "var(--zemin-yumusak)",
          blue: { 600: "var(--vurgu)", 500: "var(--vurgu)", 400: "var(--vurgu)" },
          trust: { green: "var(--durum-basari)", sky: "var(--vurgu)" },
          emerald: { 500: "var(--durum-basari)", 400: "var(--durum-basari)" },
          amber: { 500: "var(--durum-uyari)", 400: "var(--durum-uyari)" },
        },
        page: {
          DEFAULT: "var(--zemin)",
          muted: "var(--zemin-yumusak)",
        },
        brand: {
          teal: "var(--vurgu)",
          cyan: "var(--vurgu)",
          soft: "var(--vurgu)",
        },
        // Açık zeminde AA: slate-500/600 Tailwind varsayılanına döndü
        // (#64748B / #ffffff = 4.76:1, #475569 / #ffffff = 7.44:1).
        slate: {
          500: "#64748B",
          600: "#475569",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        // 10–14px bandı: köşe yumuşak ama abartısız
        xl: "var(--kose)",
        lg: "var(--kose)",
        md: "var(--kose-kucuk)",
        sm: "var(--kose-kucuk)",
        xs: "8px",
      },
      boxShadow: {
        xs: "var(--golge-kucuk)",
        lux: "var(--golge-buyuk)",
        "lux-lg": "var(--golge-buyuk)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}