/**
 * VitePress site configuration for "小云的 AI 开发实践".
 *
 * Sections:
 * - `/guide/`       — Getting started, best practices, MCP, skills, plugins
 * - `/claude-code/` — Claude Code specific guides
 * - `/tools/`       — AI frameworks, dev tools, browser automation
 * - `/api/`         — API reference
 *
 * @see https://vitepress.dev/reference/site-config
 */
import { defineConfig } from 'vitepress'
import { withYunlefun, yunlefunMarkdown, zhThemeConfig } from 'vitepress-theme-yunlefun/config'
import { yunMark } from './yun-mark'

export default defineConfig(withYunlefun({
  title: '小云的 AI 开发实践',
  description: '小云的 AI 开发实践、工具与资源',
  lang: 'zh-CN',
  base: '/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],

  themeConfig: {
    ...zhThemeConfig,
    brand: { icon: yunMark, hero: true },

    // ---- Navigation ----
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'Claude Code', link: '/claude-code/' },
      { text: '工具', link: '/tools/' },
      { text: 'API', link: '/api/' },
      {
        text: '云游君',
        items: [
          { text: '博客', link: 'https://www.yunyoujun.cn' },
          { text: '项目文档', link: 'https://docs.yunyoujun.cn' },
        ],
      },
    ],

    // ---- Sidebar ----
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '简介', link: '/guide/' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '最佳实践', link: '/guide/best-practices' },
          { text: 'Copilot 双语 Release Notes', link: '/guide/copilot-release-notes' },
          {
            text: 'MCP',
            collapsed: false,
            items: [
              { text: '介绍', link: '/guide/mcp/' },
            ],
          },
          { text: 'Skills', link: '/guide/skills' },
          { text: 'Plugins', link: '/guide/plugins' },
          { text: 'Marketplace', link: '/guide/marketplace' },
        ],
      },
      {
        text: 'Claude Code',
        items: [
          { text: '介绍', link: '/claude-code/' },
          { text: '使用前准备', link: '/claude-code/registration' },
          { text: '最佳实践', link: '/claude-code/best-practices' },
          { text: 'PR 自动化实践', link: '/claude-code/pr-automation' },
          { text: 'Issue 单仓试运行', link: '/claude-code/issue-autopilot' },
          { text: 'Git Worktree 并行处理', link: '/claude-code/git-worktree' },
        ],
      },
      {
        text: '工具与资源',
        items: [
          { text: '概览', link: '/tools/' },
          { text: 'AI 框架', link: '/tools/frameworks' },
          { text: '开发工具', link: '/tools/dev-tools' },
          { text: 'AI Docs 组件', link: '/tools/ai-docs' },
          {
            text: '浏览器自动化',
            collapsed: false,
            items: [
              { text: 'Agent Browser', link: '/tools/agent-browser' },
              { text: 'Browser Use', link: '/tools/browser-use' },
            ],
          },
          { text: '学习资源', link: '/tools/resources' },
        ],
      },
      {
        text: 'API 文档',
        items: [
          { text: '概览', link: '/api/' },
        ],
      },
    ],

    // ---- Social Links ----
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YunYouJun' },
    ],

    // Search, outline, doc footer and accessibility labels come from zhThemeConfig.
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
  },

  markdown: {
    lineNumbers: true,
    config: md => md.use(yunlefunMarkdown),
  },
}))
