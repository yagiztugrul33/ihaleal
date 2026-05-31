import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
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

const isCiBuild =
  process.env.CI === "true" ||
  process.env.CI === "1" ||
  process.env.GITHUB_ACTIONS === "true"

export default defineConfig({
  base: "/",
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    headers: securityHeaders(),
    open: "/#/",
  },
  preview: {
    headers: securityHeaders(),
  },
  plugins: [
    homePageMetaHtmlPlugin(),
    react(),
    VitePWA({
      // Yeni SW gelince sessizce devral; eski cache'leri otomatik temizle.
      registerType: "autoUpdate",
      // Eski kill-switch (public/sw.js + public/sw-unregister.js) artık burada
      // yönetiliyor — Workbox cleanupOutdatedCaches + clientsClaim ile devralır.
      injectRegister: "auto",
      includeAssets: [
        "favicon.svg",
        "favicon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-192.png",
        "icon-maskable-512.png",
        "og-image.png",
        "ihaleal-logo.png",
        "ihaleal-logo-lockup.png",
      ],
      manifest: {
        name: "ihaleal — Türkiye'nin Gayrimenkul Borsası",
        short_name: "ihaleal",
        description:
          "Türkiye'nin gayrimenkul borsası: ihale, AI değerleme, anlık endeks ve aylık raporlar.",
        lang: "tr",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#0B1120",
        theme_color: "#0B1120",
        categories: ["business", "finance", "productivity"],
        icons: [
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
        ],
        shortcuts: [
          {
            name: "Aktif İhaleler",
            short_name: "İhaleler",
            description: "Şu an açık olan ihaleleri gör",
            url: "/ihaleler",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Harita",
            short_name: "Harita",
            description: "Türkiye geneli ilan haritası",
            url: "/harita",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Endeks Raporları",
            short_name: "Raporlar",
            description: "Aylık şehir endeks raporları + PDF",
            url: "/raporlar",
            icons: [{ src: "/icon-192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        // Eski cache versiyonlarını otomatik sil → kill-switch artığı.
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // SPA için fallback (offline navigation → index.html).
        navigateFallback: "/index.html",
        // KRİTİK: Supabase + dış API'leri ASLA cache'leme — sealed maskeleme
        // ve gerçek zaman bütünlüğü korunsun.
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/auth\//,
          /^\/rest\//,
          /^\/storage\//,
          /^\/functions\//,
        ],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff,woff2,ttf}"],
        // Büyük bundles için limit yükselt.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          // Supabase REST/Auth/Storage/Functions → DAİMA NETWORK (NetworkOnly).
          {
            urlPattern: /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/.*/i,
            handler: "NetworkOnly",
            method: "GET",
            options: { cacheName: "supabase-no-cache" },
          },
          // Google Fonts CSS → stale-while-revalidate.
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          // Google Fonts dosyaları → cache-first (1 yıl).
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // OpenStreetMap tile'ları (harita) → cache-first kısa süreli.
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "osm-tiles",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        // DEV ortamında SW'yi kapat — sürpriz cache olmasın.
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022",
    reportCompressedSize: false,
    minify: "esbuild",
    esbuild: isCiBuild ? {} : { drop: ["console", "debugger"] },
    cssMinify: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react"
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-react"
          }
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts"
          }
          if (id.includes("node_modules/leaflet")) {
            return "vendor-leaflet"
          }
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-ui"
          }
          if (id.includes("node_modules/framer-motion")) {
            return "vendor-motion"
          }
          if (id.includes("node_modules/@supabase")) {
            return "vendor-supabase"
          }
          if (id.includes("node_modules/zod")) {
            return "vendor-zod"
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: isCiBuild ? 4096 : 650,
  },
})
