import type { CatalogSkill } from './skill-catalog'
import { defineLoader } from 'vitepress'
import { collectSkills } from './skill-catalog'

export type { CatalogSkill }

declare const data: CatalogSkill[]
export { data }

export default defineLoader({
  watch: ['../../../skills/*/SKILL.md', '../../../plugins/ai-coding/skills/*/SKILL.md'],
  load: collectSkills,
})
