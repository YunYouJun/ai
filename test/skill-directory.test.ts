import type { SkillItem } from '@yunyoujun/ai-docs/types'
import { filterSkills, getSkillCategories } from '@yunyoujun/ai-docs/filter'
import { describe, expect, it } from 'vitest'

const skills: SkillItem[] = [
  {
    id: 'liteapp-dev',
    name: 'liteapp-dev',
    title: 'LiteApp 开发与排障',
    category: '兼容性排障',
    description: '诊断 CSS、大字号与 Store 问题',
    tags: ['兼容性', '大字号'],
    install: 'npx skills add https://example.com/liteapp-dev/SKILL.md',
  },
  {
    id: 'liteapp-bundle-size',
    name: 'liteapp-bundle-size',
    title: 'LiteApp 包体积优化',
    category: '构建体积',
    description: '用 Rsdoctor 追踪冗余依赖',
    tags: ['包体积', 'Rsdoctor'],
    install: 'npx skills add https://example.com/liteapp-bundle-size/SKILL.md',
  },
  {
    id: 'no-category',
    name: 'no-category',
  },
]

describe('getSkillCategories', () => {
  it('汇总分类数量，未分类归入未分类', () => {
    expect(getSkillCategories(skills)).toEqual([
      { label: '兼容性排障', count: 1 },
      { label: '构建体积', count: 1 },
      { label: '未分类', count: 1 },
    ])
  })

  it('空列表返回空数组', () => {
    expect(getSkillCategories([])).toEqual([])
  })
})

describe('filterSkills', () => {
  it('无筛选时返回全部', () => {
    expect(filterSkills(skills)).toHaveLength(3)
  })

  it('按分类过滤', () => {
    const result = filterSkills(skills, { category: '构建体积' })
    expect(result.map(skill => skill.id)).toEqual(['liteapp-bundle-size'])
  })

  it('未声明分类的 Skill 可用「未分类」筛出', () => {
    const result = filterSkills(skills, { category: '未分类' })
    expect(result.map(skill => skill.id)).toEqual(['no-category'])
  })

  it('关键词命中名称、描述、标签与命令，忽略大小写', () => {
    expect(filterSkills(skills, { query: 'rsdoctor' }).map(skill => skill.id)).toEqual(['liteapp-bundle-size'])
    expect(filterSkills(skills, { query: 'SKILL.md' })).toHaveLength(2)
    expect(filterSkills(skills, { query: '排障' }).map(skill => skill.id)).toEqual(['liteapp-dev'])
  })

  it('关键词与分类同时生效', () => {
    expect(filterSkills(skills, { category: '兼容性排障', query: 'rsdoctor' })).toHaveLength(0)
    expect(filterSkills(skills, { category: '兼容性排障', query: '大字号' })).toHaveLength(1)
  })

  it('空白关键词等同于不过滤', () => {
    expect(filterSkills(skills, { query: '   ' })).toHaveLength(3)
  })
})
