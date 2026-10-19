<script setup lang="ts">
import type { SkillItem } from '../types'
import { computed, ref } from 'vue'
import { filterSkills, getSkillCategories } from '../filter'
import BorderBeam from './BorderBeam.vue'
import SkillCard from './SkillCard.vue'

const props = withDefaults(defineProps<{
  skills: SkillItem[]
  /** 搜索框占位文案 */
  searchPlaceholder?: string
  /** 是否显示橱窗/列表切换 */
  enableViewToggle?: boolean
  defaultView?: 'grid' | 'list'
  /** 工具栏边框光效 */
  borderBeam?: boolean
}>(), {
  searchPlaceholder: '搜索名称、场景或关键词',
  enableViewToggle: false,
  defaultView: 'grid',
  borderBeam: true,
})

const query = ref('')
const category = ref('')
const view = ref<'grid' | 'list'>(props.defaultView)
const searchInput = ref<HTMLInputElement | null>(null)

const categories = computed(() => getSkillCategories(props.skills))

const filteredSkills = computed(() => filterSkills(props.skills, {
  query: query.value,
  category: category.value,
}))

const hasFilters = computed(() => Boolean(query.value || category.value))

function clearFilters() {
  query.value = ''
  category.value = ''
}

function onSearchEscape() {
  query.value = ''
  searchInput.value?.blur()
}
</script>

<template>
  <section class="sd-directory" aria-label="Skill 目录">
    <div class="sd-toolbar">
      <BorderBeam v-if="borderBeam" />
      <div class="sd-toolbar-main">
        <label class="sd-search">
          <span class="sd-sr">搜索 Skill</span>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m12.5 12.5 4 4" />
          </svg>
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            :placeholder="searchPlaceholder"
            autocomplete="off"
            @keydown.esc.prevent.stop="onSearchEscape"
          >
        </label>
        <div class="sd-results" aria-live="polite">
          <strong>{{ filteredSkills.length }}</strong>
          <span>/ {{ skills.length }} 个结果</span>
        </div>
      </div>

      <div class="sd-toolbar-sub">
        <div class="sd-category-filter" role="group" aria-label="按分类筛选">
          <button
            type="button"
            class="sd-pill"
            :class="{ 'is-active': !category }"
            :aria-pressed="!category"
            @click="category = ''"
          >
            全部<span class="sd-pill-count">{{ skills.length }}</span>
          </button>
          <button
            v-for="item in categories"
            :key="item.label"
            type="button"
            class="sd-pill"
            :class="{ 'is-active': category === item.label }"
            :aria-pressed="category === item.label"
            @click="category = item.label"
          >
            {{ item.label }}<span class="sd-pill-count">{{ item.count }}</span>
          </button>
        </div>

        <div v-if="enableViewToggle" class="sd-views" role="group" aria-label="切换展示方式">
          <button
            type="button"
            class="sd-pill"
            :class="{ 'is-active': view === 'grid' }"
            :aria-pressed="view === 'grid'"
            @click="view = 'grid'"
          >
            橱窗
          </button>
          <button
            type="button"
            class="sd-pill"
            :class="{ 'is-active': view === 'list' }"
            :aria-pressed="view === 'list'"
            @click="view = 'list'"
          >
            列表
          </button>
        </div>

        <button v-if="hasFilters" type="button" class="sd-clear" @click="clearFilters">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8m0-8-8 8" /></svg>
          清除筛选
        </button>
      </div>
    </div>

    <div v-if="filteredSkills.length" class="sd-grid" :class="view === 'grid' ? 'is-grid' : 'is-list'">
      <SkillCard
        v-for="skill in filteredSkills"
        :key="skill.id"
        :skill="skill"
        :layout="view === 'list' ? 'row' : 'card'"
      >
        <template v-if="$slots.detail" #detail="{ skill: item }">
          <slot name="detail" :skill="item" />
        </template>
      </SkillCard>
    </div>

    <div v-else class="sd-empty">
      <strong>没有匹配的 Skill</strong>
      <p>换一个关键词，或清除当前筛选。</p>
      <button v-if="hasFilters" type="button" class="sd-empty-clear" @click="clearFilters">
        清除筛选
      </button>
    </div>
  </section>
