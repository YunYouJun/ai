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

export default defineConfig({
  title: '小云的 AI 开发实践',
  description: '小云的 AI 开发实践、工具与资源',
  lang: 'zh-CN',
  base: '/',

  themeConfig: {
    logo: '/favicon.svg',

    // ---- Navigation ----
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'Claude Code', link: '/claude-code/' },
      { text: '工具', link: '/tools/' },
      { text: 'API', link: '/api/' },
    ],

    // ---- Sidebar ----
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '简介', link: '/guide/' },
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '最佳实践', link: '/guide/best-practices' },
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

    // ---- Search (local with Chinese translations) ----
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
            },
          },
        },
      },
    },

    // ---- Outline & Footer ----
    outline: {
      label: '页面导航',
      level: [2, 3],
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    // ---- Accessibility i18n ----
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },

  markdown: {
    lineNumbers: true,
  },
})
