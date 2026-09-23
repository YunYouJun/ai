import { onBeforeUnmount, ref } from 'vue'

/**
 * 带状态反馈与自动复位的复制能力。
 * 优先使用 Clipboard API，失败时回退到 textarea + execCommand。
 */
export function useTimedClipboard(resetAfter = 2000) {
  const copiedKey = ref('')
  const copyFailed = ref(false)
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  function resetCopyState() {
    clearTimeout(resetTimer)
    copiedKey.value = ''
    copyFailed.value = false
  }

  function legacyCopy(text: string): boolean {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    }
    catch {
      ok = false
    }
    textarea.remove()
    return ok
  }

  /**
   * 复制 text，并用 key 标记本次复制来源（如 `install-web-app-dev`），
   * 便于多个复制按钮各自显示反馈。
   */
  async function copyValue(text: string, key = 'default') {
    resetCopyState()
    try {
      await navigator.clipboard.writeText(text)
      copiedKey.value = key
    }
    catch {
      if (legacyCopy(text))
        copiedKey.value = key
      else
        copyFailed.value = true
    }
    resetTimer = setTimeout(resetCopyState, resetAfter)
    return Boolean(copiedKey.value)
  }

  onBeforeUnmount(() => clearTimeout(resetTimer))

  return {
    copiedKey,
    copyFailed,
    copyValue,
    resetCopyState,
  }
}
