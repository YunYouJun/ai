# Skill Directory 组件

[`@yunyoujun/vitepress-skill-directory`](https://github.com/YunYouJun/ai/tree/main/packages/vitepress-skill-directory) 是抽象自团队 Skills 目录的 VitePress 橱窗组件：卡片等高对齐、搜索、分类筛选、安装命令复制，数据由调用方注入。

下面的演示直接读取本仓库真实的 Skill（`skills/` 与 `plugins/ai-coding/skills/` 下的 `SKILL.md`，由 [data loader](https://vitepress.dev/guide/data-loading) 在构建期生成）：

<script setup>
import { SkillDirectory } from '@yunyoujun/vitepress-skill-directory'
import { data } from '../.vitepress/data/skills.data'
</script>

<SkillDirectory :skills="data" enable-view-toggle>
  <template #detail="{ skill }">
    <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2);">
      安装后通过 <code>${{ skill.name }}</code> 触发；用法见
      <a :href="skill.source.href" target="_blank" rel="noopener">源码</a>。
    </p>
  </template>
</SkillDirectory>

## 使用

```vue
<script setup>
import { SkillDirectory } from '@yunyoujun/vitepress-skill-directory'
import { data } from './skills.data' // 你的 data loader
</script>

<SkillDirectory :skills="data" enable-view-toggle />
```

数据模型与发布方式见[包 README](https://github.com/YunYouJun/ai/tree/main/packages/vitepress-skill-directory)。
