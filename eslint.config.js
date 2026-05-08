// ESLint 10 flat config — Astro 6 + TypeScript strict
// Refs:
// - https://typescript-eslint.io/getting-started
// - https://ota-meshi.github.io/eslint-plugin-astro/user-guide/
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
  // 1. Ignore patterns (must come first to be applied globally)
  {
    ignores: [
      'dist/**',
      '.astro/**',
      '.vercel/**',
      'node_modules/**',
      'public/**',
      'coverage/**',
      '*.config.*.timestamp-*',
    ],
  },

  // 2. Base recommended ruleset for plain JS / config files
  js.configs.recommended,

  // 3. typescript-eslint strict (flat) — covers .ts/.tsx
  ...tseslint.configs.strict,

  // 4. eslint-plugin-astro recommended — covers .astro
  ...eslintPluginAstro.configs.recommended,

  // 5. Globals + parser options shared across the project
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2024,
        // Astro globals exposed in <script> blocks and runtime
        Astro: 'readonly',
        Fragment: 'readonly',
      },
    },
  },

  // 6. Project-wide rule tweaks
  {
    rules: {
      // We use `_unused` as a convention for intentionally unused args.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Ban console.* in source — tests / scripts override below.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 7. .astro file overrides
  {
    files: ['**/*.astro'],
    rules: {
      // Astro components frequently use unused vars in frontmatter scopes
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // 8. Test / config file relaxations
  {
    files: [
      '**/*.test.{ts,tsx,js,mjs}',
      '**/*.spec.{ts,tsx,js,mjs}',
      '**/*.config.{ts,js,mjs,cjs}',
      'scripts/**',
    ],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
