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
