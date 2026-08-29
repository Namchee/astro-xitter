import stylistic from '@stylistic/eslint-plugin';
import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  // Include standard Astro recommended rules
  ...eslintPluginAstro.configs['flat/recommended'],

  {
    files: ['**/*.astro'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // Apply stylistic rules for JS/TS code in frontmatter & script tags
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
    },
  },
];
