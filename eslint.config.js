import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '.vercel/**',
    'coverage',
    'docs/**',
    'supabase/functions/**',
    'workers/**',
    'tests/smoke/**',
    'playwright-report/**',
    'test-results/**',
    '_audit/**',
    'scripts/append-light-fix.cjs',
    'scripts/fix-all.cjs',
    'scripts/fix-tags.cjs',
    'scripts/patch-*.cjs',
    'scripts/patch-*.mjs',
    'scripts/gen-luxury-theme.mjs',
    'scripts/light-theme-replace.mjs',
    'scripts/write-ai-knowledge.mjs',
    'scripts/fix-theme.mjs',
    'scripts/deploy-v2-remote.mjs',
    'scripts/fix-ges-page.mjs',
    'scripts/fix-ges.cjs',
    'scripts/write-corporate-page.mjs',
    'scripts/_generate_kimi_mega_pack.mjs',
    'scripts/backup.mjs',
    'scripts/fix-corp.mjs',
    'scripts/smoke-listings-post.mjs',
  ]),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/static-components': 'off',
      'react-refresh/only-export-components': 'off',
      'no-useless-assignment': 'off',
    },
  },
  {
    files: [
      'src/pages/intelligence/**/*.{ts,tsx}',
      'src/components/intelligence/**/*.{ts,tsx}',
      'src/lib/engineering/**/*.{ts,tsx}',
      'src/lib/data/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['tests/engineering/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['tests/rls/**/*.{ts,tsx}', 'scripts/**/*.{js,mjs}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.node },
    },
  },
])
