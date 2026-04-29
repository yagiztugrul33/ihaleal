import path from "path"
import react from "@vitejs/plugin-react"
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
  },
  preview: {
    headers: securityHeaders(),
  },
  plugins: [react()],
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