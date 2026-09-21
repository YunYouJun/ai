import type { SkillItem } from '@yunyoujun/vitepress-skill-directory'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { fileURLToPath } from 'node:url'
import { defineLoader } from 'vitepress'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const repoUrl = 'https://github.com/YunYouJun/ai'

const SOURCES: { dir: string, category: string, branch: string }[] = [
  { dir: 'skills', category: '独立 Skill', branch: 'main' },
  { dir: 'plugins/ai-coding/skills', category: 'ai-coding 插件', branch: 'main' },
]

/** 展示图标，按目录名登记；未登记的使用默认 ✦ */
const ICONS: Record<string, string> = {
  'yunyoujun': '🛠️',
  'pr-cycle': '🔁',
  'copilot-review-loop': '🤖',
  'review-staged': '🔍',
  'address-copilot-review': '💬',
  'fix-issue': '🐛',
  'review-feedback': '📝',
}

/** 只取单行标量，避免为构建期脚本引入 YAML 依赖 */
function readScalar(source: string, key: string): string {
  const match = source.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?\\s*$`, 'm'))
  return match ? match[1].trim() : ''
}

export default defineLoader({
  watch: ['../../../skills/*/SKILL.md', '../../../plugins/ai-coding/skills/*/SKILL.md'],
  load(): SkillItem[] {
    const items: SkillItem[] = []

    for (const { dir, category, branch } of SOURCES) {
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
        const subdir = `${dir}/${entry.name}`

        items.push({
          id: subdir,
          name,
          icon: ICONS[entry.name],
          category,
          description: readScalar(source, 'description'),
          install: `npx skills add ${repoUrl} --skill ${name}`,
          source: { text: '源码', href: `${repoUrl}/tree/${branch}/${subdir}` },
        })
      }
    }

    return items
  },
})
