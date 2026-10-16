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
    '**/*.lock.yml',
    '**/docs/**/*.md/**',
    '**/skills/**/agents/openai.yaml',
    '**/skills/**/*.md/**',
  ],
}, {
  // 仓库未启用 UnoCSS 配置文件，组件包使用 scoped CSS，关闭 unocss 排序规则避免 worker 崩溃
  files: ['packages/**/*.vue'],
  rules: {
    'unocss/order': 'off',
    'unocss/order-attributify': 'off',
    'unocss/blocklist': 'off',
  },
})
