/**
 * Skills 展示目录：从 `SKILL.md` 读取名称与参数，合并本文件登记的展示信息。
 *
 * 目录页（data loader）、侧边栏和 `test/skill-catalog.test.ts` 共用这里的数据；
 * 新增 Skill 时在 `SKILL_SHOWCASE` 登记并补 `docs/guide/skills/<name>.md`。
 */
import type { SkillItem } from '@yunyoujun/ai-docs'
import type { DefaultTheme } from 'vitepress'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const repoUrl = 'https://github.com/YunYouJun/ai'

interface SkillSource {
  dir: string
  /** 展示用的来源说明 */
  origin: string
  /** 插件命名空间，插件加载后命令带 `namespace:` 前缀 */
  namespace?: string
}

export const SKILL_SOURCES: SkillSource[] = [
  { dir: 'skills', origin: '独立 Skill' },
  { dir: 'plugins/ai-coding/skills', origin: 'ai-coding 插件', namespace: 'ai-coding' },
]

/** 展示分类，顺序即目录筛选和侧边栏的顺序 */
export const SKILL_CATEGORIES = ['Issue → PR', '代码审查', '文档写作', '发布交付', '编码约定'] as const

export type SkillCategory = typeof SKILL_CATEGORIES[number]

interface SkillShowcase {
  title: string
  icon: string
  category: SkillCategory
  /** 面向读者的一句话说明，替代 SKILL.md 中写给 Agent 的英文 description */
  summary: string
  tags: string[]
}

/** 按 Skill 目录名登记，同一分类内按登记顺序展示 */
export const SKILL_SHOWCASE: Record<string, SkillShowcase> = {
  'triage-issues': {
    title: 'Issue 分诊',
    icon: '🧭',
    category: 'Issue → PR',
    summary: '只读筛选已授权仓库的 Issue，输出低风险候选或跳过原因，通过门禁后交给 fix-issue。',
    tags: ['只读 dry-run', '单仓试运行', 'GitHub'],
  },
  'fix-issue': {
    title: '修复 Issue',
    icon: '🐛',
    category: 'Issue → PR',
    summary: '复现问题、补回归测试、最小修复并跑完检查，最后创建 Draft PR。',
    tags: ['回归测试', 'Draft PR', 'GitHub'],
  },
  'pr-cycle': {
    title: 'PR 全流程',
    icon: '🔁',
    category: 'Issue → PR',
    summary: '从 Issue 出发串起修复、Draft PR 与有限轮次的 Review 处理。',
    tags: ['编排', 'Draft PR', 'Review'],
  },
  'review-staged': {
    title: '提交前审查',
    icon: '🔍',
    category: '代码审查',
    summary: '审查暂存区变更，按 MUST_FIX / SHOULD_FIX / NIT 分级，可选自动修复。',
    tags: ['Git', '提交前', '可自动触发'],
  },
  'review-feedback': {
    title: '处理 Review 意见',
    icon: '📝',
    category: '代码审查',
    summary: '拉取 Copilot 或人工 Review 意见，分类修复、推送并汇报跳过原因。',
    tags: ['PR Review', 'Copilot', '人工 Review'],
  },
  'address-copilot-review': {
    title: '处理 Copilot Review',
    icon: '💬',
    category: '代码审查',
    summary: '单轮处理 Copilot Review：抓取评论、分类、修复、校验并逐条回复。',
    tags: ['Copilot', '单轮', 'PR Review'],
  },
  'copilot-review-loop': {
    title: 'Copilot Review 循环',
    icon: '🤖',
    category: '代码审查',
    summary: '触发 Copilot Review → 处理意见 → 再次触发，最多 2 轮直到没有必须修复项。',
    tags: ['Copilot', '最多 2 轮', 'PR Review'],
  },
  'simplify-documents': {
    title: '高保真文档精简',
    icon: '✂️',
    category: '文档写作',
    summary: '按目标比例精简文档，保留事实、约束、步骤和指定段落，并附审计脚本。',
    tags: ['压缩比例', '保护段落', '审计脚本'],
  },
  'ios-testflight': {
    title: 'TestFlight 内部测试',
    icon: '✈️',
    category: '发布交付',
    summary: '用 ASC CLI 打包、校验 IPA 并发布到 TestFlight 内部测试，最后按服务器状态验收。',
    tags: ['iOS', 'ASC CLI', '仅内部测试'],
  },
  'yunyoujun': {
    title: '编码偏好与工具约定',
    icon: '🛠️',
    category: '编码约定',
    summary: 'YunYouJun 的 TypeScript、Vue、pnpm、ESLint 与文档注释约定。',
    tags: ['TypeScript', 'Vue', 'pnpm'],
  },
}

export interface CatalogSkill extends SkillItem {
  /** Skill 目录名，同时是文档页的文件名 */
  slug: string
  /** 带参数提示的调用命令；插件 Skill 带命名空间 */
  command: string
  origin: string
}

/** 只取单行标量，避免为构建期脚本引入 YAML 依赖 */
function readScalar(source: string, key: string): string {
  const match = source.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'))
  return match ? match[1].trim() : ''
}

function sortKey(skill: CatalogSkill): [number, number] {
  const category = SKILL_CATEGORIES.indexOf(skill.category as SkillCategory)
  const order = Object.keys(SKILL_SHOWCASE).indexOf(skill.slug)
  return [
    category === -1 ? SKILL_CATEGORIES.length : category,
    order === -1 ? Number.MAX_SAFE_INTEGER : order,
  ]
}

/** 扫描所有来源目录；未登记展示信息的 Skill 仍会列出，归入「未分类」 */
export function collectSkills(): CatalogSkill[] {
  const items: CatalogSkill[] = []

  for (const { dir, origin, namespace } of SKILL_SOURCES) {
    const absDir = resolve(repoRoot, dir)
    if (!existsSync(absDir))
      continue

    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      if (!entry.isDirectory())
        continue
      const skillFile = resolve(absDir, entry.name, 'SKILL.md')
      if (!existsSync(skillFile))
        continue

      const source = readFileSync(skillFile, 'utf8')
      const name = readScalar(source, 'name') || entry.name
      const hint = readScalar(source, 'argument-hint')
      const showcase = SKILL_SHOWCASE[entry.name]
      const subdir = `${dir}/${entry.name}`

      items.push({
        id: subdir,
        slug: entry.name,
        name,
        title: showcase?.title,
        icon: showcase?.icon,
        category: showcase?.category,
        description: showcase?.summary || readScalar(source, 'description'),
        tags: showcase?.tags,
        install: `npx skills add YunYouJun/ai --skill=${name}`,
        command: [`/${namespace ? `${namespace}:` : ''}${name}`, hint].filter(Boolean).join(' '),
        origin,
        source: { text: '使用说明', href: `/guide/skills/${entry.name}` },
        links: [{ text: 'GitHub 源码', href: `${repoUrl}/tree/main/${subdir}` }],
      })
    }
  }

  return items.sort((a, b) => {
    const [ca, oa] = sortKey(a)
    const [cb, ob] = sortKey(b)
    return ca - cb || oa - ob
  })
}

/** 侧边栏：按分类分组，组内按目录顺序 */
export function skillSidebarItems(): DefaultTheme.SidebarItem[] {
  const groups = new Map<string, DefaultTheme.SidebarItem[]>()
  for (const skill of collectSkills()) {
    const category = skill.category || '未分类'
    if (!groups.has(category))
      groups.set(category, [])
    groups.get(category)!.push({ text: skill.name, link: `/guide/skills/${skill.slug}` })
  }

  return Array.from(groups, ([text, items]) => ({ text, collapsed: true, items }))
}