</template>

<style scoped>
.sd-directory {
  margin-top: 24px;
}

.sd-toolbar {
  position: relative;
  display: grid;
  gap: 14px;
  padding: 16px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider, #e2e2e3) 80%, var(--vp-c-brand-1, #646cff));
  border-radius: 16px;
  background:
    radial-gradient(
      circle at 8% -35%,
      color-mix(in srgb, var(--vp-c-brand-1, #646cff) 13%, transparent),
      transparent 45%
    ),
    color-mix(in srgb, var(--vp-c-bg-soft, #f6f6f7) 86%, var(--vp-c-bg, #fff));
  box-shadow: 0 18px 50px color-mix(in srgb, var(--vp-c-brand-1, #646cff) 6%, transparent);
}

.sd-toolbar-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
}

.sd-search {
  position: relative;
  display: flex;
  align-items: center;
}

.sd-search svg {
  position: absolute;
  left: 13px;
  width: 17px;
  height: 17px;
  fill: none;
  stroke: var(--vp-c-text-3, #a2a2a3);
  stroke-linecap: round;
  stroke-width: 1.6;
  pointer-events: none;
}

.sd-search input {
  width: 100%;
  min-height: 44px;
  padding: 9px 14px 9px 40px;
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 9px;
  font: inherit;
  font-size: 14px;
  outline: none;
}

.sd-search input:focus {
  border-color: var(--vp-c-brand-1, #646cff);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1, #646cff) 14%, transparent);
}

.sd-results {
  display: flex;
  gap: 5px;
  align-items: center;
  white-space: nowrap;
  color: var(--vp-c-text-2, #476582);
  font-size: 13px;
}

.sd-results strong {
  color: var(--vp-c-brand-1, #646cff);
  font-size: 22px;
  line-height: 1;
}

.sd-toolbar-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.sd-category-filter,
.sd-views {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sd-pill {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 11px;
  color: var(--vp-c-text-2, #476582);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.sd-pill:hover {
  color: var(--vp-c-text-1, #213547);
  background: color-mix(in srgb, var(--vp-c-bg, #fff) 72%, transparent);
}

.sd-pill.is-active {
  color: var(--vp-c-brand-1, #646cff);
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 11%, var(--vp-c-bg, #fff));
  border-color: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 22%, transparent);
  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);
}

.sd-pill-count {
  color: var(--vp-c-text-3, #a2a2a3);
  font-size: 11px;
  font-weight: 500;
}

.sd-views {
  margin-left: auto;
}

.sd-clear {
  display: inline-flex;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  min-height: 36px;
  padding: 0 5px;
  color: var(--vp-c-brand-1, #646cff);
  background: transparent;
  border: none;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.sd-clear svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.5;
}

.sd-grid {
  display: grid;
  gap: 14px;
  align-items: stretch;
  margin-top: 16px;
}

.sd-grid.is-grid {
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.sd-grid.is-list {
  grid-template-columns: 1fr;
  gap: 10px;
}

.sd-empty {
  margin-top: 16px;
  padding: 48px 20px;
  color: var(--vp-c-text-2, #476582);
  border: 1px dashed var(--vp-c-divider, #e2e2e3);
  border-radius: 14px;
  text-align: center;
}

.sd-empty strong {
  color: var(--vp-c-text-1, #213547);
}

.sd-empty p {
  margin: 6px 0 12px;
}

.sd-empty-clear {
  padding: 6px 14px;
  color: var(--vp-c-brand-1, #646cff);
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1, #646cff) 30%, transparent);
  border-radius: 8px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.sd-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sd-pill:focus-visible,
.sd-clear:focus-visible,
.sd-empty-clear:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #646cff);
  outline-offset: 2px;
}

@media (max-width: 760px) {
  .sd-toolbar-main {
    grid-template-columns: 1fr;
  }

  .sd-results {
    justify-content: flex-start;
  }

  .sd-views {
    margin-left: 0;
  }
}

@media (max-width: 640px) {
  .sd-toolbar {
    margin-inline: -8px;
    padding: 14px;
    border-radius: 14px;
  }

  .sd-grid.is-grid {
    grid-template-columns: 1fr;
  }
}
</style>
