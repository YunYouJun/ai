# AI Docs 组件

[`@yunyoujun/ai-docs`](https://github.com/YunYouJun/ai/tree/main/packages/ai-docs) 提供可复用的 Vue 3 文档组件，包括提示词卡片和 Skills 目录。组件使用 VitePress 主题变量，也可在普通 Vue 项目中自定义同名变量。

<script setup>
import { PromptCard, SkillDirectory } from '@yunyoujun/ai-docs'
import { data } from '../.vitepress/data/skills.data'

const examplePrompt = '请阅读当前项目的 README 和 package.json，概括项目用途与常用命令。'
</script>

## PromptCard

提示词卡片支持一键复制、长内容折叠、浅色与深色主题。

<PromptCard
  title="了解项目"
  description="复制提示词，让 AI 快速介绍当前仓库"
  :prompt="examplePrompt"
  :tags="['代码阅读', '入门']"
/>

```vue
<script setup>
import { PromptCard } from '@yunyoujun/ai-docs'

const prompt = '请阅读当前项目的 README，说明项目用途。'
</script>

<PromptCard title="了解项目" description="快速认识仓库" :prompt="prompt" />
```

## SkillDirectory

下面的演示直接读取本仓库真实的 Skill（`skills/` 与 `plugins/ai-coding/skills/` 下的 `SKILL.md`，由 [data loader](https://vitepress.dev/guide/data-loading) 在构建期生成）：

<SkillDirectory :skills="data" enable-view-toggle>
  <template #detail="{ skill }">
    <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2);">
      安装后通过 <code>${{ skill.name }}</code> 触发；用法见
      <a :href="skill.source.href" target="_blank" rel="noopener">源码</a>。
    </p>
  </template>
</SkillDirectory>

### 使用

```vue
<script setup>
import { SkillDirectory } from '@yunyoujun/ai-docs'
import { data } from './skills.data' // 你的 data loader
</script>

<SkillDirectory :skills="data" enable-view-toggle />
```

数据模型与发布方式见[包 README](https://github.com/YunYouJun/ai/tree/main/packages/ai-docs)。
