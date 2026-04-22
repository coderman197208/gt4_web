import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.eslintrc.cjs', 'eslint.config.js'],
  },
  js.configs.recommended,
  ...tseslint.configs['flat/recommended'],
];
