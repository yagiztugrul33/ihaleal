/// <reference types="expo/types" />

declare module '*.module.css' {
  const styles: { readonly [key: string]: string };
  export default styles;
}

declare module '*.css';

/**
 * Mobile, web `src/lib/supabase.ts` dosyasını @web/lib/buyNow zincirinden bridge eder;
 * o dosya Vite'in `import.meta.env` API'sini kullanır. Mobil tsc'nin bu deseni
 * tanıması için ambient declaration. (Runtime'da Metro/Expo bunu kullanmaz; web
 * tarafında Vite çözer.)
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
