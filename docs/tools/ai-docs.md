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

下面的演示直接读取本仓库真实的 Skill（`skills/` 与 `plugins/ai-coding/skills/` 下的 `SKILL.md`，由 [data loader](https://vitepress.dev/guide/data-loading) 在构建期生成，并合并 `skill-catalog.ts` 中的展示信息）。完整目录见 [Skills 目录](/guide/skills)。

<SkillDirectory :skills="data" enable-view-toggle>
  <template #detail="{ skill }">
    <p style="margin: 0; font-size: 13px; color: var(--vp-c-text-2);">
      安装后通过 <code>{{ skill.command }}</code> 调用；
      <a :href="skill.repo" target="_blank" rel="noopener">查看源码</a>。
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

## OIDC 发布验收

2026-10-19，`@yunyoujun/ai-docs@0.1.2` 已完成 GitHub Actions → npm OIDC 实际发布验收：

- 可信发布者绑定为 `YunYouJun/ai` 的 `publish-ai-docs.yml`，发布不依赖长期 npm token。
- [发布工作流](https://github.com/YunYouJun/ai/actions/runs/39246077503)由 tag `ai-docs-v0.1.2` 触发，源码提交为 `250dda32a023613a960dcc94759857e039b9cb14`；安装、lint、类型检查、78 项测试、文档构建及发布步骤全部通过。
- 发布步骤确认 GitHub OIDC 环境存在，拒绝传统 npm 凭据，并使用空的 user/global npm 配置。npm 的公开元数据将发布者记录为 `GitHub Actions`，且 `trustedPublisher` 指向本次创建的绑定。
- [公开版本](https://www.npmjs.com/package/@yunyoujun/ai-docs/v/0.1.2)的 tarball 共 12 个文件、13,693 字节，与发布前审阅的归档逐文件一致；未发现敏感信息。公开 provenance 的仓库、工作流、tag、提交 SHA、Actions run 和产物摘要均已核对。
- 在独立临时项目中安装该版本并执行 `npm audit signatures`，24 个包的 registry 签名与 18 个包的 attestations 均验证通过。

本次发布包的 SHA512：

```text
sha512-BFRDLmITcYop+qms4IpN2AVQvz7CRzYt9s9Xa1fvx5dygjtYv7+0r1hGSBOuIrY9LpHrmsvwllRE6S+PUzuokQ==
```
