<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTimedClipboard } from '../use-timed-clipboard'

interface Props {
  title: string
  description: string
  prompt: string
  tags?: string[]
  /** 提示词很长时折叠预览，复制按钮仍会复制全文 */
  collapsible?: boolean
}

const props = defineProps<Props>()
const expanded = ref(false)
const { copiedKey, copyFailed, copyValue } = useTimedClipboard()
const copied = computed(() => copiedKey.value === 'prompt')

function copyToClipboard() {
  return copyValue(props.prompt, 'prompt')
}
</script>

<template>
  <article class="prompt-card">
    <header class="prompt-header">
      <div class="prompt-heading">
        <span class="prompt-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
            <path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z" fill="currentColor" />
          </svg>
        </span>
        <div class="prompt-heading-text">
          <h3 :id="title">
            {{ title }}
          </h3>
          <p>{{ description }}</p>
        </div>
      </div>
      <button
        class="copy-button"
        :class="{ 'is-copied': copied, 'is-error': copyFailed }"
        type="button"
        :aria-label="copyFailed ? '复制失败，请重试' : copied ? '提示词已复制' : '复制提示词'"
        @click="copyToClipboard"
      >
        <svg v-if="copied" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m4 10 4 4 8-8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <rect x="7" y="6" width="10" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
          <path d="M13 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span aria-live="polite">{{ copyFailed ? '复制失败' : copied ? '已复制' : '复制提示词' }}</span>
      </button>
    </header>

    <div v-if="tags?.length" class="prompt-tags" aria-label="标签">
      <span v-for="tag in tags" :key="tag" class="prompt-tag">{{ tag }}</span>
    </div>

    <div class="prompt-code">
      <div class="code-topline" aria-hidden="true">
        <span class="code-dots"><i /><i /><i /></span>
        <span>PROMPT</span>
      </div>
      <pre :class="{ 'is-clamped': collapsible && !expanded }"><code>{{ prompt }}</code></pre>
      <button
        v-if="collapsible"
        class="expand-button"
        type="button"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? '收起内容' : '展开完整提示词' }}
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" :class="{ 'is-expanded': expanded }">
          <path d="m5 8 5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.prompt-card {
  position: relative;
  overflow: hidden;
  margin: 20px 0 28px;
  padding: 24px;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 13%, var(--vp-c-divider));
  border-radius: 18px;
  background:
    radial-gradient(
      ellipse 65% 70% at 100% 0%,
      color-mix(in srgb, var(--vp-c-brand-1) 9%, transparent),
      transparent 75%
    ),
    var(--vp-c-bg-soft);
  box-shadow:
    0 12px 32px rgb(0 0 0 / 4%),
    0 2px 6px rgb(0 0 0 / 3%);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.prompt-card::before {
  position: absolute;
  top: 0;
  left: 18%;
  width: 64%;
  height: 1px;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--vp-c-brand-1) 50%, transparent),
    transparent
  );
}

.prompt-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 32%, var(--vp-c-divider));
  box-shadow:
    0 18px 42px rgb(0 0 0 / 7%),
    0 3px 10px rgb(0 0 0 / 4%);
}

.prompt-header,
.prompt-heading,
.copy-button,
.code-topline,
.expand-button {
  display: flex;
  align-items: center;
}

.prompt-header {
  justify-content: space-between;
  gap: 20px;
}

.prompt-heading {
  min-width: 0;
  gap: 14px;
}

.prompt-mark {
  display: grid;
  flex: none;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 22%, transparent);
  border-radius: 13px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, var(--vp-c-bg));
  color: var(--vp-c-brand-1);
}

.prompt-mark svg {
  width: 22px;
  height: 22px;
}

.prompt-heading-text {
  min-width: 0;
}

.prompt-heading-text h3 {
  margin: 0;
  padding: 0;
  border: 0;
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 650;
  line-height: 1.35;
}

.prompt-heading-text p {
  margin: 5px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.5;
}

.copy-button {
  flex: none;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 7px 13px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.copy-button:hover {
  opacity: 0.82;
  transform: translateY(-1px);
}

.copy-button:focus-visible,
.expand-button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.copy-button.is-error {
  background: var(--vp-c-danger-1);
  color: #fff;
}

.copy-button svg {
  width: 16px;
  height: 16px;
}

.prompt-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 18px;
}

.prompt-tag {
  padding: 3px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
}

.prompt-code {
  overflow: hidden;
  margin-top: 20px;
  border: 1px solid rgb(255 255 255 / 11%);
  border-radius: 12px;
  background: radial-gradient(circle at 95% 0%, rgb(124 108 255 / 11%), transparent 45%), #111318;
  color: #e6e8ef;
  box-shadow: 0 8px 18px rgb(0 0 0 / 10%);
}

.code-topline {
  gap: 12px;
  height: 38px;
  padding: 0 16px;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
  color: #8b91a0;
  font-family: var(--vp-font-family-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.code-dots {
  display: flex;
  gap: 5px;
}

.code-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #697080;
  opacity: 0.8;
}

.prompt-code pre {
  overflow: auto;
  margin: 0;
  padding: 18px 20px 20px;
  background: transparent;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.prompt-code pre.is-clamped {
  max-height: 154px;
  overflow: hidden;
  mask-image: linear-gradient(#000 65%, transparent);
}

.prompt-code code {
  color: inherit;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.8;
  white-space: inherit;
}

.expand-button {
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 40px;
  border: 0;
  border-top: 1px solid rgb(255 255 255 / 8%);
  background: rgb(255 255 255 / 3%);
  color: #d3d8e4;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.expand-button:hover {
  background: rgb(255 255 255 / 7%);
}

.expand-button svg {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.expand-button svg.is-expanded {
  transform: rotate(180deg);
}

@media (max-width: 640px) {
  .prompt-card {
    padding: 18px;
  }

  .prompt-header {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }

  .copy-button {
    align-self: flex-start;
  }

  .prompt-code pre {
    padding: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .prompt-card,
  .copy-button,
  .expand-button svg {
    transition: none;
  }

  .prompt-card:hover,
  .copy-button:hover {
    transform: none;
  }
}
</style>
