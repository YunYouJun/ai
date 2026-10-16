import { fileURLToPath } from 'node:url'
import { generateBrandAssets } from 'vitepress-theme-yunlefun/brand-assets'
import { aiMark } from '../.vitepress/ai-mark.ts'

await generateBrandAssets({
  outDir: fileURLToPath(new URL('../public/', import.meta.url)),
  icon: aiMark,
  title: '小云的 AI 开发实践',
})
