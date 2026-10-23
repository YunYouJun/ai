/**
 * VitePress site configuration for "小云的 AI 开发实践".
 *
 * Sections:
 * - `/guide/`       — Getting started, Plugins, Marketplace, MCP
 * - `/guide/skills` — Skills catalog; per-skill pages are grouped from `data/skill-catalog.ts`
 * - `/claude-code/` — Claude Code setup, best practices, worktrees
 * - `/practices/`   — Automation write-ups, App development lessons, and validation records
 * - `/tools/`       — Frameworks, API usage, dev tools, browser automation, resources
 *
 * @see https://vitepress.dev/reference/site-config
 */
import { defineConfig } from 'vitepress'
import { withYunlefun, yunlefunMarkdown, zhThemeConfig } from 'vitepress-theme-yunlefun/config'
import { aiMark } from './ai-mark'
import { skillSidebarItems } from './data/skill-catalog'

export default defineConfig(withYunlefun({
  title: '小云的 AI 开发实践',
  description: '小云的 AI 开发实践、工具与资源',
  lang: 'zh-CN',
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'icon', href: '/favicon-32.png', type: 'image/png', sizes: '32x32' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
  ],

  themeConfig: {
    ...zhThemeConfig,
    brand: { icon: aiMark, hero: true, sky: true },

    // ---- Navigation ----
    nav: [
      { text: '指南', link: '/guide/', activeMatch: '^/guide/(?!skills)' },
      { text: 'Skills', link: '/guide/skills', activeMatch: '^/guide/skills' },
      { text: 'Claude Code', link: '/claude-code/' },
      { text: '实践', link: '/practices/pr-automation', activeMatch: '^/practices/' },
      { text: '工具', link: '/tools/' },
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
          { text: 'Plugins', link: '/guide/plugins' },
          { text: 'Marketplace', link: '/guide/marketplace' },
          { text: 'MCP', link: '/guide/mcp' },
        ],
      },
      {
        text: 'Skills',
        items: [
          { text: 'Skills 目录', link: '/guide/skills' },
          { text: '编写 Skill', link: '/guide/skills/authoring' },
          ...skillSidebarItems(),
        ],
      },
      {
        text: 'Claude Code',
        items: [
          { text: '介绍', link: '/claude-code/' },
          { text: '使用前准备', link: '/claude-code/registration' },
          { text: '最佳实践', link: '/claude-code/best-practices' },
          { text: 'Git Worktree 并行处理', link: '/claude-code/git-worktree' },
        ],
      },
      {
        text: '自动化实践',
        items: [
          { text: 'Issue → PR → Review', link: '/practices/pr-automation' },
          {
            text: 'Issue 单仓试运行',
            link: '/practices/issue-autopilot',
            collapsed: true,
            items: [
              { text: 'Valaxy 首次盘点', link: '/practices/issue-autopilot-pilot' },
            ],
          },
          {
            text: 'Copilot 双语 Release Notes',
            link: '/practices/copilot-release-notes',
            collapsed: true,
            items: [
              { text: '验证记录', link: '/practices/copilot-release-notes-validation' },
            ],
          },
        ],
      },
      {
        text: 'App 开发实践',
        items: [
          { text: '索引与参考', link: '/practices/app-development/' },
          { text: '账号切换与异步结果', link: '/practices/app-development/account-isolation' },
          { text: '升级与数据恢复', link: '/practices/app-development/data-migration' },
          { text: '测试证据与模拟器管理', link: '/practices/app-development/testing-evidence' },
        ],
      },
      {
        text: '工具与资源',
        items: [
          { text: '概览', link: '/tools/' },
          { text: 'AI 框架与 SDK', link: '/tools/frameworks' },
          { text: 'API 调用实践', link: '/tools/api' },
          { text: '开发工具', link: '/tools/dev-tools' },
          {
            text: '浏览器自动化',
            collapsed: false,
            items: [
              { text: 'Agent Browser', link: '/tools/agent-browser' },
              { text: 'Browser Use', link: '/tools/browser-use' },
            ],
          },
          { text: 'AI Docs 组件', link: '/tools/ai-docs' },
          { text: '学习资源', link: '/tools/resources' },
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
