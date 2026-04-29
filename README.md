# ihaleal.com

**İhaleal** — gayrimenkul ilanı ve ihale deneyimi (**Vite + React + TypeScript** SPA). Yerel: `npm install && npm run dev`. Üretim öncesi: `npm run typecheck && npm run build`.

- **Canlı site:** [https://ihaleal.com/#/](https://ihaleal.com/#/)
- **Hızlı:** çift tık `IHALEAL_LINKLER.bat` (canlıyı tarayıcıda açar; yerel adresleri de gösterir).

- **Mimari tek kaynak:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Supabase:** `.env.local` içinde `VITE_SUPABASE_*`; SQL sırası `supabase/manual_push_v2.sql` → `v3` → `v4` → `v5` → **`v6`** → **`v7`** (`pre_launch_signups`, SQL Editor).

## Vercel ile yayın

1. Depoyu GitHub’a gönderin; [vercel.com](https://vercel.com) üzerinden **Import Project** ile bağlayın. Framework: **Vite**, Build: `npm run build`, Output: **dist** (veya kökteki `vercel.json` kullanılır).
2. **Environment Variables:** Supabase **project URL**, **anon (public) key** ve uygulamanın kullandığı diğer `VITE_*` değişkenleri — Production için ekleyin.
3. **Alan adı:** Vercel projesinde **Domains** → `ihaleal.com` ekleyin; DNS sağlayıcınızda Vercel’in verdiği **A / CNAME** kayıtlarını oluşturun.
4. SPA için tek sayfa yönlendirmesi `vercel.json` içindeki `rewrites` ile tanımlıdır (`/#/` HashRouter kullanımında tarayıcı doğrudan köke giderse bile statik dosya sunumu çalışır).

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

---

## ihaleal.com — patron / maraton

- Uzun maraton komutu (Kimi + Cursor): `docs/KIMI_CURSOR_UZUN_MARATON_KOMUT.md`
- Patron tek kaynak: `docs/SOZLESMESONRASI_TEK_KOMUT.md`
- Denetim komutu: `KONTROL_KOMUTU.txt`
