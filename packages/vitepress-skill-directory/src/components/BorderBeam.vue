<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  duration?: number
  delay?: number
  colorFrom?: string
  colorTo?: string
}>(), {
  size: 200,
  duration: 18,
  delay: 0,
  colorFrom: '#07c160',
  colorTo: '#6c8cff',
})

const beamStyle = computed(() => ({
  '--beam-size': `${props.size}px`,
  '--beam-duration': `${props.duration}s`,
  '--beam-delay': `${props.delay}s`,
  '--beam-from': props.colorFrom,
  '--beam-to': props.colorTo,
}))
</script>

<template>
  <!-- 移植自 Inspira UI 的源码组件 Border Beam；父元素需 position: relative + overflow: hidden + border-radius -->
  <span class="border-beam" :style="beamStyle" aria-hidden="true" />
</template>

<style scoped>
.border-beam {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 1px solid transparent;
  border-radius: inherit;
  mask:
    linear-gradient(transparent, transparent) padding-box,
    linear-gradient(white, white) border-box;
  mask-composite: intersect;
  overflow: hidden;
}

.border-beam::after {
  position: absolute;
  width: var(--beam-size);
  aspect-ratio: 1;
  content: '';
  background: linear-gradient(to left, var(--beam-from), var(--beam-to), transparent 72%);
  offset-anchor: 90% 50%;
  offset-path: rect(0 auto auto 0 round var(--beam-size));
  animation: border-beam var(--beam-duration) var(--beam-delay) infinite linear;
}

@keyframes border-beam {
  to {
    offset-distance: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .border-beam::after {
    animation: none;
  }
}
</style>
