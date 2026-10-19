# @yunyoujun/ai-docs

可复用的 VitePress / Vue 3 AI 文档组件。`SkillDirectory` 提供可搜索、可筛选的 Skills 目录，`PromptCard` 提供可复制、可折叠的提示词展示。

## 组件

- `SkillDirectory`：搜索、分类筛选、结果计数、橱窗/列表切换、空状态，内嵌 `BorderBeam` 工具栏光效
- `SkillCard`：图标 + 分类角标、标题、触发名、两行截断描述、标签、安装命令区（复制按钮带反馈）、可展开详情（`detail` 插槽）
- `PromptCard`：提示词展示、一键复制、长内容折叠与复制反馈
- `BorderBeam`：独立的边框流光装饰组件

## 提示词卡片

```vue
<script setup>
import { PromptCard } from '@yunyoujun/ai-docs'

const prompt = '请阅读当前项目的 README，概括项目用途。'
</script>

<PromptCard title="了解项目" description="快速认识仓库" :prompt="prompt" :tags="['入门']" />
```

`collapsible` 可折叠长提示词预览；复制按钮始终复制完整内容。剪贴板能力优先使用 Clipboard API，失败时回退到文本框复制。

## 数据模型

组件不关心数据从哪里来。用 VitePress data loader 或任意构建期脚本产出 `SkillItem[]`：

```ts
import type { SkillItem } from '@yunyoujun/ai-docs'

const skills: SkillItem[] = [
  {
    id: 'web-app-dev',
    name: 'web-app-dev', // Agent 触发名
    title: 'Web 应用 开发与排障', // 展示名，缺省回退到 name
    icon: '🧰',
    category: '兼容性排障',
    description: '在 AGENTS 约束下诊断 Web 应用 兼容性并给出可验证方案',
    tags: ['兼容性', '大字号', 'Store 与 API'],
    install: 'npx skills add https://example.com/skills/web-app-dev/SKILL.md',
    source: { text: '原文', href: '/skills/web-app-dev/SKILL.md' },
    links: [{ text: '相关指南', href: '/guide/ai' }],
  },
]
```

## 使用

在 VitePress Markdown 中直接使用：

```md
<script setup>
import { SkillDirectory } from '@yunyoujun/ai-docs'
import { data } from './skills.data'
</script>

<SkillDirectory :skills="data" enable-view-toggle>
  <template #detail="{ skill }">
    <p>{{ skill.description }}</p>
  </template>
</SkillDirectory>
```

`detail` 插槽存在时卡片会出现「详情/收起」按钮；`SkillCard` 也可单独使用。

## 样式

组件读取 VitePress 默认主题变量（`--vp-c-brand-1`、`--vp-c-bg` 等）并带 fallback，深浅色模式自动适配。不在 VitePress 里使用时可自行定义同名 CSS 变量。

## 非目标

- 不负责数据获取：没有内置 catalog 协议，数据注入是调用方的职责
- `SkillDirectory` 暂不做筛选状态的 URL 同步

## 发布

发布走 GitHub Actions 的 npm OIDC trusted publishing（工作流 `.github/workflows/publish-ai-docs.yml`），不保存长期 token，provenance 自动生成。

**新包准备**：配置 trusted publisher 前，[npm 要求 registry 中已有包记录](https://docs.npmjs.com/cli/v12/commands/npm-trust/)。可通过交互式 `npm publish` 创建包，也可先用 [`npm stage publish`](https://docs.npmjs.com/staged-publishing/) 创建 `0.0.0-stage` 占位记录；暂存的实际版本需维护者通过 2FA 审批后才公开。本地正式发布不是唯一的准备方式。已有包直接继续配置授权。

**一次性配置**：npmjs.com → 包 Settings → Trusted publisher → GitHub Actions：

| 字段                 | 值                    |
| -------------------- | --------------------- |
| Organization or user | `YunYouJun`           |
| Repository           | `ai`                  |
| Workflow filename    | `publish-ai-docs.yml` |
| Environment name     | 留空                  |
| Allowed actions      | 启用 `npm publish`    |

也可用 npm CLI ≥11.15.0 的 `npm trust` 配置（要求包写权限、账号启用 2FA，并完成身份验证）：

```bash
npm trust github @yunyoujun/ai-docs --repo YunYouJun/ai --file publish-ai-docs.yml --allow-publish --yes
```

配置后运行 `npm trust list @yunyoujun/ai-docs` 检查关联，查询也可能要求 2FA。[OIDC 发布本身](https://docs.npmjs.com/trusted-publishers/)最低要求 npm CLI ≥11.5.1、Node.js ≥22.14.0，与管理授权的 `npm trust` 命令版本要求不同。工作流使用 Node.js 24 和 npm 11，pnpm 负责安装与验证，发布由 `npm publish` 执行。

**之后每次发布**：

```bash
# 升级 packages/ai-docs/package.json 的 version，提交并推送到 main 后：
release_version="$(node -p "require('./packages/ai-docs/package.json').version")"
git tag "ai-docs-v${release_version}"
git push origin "ai-docs-v${release_version}"
```

或在 Actions 页面手动触发 `Publish ai-docs` 工作流。确认 OIDC 可用后，可在包设置的 Publishing access 里选「Require 2FA and disallow tokens」收口。

工作流会检查 tag 与包版本一致，并通过 lint、类型检查、测试和文档构建后再发布。已发布版本不可重复发布，手动触发前也需升级版本。

**发布验收**：发布前审阅实际 `npm pack` 归档的文件列表和内容，确认没有密钥、内部地址、本机路径或业务数据，并记录 SHA512。工作流会检查 GitHub OIDC 环境，拒绝传统 npm 凭据和仓库内的 `.npmrc`，并使用空的 user/global npm 配置发布，避免回退到 token 认证。

发布后核对 Actions 的提交、版本和发布步骤结果；匿名查询版本元数据并下载 tarball，确认 `dist.integrity` 与审阅包一致，再检查公开 provenance 的仓库、工作流、ref 和完整提交 SHA。[provenance 本身](https://docs.npmjs.com/generating-provenance-statements/)也可配合 token 发布生成，因此应结合工作流排除传统凭据的检查来验收 OIDC；仅有 workflow 文件、配置成功或 provenance 标记都不代表实际发布已验证。

发布后可被任意 Vue 3 + Vite 项目（含 VitePress 站点）安装使用。
