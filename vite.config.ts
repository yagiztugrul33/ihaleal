import path from "path"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import { defineConfig } from "vite"

function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  }
}

export default defineConfig({
  /** Göreli `./` üretimde `/alt/yol` gibi URL'lerde `./assets` yanlış çözülür (JS 404 → beyaz ekran). Kök taban her zaman doğru asset yolu verir. */
  base: "/",
  server: {
    headers: securityHeaders(),
    /** HashRouter: doğrudan köke düşsün */
    open: "/#/",
  },
  preview: {
    headers: securityHeaders(),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "ihaleal.com - Gayrimenkul İhale Platformu",
        short_name: "ihaleal",
        description:
          "Türkiye'nin yapay zeka destekli gayrimenkul ihale platformu",
        start_url: "/#/",
        scope: "/",
        display: "standalone",
        background_color: "#0a0f1e",
        theme_color: "#0a0f1e",
        orientation: "portrait-primary",
        lang: "tr-TR",
        categories: ["business", "finance", "real_estate"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
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
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-ui": ["lucide-react"],
        }
      }
    },
    chunkSizeWarningLimit: 650 
  },
})