<script setup lang="ts">
import type { SkillItem } from '../types'
import { computed, ref, useSlots } from 'vue'
import { useTimedClipboard } from '../use-timed-clipboard'

const props = withDefaults(defineProps<{
  skill: SkillItem
  /** `row` 为列表视图的横向布局，卡片较窄时自动回到纵向 */
  layout?: 'card' | 'row'
}>(), {
  layout: 'card',
})

const slots = useSlots()
const expanded = ref(false)
const hasDetail = computed(() => Boolean(slots.detail || props.skill.links?.length))

const {
  copiedKey,
  copyFailed,
  copyValue,
} = useTimedClipboard()

const skillTitle = computed(() => props.skill.title || props.skill.name)
const installCopied = computed(() => copiedKey.value === `install-${props.skill.id}`)
const copyLabel = computed(() => copyFailed.value
  ? '复制失败'
  : installCopied.value ? '已复制' : '复制命令')
/** 逐词渲染，让命令只在空格处换行，不在 `--flag` 的连字符处断开 */
const installParts = computed(() => props.skill.install?.trim().split(/\s+/) ?? [])

function isExternal(href: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(href)
}

function linkAttrs(href: string) {
  return isExternal(href) ? { target: '_blank', rel: 'noopener' } : {}
}

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <article class="sd-card" :class="[`is-${layout}`, { 'is-open': expanded }]">
    <div class="sd-card-inner">
      <div class="sd-card-head">
        <span class="sd-icon-wrap">
          <span v-if="skill.icon" class="sd-icon">{{ skill.icon }}</span>
          <span v-else class="sd-icon-fallback">✦</span>
        </span>
        <span v-if="skill.category" class="sd-badge">{{ skill.category }}</span>
      </div>

      <div class="sd-card-body">
        <h3 class="sd-title">
          <a v-if="skill.source" :href="skill.source.href" v-bind="linkAttrs(skill.source.href)">{{ skillTitle }}</a>
          <template v-else>
            {{ skillTitle }}
          </template>
        </h3>
        <div v-if="skillTitle !== skill.name" class="sd-id-row">
          <span aria-hidden="true">#</span>
          <code class="sd-id">{{ skill.name }}</code>
        </div>
        <p v-if="skill.description" class="sd-desc" :title="skill.description">
          {{ skill.description }}
        </p>
        <div v-if="skill.tags?.length" class="sd-tags" aria-label="技术标签">
          <span v-for="tag in skill.tags.slice(0, 3)" :key="tag" class="sd-tag">{{ tag }}</span>
        </div>
      </div>

      <div v-if="skill.install || skill.source || hasDetail" class="sd-card-footer">
        <div v-if="skill.install" class="sd-cmd">
          <svg class="sd-cmd-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4L6 8L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <code class="sd-cmd-text" :title="skill.install">
            <template v-for="(part, index) in installParts" :key="index">{{ index ? ' ' : '' }}<span class="sd-cmd-part">{{ part }}</span></template>
          </code>
          <button
            type="button"
            class="sd-copy-btn"
            :class="{ copied: installCopied, error: copyFailed && !installCopied }"
            :aria-label="copyLabel"
            :title="copyLabel"
            @click="copyValue(skill.install!, `install-${skill.id}`)"
          >
            <svg v-if="installCopied" class="sd-icon-check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8.5L6.5 12L13 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <svg v-else-if="copyFailed" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8m0-8-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
            </svg>
            <svg v-else viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5" />
              <path d="M3 11V3.5A1.5 1.5 0 0 1 4.5 2H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
          <span class="sd-sr" role="status">{{ installCopied || copyFailed ? copyLabel : '' }}</span>
        </div>

        <div v-if="skill.source || hasDetail" class="sd-actions">
          <a
            v-if="skill.source"
            class="sd-source-link"
            :href="skill.source.href"
            v-bind="linkAttrs(skill.source.href)"
            :aria-label="`查看 ${skillTitle} ${skill.source.text}`"
          >
            <span>{{ skill.source.text }}</span>
            <svg v-if="isExternal(skill.source.href)" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3H13V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 3L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <svg v-else viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M9 4L13 8L9 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </a>
          <button
            v-if="hasDetail"
            type="button"
            class="sd-detail-btn"
            :aria-expanded="expanded"
            :aria-controls="`sd-detail-${skill.id}`"
            @click="toggle"
          >
            {{ expanded ? '收起' : '详情' }}
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div v-if="hasDetail" v-show="expanded" :id="`sd-detail-${skill.id}`" class="sd-detail">
        <slot name="detail" :skill="skill" />
        <ul v-if="skill.links?.length" class="sd-links">
          <li v-for="link in skill.links" :key="link.href">
            <a :href="link.href" v-bind="linkAttrs(link.href)">{{ link.text }}</a>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<style scoped>
