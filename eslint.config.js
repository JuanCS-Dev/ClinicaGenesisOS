import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules', 'coverage', 'functions/coverage', '*.min.js', 'vite.config.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/set-state-in-effect': 'off',
      // CODE_CONSTITUTION guardrails - realistic limits for React
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },
  // Relaxed rules for test files and functions folder
  {
    files: ['**/*.test.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}', 'functions/**/*.{ts,tsx}'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Relaxed for React hooks (combine state, effects, callbacks)
  {
    files: ['src/hooks/**/*.ts', 'src/hooks/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
  // Relaxed for page components (complex UI orchestration)
  {
    files: ['src/pages/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 450, skipBlankLines: true, skipComments: true }],
    },
  },
  // Relaxed for complex UI components
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 400, skipBlankLines: true, skipComments: true }],
    },
  },
  // Relaxed for contexts (providers have complex logic)
  {
    files: ['src/contexts/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
  // Relaxed for design system, plugins, services
  {
    files: ['src/design-system/**/*.tsx', 'src/plugins/**/*.tsx', 'src/services/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      'max-lines-per-function': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],
    },
  },
)
