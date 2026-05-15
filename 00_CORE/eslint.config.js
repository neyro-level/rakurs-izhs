import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      'astro/no-set-html-directive': 'error',
      'astro/no-unused-css-selector': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
  {
    ignores: ['dist/**', '.astro/**', '.vercel/**', 'node_modules/**'],
  },
];
