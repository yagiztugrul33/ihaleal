import path from "path"
import react from "@vitejs/plugin-react"
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
  plugins: [homePageMetaHtmlPlugin(), react()],
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
          if (isCiBuild) return undefined
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor-react"
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-react"
          }
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts"
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
