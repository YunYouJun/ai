import type { SkillItem } from './types'

export interface SkillFilter {
  query?: string
  category?: string
}

export interface SkillCategoryOption {
  label: string
  count: number
}

const UNCATEGORIZED = '未分类'

/** 汇总分类及数量，未声明分类的归入「未分类」 */
export function getSkillCategories(skills: SkillItem[]): SkillCategoryOption[] {
  const counts = new Map<string, number>()
  for (const skill of skills) {
    const category = skill.category?.trim() || UNCATEGORIZED
    counts.set(category, (counts.get(category) ?? 0) + 1)
  }

  return Array.from(counts, ([label, count]) => ({ label, count }))
}

function searchableText(skill: SkillItem): string {
  return [
    skill.name,
    skill.title,
    skill.description,
    skill.category,
    skill.install,
    ...(skill.tags ?? []),
    ...(skill.links ?? []).map(link => link.text),
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase()
}

/** 按分类和关键词过滤；关键词为空字符串时不过滤 */
export function filterSkills(skills: SkillItem[], filter: SkillFilter = {}): SkillItem[] {
  const query = filter.query?.trim().toLowerCase()

  return skills.filter((skill) => {
    if (filter.category && (skill.category?.trim() || UNCATEGORIZED) !== filter.category)
      return false
    if (!query)
      return true
    return searchableText(skill).includes(query)
  })
}
