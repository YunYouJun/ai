<script setup lang="ts">
import type { SkillItem } from '../types'
import { computed, ref, useSlots } from 'vue'
import { useTimedClipboard } from '../use-timed-clipboard'

const props = defineProps<{
  skill: SkillItem
}>()

const slots = useSlots()
const expanded = ref(false)
const hasDetail = computed(() => Boolean(slots.detail))

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

function toggle() {
  expanded.value = !expanded.value
}
</script>

<template>
  <article class="sd-card" :class="{ 'is-open': expanded }">
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
          {{ skillTitle }}
        </h3>
        <div v-if="skillTitle !== skill.name" class="sd-id-row">
          <span aria-hidden="true">#</span>
          <code class="sd-id">{{ skill.name }}</code>
        </div>
        <p v-if="skill.description" class="sd-desc">
          {{ skill.description }}
        </p>
        <div v-if="skill.tags?.length" class="sd-tags" aria-label="技术标签">
          <span v-for="tag in skill.tags.slice(0, 3)" :key="tag" class="sd-tag">{{ tag }}</span>
        </div>
      </div>

      <div class="sd-card-footer">
        <div class="sd-cmd">
          <svg class="sd-cmd-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4L6 8L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 12H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <code v-if="skill.install" class="sd-cmd-text" :title="skill.install" :aria-label="skill.install">{{ skill.install }}</code>
          <code v-else class="sd-cmd-text sd-cmd-empty">暂无可复制命令</code>
        </div>

        <div class="sd-actions">
          <a
            v-if="skill.source"
            class="sd-source-link"
            :href="skill.source.href"
            :title="skill.source.text"
            :aria-label="`查看 ${skillTitle} ${skill.source.text}`"
          >
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M9 3H13V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7 9L13 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              <path d="M13 10.5V12.5A1.5 1.5 0 0 1 11.5 14H3.5A1.5 1.5 0 0 1 2 12.5V4.5A1.5 1.5 0 0 1 3.5 3H5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span>{{ skill.source.text }}</span>
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
          </button>
          <button
            v-if="skill.install"
            type="button"
            class="sd-copy-btn"
            :class="{ copied: installCopied, error: copyFailed && !installCopied }"
            :aria-label="copyLabel"
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
            <span>{{ copyLabel }}</span>
          </button>
        </div>
      </div>

      <div v-if="hasDetail" v-show="expanded" :id="`sd-detail-${skill.id}`" class="sd-detail">
        <slot name="detail" :skill="skill" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.sd-card {
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

.sd-card:active {
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
  gap: 8px;
  align-items: stretch;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider, #e2e2e3) 82%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--vp-c-bg-soft, #f6f6f7) 62%, transparent);
}

.sd-cmd {
  display: flex;
  flex: 1;
  gap: 7px;
  align-items: flex-start;
  min-width: 0;
  min-height: 40px;
  padding: 7px 8px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider, #e2e2e3) 70%, transparent);
  border-radius: 7px;
  background: color-mix(in srgb, var(--vp-c-bg, #fff) 78%, transparent);
}

.sd-cmd-icon {
  flex-shrink: 0;
  width: 13px;
  height: 13px;
  margin-top: 2px;
  color: var(--vp-c-brand-1, #646cff);
  opacity: 0.82;
}

.sd-cmd-text {
  min-width: 0;
  width: 100%;
  padding: 0;
  color: var(--vp-c-text-2, #476582);
  background: none;
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 11px;
  line-height: 1.5;
  letter-spacing: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.sd-cmd-empty {
  color: var(--vp-c-text-3, #a2a2a3);
}

.sd-actions {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  width: 100%;
}

.sd-source-link,
.sd-detail-btn,
.sd-copy-btn {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 10px;
  color: var(--vp-c-text-3, #a2a2a3);
  background: transparent;
  border: none;
  border-radius: 7px;
  font: inherit;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sd-source-link svg {
  width: 13px;
  height: 13px;
}

.sd-source-link:hover,
.sd-detail-btn:hover {
  color: var(--vp-c-brand-1, #646cff);
  background: var(--vp-c-bg, #fff);
  box-shadow: 0 1px 3px rgb(0 0 0 / 8%);
}

.sd-detail-btn {
  color: var(--vp-c-text-2, #476582);
}

.sd-copy-btn {
  min-width: 92px;
  margin-left: auto;
  padding-inline: 11px;
  color: var(--vp-c-brand-1, #646cff);
  background: color-mix(in srgb, var(--vp-c-brand-1, #646cff) 11%, var(--vp-c-bg, #fff));
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
  width: 13px;
  height: 13px;
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

.sd-source-link:focus-visible,
.sd-detail-btn:focus-visible,
.sd-copy-btn:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #646cff);
  outline-offset: 2px;
}

.sd-detail {
  padding: 12px 10px 4px;
  border-top: 1px solid var(--vp-c-divider, #e2e2e3);
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
  .sd-detail-btn,
  .sd-copy-btn {
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sd-card,
  .sd-icon-wrap,
  .sd-source-link,
  .sd-detail-btn,
  .sd-copy-btn {
    transition: none;
  }
}
</style>
