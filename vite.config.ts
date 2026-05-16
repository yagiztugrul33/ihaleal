import path from "path"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"
import { HOME_SEO, OG_IMAGE } from "./src/data/homeSeo"
import {
  CANONICAL_ROOT_HREF,
  SITE_ORIGIN,
  getShareUrlForPath,
} from "./src/data/siteOrigin"

function escapeHtmlText(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;")
}

function escapeHtmlAttr(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")
}

function escapeJsonStringContent(s: string) {
  return JSON.stringify(s).slice(1, -1)
}

/** index.html kabuğunu src/data/homeSeo.ts ile senkron tutar (JS çalışmayan botlar). */
function homePageMetaHtmlPlugin() {
  return {
    name: "home-page-meta-from-seo-data",
    enforce: "pre" as const,
    transformIndexHtml(html: string) {
      const absOg = `${SITE_ORIGIN}${OG_IMAGE.path}`
      const titleHtml = escapeHtmlText(HOME_SEO.title)
      const titleAttr = escapeHtmlAttr(HOME_SEO.title)
      const descAttr = escapeHtmlAttr(HOME_SEO.description)
      return html
        .replaceAll("__HOME_TITLE_HTML__", titleHtml)
        .replaceAll("__HOME_TITLE_ATTR__", titleAttr)
        .replaceAll("__HOME_DESCRIPTION__", descAttr)
        .replaceAll("__CANONICAL_ROOT__", escapeHtmlAttr(CANONICAL_ROOT_HREF))
        .replaceAll("__HOME_SHARE_URL__", escapeHtmlAttr(getShareUrlForPath("/", "")))
        .replaceAll("__OG_IMAGE_ABS__", escapeHtmlAttr(absOg))
        .replaceAll("__OG_IMAGE_W__", String(OG_IMAGE.width))
        .replaceAll("__OG_IMAGE_H__", String(OG_IMAGE.height))
        .replaceAll("__WEBSITE_JSON_DESC__", escapeJsonStringContent(HOME_SEO.description))
    },
  }
}

function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
  }
}

export default defineConfig({
  /** Göreli `./` üretimde `/alt/yol` gibi URL'lerde `./assets` yanlış çözülür (JS 404 → beyaz ekran). Kök taban her zaman doğru asset yolu verir. */
  base: "/",
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    headers: securityHeaders(),
    /** HashRouter: doğrudan köke düşsün */
    open: "/#/",
  },
  preview: {
    headers: securityHeaders(),
  },
  plugins: [
    homePageMetaHtmlPlugin(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "robots.txt",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-192.png",
        "icon-maskable-512.png",
      ],
      manifest: {
        name: "ihaleal.com - Gayrimenkul İhale Platformu",
        short_name: "ihaleal",
        description:
          "Türkiye'nin yapay zeka destekli gayrimenkul ihale platformu",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#f8fafc",
        theme_color: "#14b8a6",
        orientation: "portrait",
        lang: "tr",
        categories: ["business", "finance", "productivity"],
        icons: [
          {
            src: "/icon-maskable-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: { 
    alias: { "@": path.resolve(__dirname, "./src") } 
  },
  build: { 
    target: "es2022",
    minify: "esbuild",
    /** Üretimde konsol gürültüsünü azaltır (geliştirmede etkisiz) */
    esbuild: { drop: ["console", "debugger"] },
    cssMinify: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-ui";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion";
          }
          if (id.includes("node_modules/@supabase")) {
            return "vendor-supabase";
          }
          if (id.includes("node_modules/zod")) {
            return "vendor-zod";
          }
        },
      },
    },
    chunkSizeWarningLimit: 650 
  },
})