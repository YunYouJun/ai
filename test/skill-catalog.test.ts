import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { collectSkills, repoRoot, SKILL_CATEGORIES, SKILL_SHOWCASE } from '../docs/.vitepress/data/skill-catalog'

const skills = collectSkills()

describe('skill catalog', () => {
  it('收录了全部 SKILL.md', () => {
    expect(skills.length).toBeGreaterThan(0)
    expect(skills.map(skill => skill.slug).sort()).toEqual(Object.keys(SKILL_SHOWCASE).sort())
  })

  it('每个 Skill 都有合法分类', () => {
    for (const skill of skills)
      expect(SKILL_CATEGORIES, skill.slug).toContain(skill.category)
  })

  it('插件 Skill 的调用命令带命名空间', () => {
    const fixIssue = skills.find(skill => skill.slug === 'fix-issue')
    expect(fixIssue?.command).toBe('/ai-coding:fix-issue [issue-number-or-url]')
    const standalone = skills.find(skill => skill.slug === 'simplify-documents')
    expect(standalone?.command).toBe('/simplify-documents')
  })

  it('按分类顺序排列', () => {
    const order = skills.map(skill => SKILL_CATEGORIES.indexOf(skill.category as typeof SKILL_CATEGORIES[number]))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('每个 Skill 都有使用说明页', () => {
    for (const skill of skills)
      expect(existsSync(resolve(repoRoot, `docs${skill.source!.href}.md`)), skill.slug).toBe(true)
  })

  it('每个 Skill 都列在 README 中', () => {
    const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf8')
    for (const skill of skills)
      expect(readme, skill.slug).toContain(`[\`${skill.name}\`]`)
  })
})
