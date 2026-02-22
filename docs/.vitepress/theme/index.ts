import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './styles/index.scss'

/**
 * Custom VitePress theme extending the default theme.
 *
 * To add layout slots, override `Layout` with `h(DefaultTheme.Layout, null, { ... })`.
 * To register global components, add an `enhanceApp` method.
 *
 * @see https://vitepress.dev/guide/extending-default-theme
 */
export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 可以在这里注册全局组件
  },
} satisfies Theme