.sd-card {
  container-type: inline-size;
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 13px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--vp-c-brand-1, #646cff) 4%, transparent), transparent 32%),
    var(--vp-c-bg, #fff);
  box-shadow: 0 1px 2px rgb(0 0 0 / 2%);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.sd-card:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 36%, var(--vp-c-divider, #e2e2e3));
  box-shadow:
    0 16px 34px color-mix(in srgb, var(--vp-c-brand-1, #646cff) 8%, transparent),
    0 4px 10px rgb(0 0 0 / 4.5%);
}

.sd-card.is-row:hover {
  transform: translateY(-1px);
}

.sd-card-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  padding: 17px;
}

.sd-card-head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.sd-icon-wrap {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1, #646cff) 15%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 9%, var(--vp-c-bg, #fff));
  box-shadow: inset 0 1px 0 color-mix(in srgb, white 62%, transparent);
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.sd-card:hover .sd-icon-wrap {
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 16%, var(--vp-c-bg-alt, #f6f6f7));
  border-color: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 30%, transparent);
}

.sd-icon {
  font-size: 1.35em;
  line-height: 1;
}

.sd-icon-fallback {
  color: var(--vp-c-brand-1, #646cff);
  font-size: 1em;
  line-height: 1;
}

.sd-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  color: var(--vp-c-brand-1, #646cff);
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 10%, var(--vp-c-bg, #fff));
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1, #646cff) 20%, transparent);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.sd-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.sd-title {
  margin: 0;
  padding: 0;
  color: var(--vp-c-text-1, #213547);
  font-size: 16px;
  font-weight: 720;
  line-height: 1.35;
  letter-spacing: -0.015em;
  border: 0;
}

.sd-title a {
  color: inherit;
  font-weight: inherit;
  text-decoration: none;
  transition: color 0.15s ease;
}

.sd-title a:hover {
  color: var(--vp-c-brand-1, #646cff);
}

.sd-id-row {
  display: inline-flex;
  align-self: flex-start;
  gap: 4px;
  align-items: center;
  max-width: 100%;
  padding: 2px 7px;
  color: var(--vp-c-text-3, #a2a2a3);
  background: color-mix(in srgb, var(--vp-c-bg-alt, #f6f6f7) 72%, transparent);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.45;
}

.sd-id {
  min-width: 0;
  padding: 0;
  color: inherit;
  background: none;
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: inherit;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sd-desc {
  min-height: 3.2em;
  margin: 0;
  color: var(--vp-c-text-2, #476582);
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.sd-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.sd-tag {
  padding: 2px 7px;
  color: var(--vp-c-text-2, #476582);
  background: color-mix(in srgb, var(--vp-c-bg-alt, #f6f6f7) 72%, transparent);
  border: 1px solid var(--vp-c-divider, #e2e2e3);
  border-radius: 999px;
  font-size: 10.5px;
  line-height: 1.5;
}

.sd-card-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.sd-cmd {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  min-height: 46px;
  padding: 6px 6px 6px 10px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider, #e2e2e3) 82%, transparent);
  border-radius: 9px;
  background: color-mix(in srgb, var(--vp-c-bg-soft, #f6f6f7) 70%, transparent);
}

.sd-cmd-icon {
  flex-shrink: 0;
  align-self: flex-start;
  width: 13px;
  height: 13px;
  margin-top: 5px;
  color: var(--vp-c-brand-1, #646cff);
  opacity: 0.82;
}

.sd-cmd-text {
  flex: 1;
  min-width: 0;
  padding: 0;
  color: var(--vp-c-text-1, #213547);
  background: none;
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 11.5px;
  line-height: 1.6;
  letter-spacing: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 单词整体换行；超出整行的长参数（如 URL）才在词内断开 */
.sd-cmd-part {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.sd-copy-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--vp-c-brand-1, #646cff);
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 11%, var(--vp-c-bg, #fff));
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sd-copy-btn:hover {
  background: var(--vp-c-bg, #fff);
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}

.sd-copy-btn.copied {
  color: var(--vp-c-green-1, #15915d);
  background: color-mix(in srgb, var(--vp-c-green-1, #15915d) 12%, transparent);
}

.sd-copy-btn.error {
  color: var(--vp-c-danger-1, #c34a42);
  background: color-mix(in srgb, var(--vp-c-danger-1, #c34a42) 11%, transparent);
}

.sd-copy-btn svg {
  width: 14px;
  height: 14px;
}

.sd-icon-check {
  animation: sd-check-pop 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes sd-check-pop {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.sd-actions {
  display: flex;
  gap: 4px;
  align-items: center;
  min-height: 30px;
}

.sd-source-link,
.sd-detail-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 30px;
  padding: 0 8px;
  background: transparent;
  border: none;
  border-radius: 7px;
  font: inherit;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sd-source-link {
  margin-left: -8px;
  color: var(--vp-c-brand-1, #646cff);
}

.sd-detail-btn {
  margin-left: auto;
  margin-right: -6px;
  color: var(--vp-c-text-2, #476582);
}

.sd-source-link svg,
.sd-detail-btn svg {
  width: 13px;
  height: 13px;
  transition: transform 0.2s ease;
}

.sd-source-link:hover,
.sd-detail-btn:hover {
  color: var(--vp-c-brand-1, #646cff);
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 8%, transparent);
}

.sd-source-link:hover svg {
  transform: translateX(2px);
}

.sd-card.is-open .sd-detail-btn svg {
  transform: rotate(180deg);
}

.sd-title a:focus-visible,
.sd-source-link:focus-visible,
.sd-detail-btn:focus-visible,
.sd-copy-btn:focus-visible,
.sd-links a:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #646cff);
  outline-offset: 2px;
}

.sd-detail {
  padding: 12px 2px 2px;
  border-top: 1px solid var(--vp-c-divider, #e2e2e3);
}

.sd-links {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
}

.sd-links li {
  margin: 0;
}

.sd-links a {
  color: var(--vp-c-brand-1, #646cff);
  font-weight: 600;
  text-decoration: none;
}

.sd-links a:hover {
  text-decoration: underline;
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

/* 列表视图：图标 | 正文 | 命令，足够宽时才横排 */
@container (min-width: 680px) {
  .is-row .sd-card-inner {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) minmax(250px, 34%);
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
      'icon badge footer'
      'icon body footer'
      'detail detail detail';
    gap: 6px 18px;
    padding: 16px 18px;
  }

  .is-row .sd-card-head {
    display: contents;
  }

  .is-row .sd-icon-wrap {
    grid-area: icon;
  }

  .is-row .sd-badge {
    grid-area: badge;
    justify-self: start;
    padding: 2px 8px;
    font-size: 10.5px;
  }

  .is-row .sd-card-body {
    grid-area: body;
  }

  .is-row .sd-desc {
    min-height: 0;
  }

  .is-row .sd-card-footer {
    grid-area: footer;
    align-self: center;
  }

  .is-row .sd-detail {
    grid-area: detail;
    margin-top: 8px;
  }
}

@media (max-width: 640px) {
  .sd-card-inner {
    gap: 14px;
    padding: 16px;
  }

  .sd-desc {
    min-height: 0;
  }

  .sd-source-link,
  .sd-detail-btn {
    height: 36px;
  }

  .sd-copy-btn {
    width: 36px;
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sd-card,
  .sd-icon-wrap,
  .sd-title a,
  .sd-source-link,
  .sd-source-link svg,
  .sd-detail-btn,
  .sd-detail-btn svg,
  .sd-copy-btn {
    transition: none;
  }

  .sd-icon-check {
    animation: none;
  }
}
</style>
