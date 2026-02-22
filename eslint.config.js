/**
 * ESLint configuration using @antfu/eslint-config.
 *
 * Features:
 * - Built-in formatting (replaces Prettier)
 * - UnoCSS linting support
 * - Vue SFC linting
 * - Markdown code block linting with relaxed rules
 *
 * @see https://github.com/antfu/eslint-config
 */
import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: true,
  unocss: true,
  vue: true,
  markdown: {
    overrides: {
      'no-redeclare': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'ts/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-irregular-whitespace': 'off',
    },
  },
  ignores: [
    '**/docs/**/*.md/**',
  ],
})
