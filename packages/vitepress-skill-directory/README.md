# @yunyoujun/vitepress-skill-directory

VitePress / Vue 3 的 Agent Skill 目录橱窗组件。抽象自 [wx_fed/base/team](https://git.woa.com/wx_fed/base/team) Skills 目录的卡片实现，去掉了其 catalog 数据模型耦合，数据由调用方注入。

## 组件

- `SkillDirectory`：搜索、分类筛选、结果计数、橱窗/列表切换、空状态，内嵌 `BorderBeam` 工具栏光效
- `SkillCard`：图标 + 分类角标、标题、触发名、两行截断描述、标签、安装命令区（复制按钮带反馈）、可展开详情（`detail` 插槽）
- `BorderBeam`：独立的边框流光装饰组件

## 数据模型

组件不关心数据从哪里来。用 VitePress data loader 或任意构建期脚本产出 `SkillItem[]`：

```ts
import type { SkillItem } from '@yunyoujun/vitepress-skill-directory'

const skills: SkillItem[] = [
  {
    id: 'liteapp-dev',
    name: 'liteapp-dev', // Agent 触发名
    title: 'LiteApp 开发与排障', // 展示名，缺省回退到 name
    icon: '🧰',
    category: '兼容性排障',
    description: '在 AGENTS 约束下诊断 LiteApp 兼容性并给出可验证方案',
    tags: ['兼容性', '大字号', 'Store 与 API'],
    install: 'npx skills add https://example.com/skills/liteapp-dev/SKILL.md',
    source: { text: '原文', href: '/skills/liteapp-dev/SKILL.md' },
    links: [{ text: '相关指南', href: '/guide/ai' }],
  },
]
```

## 使用

在 VitePress Markdown 中直接使用：

```md
<script setup>
import { SkillDirectory } from '@yunyoujun/vitepress-skill-directory'
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
- v1 不做筛选状态的 URL 同步（team 版有此能力，需要时可后补）

## 发布

发布走 GitHub Actions 的 npm OIDC trusted publishing（工作流 `.github/workflows/publish-skill-directory.yml`），不保存长期 token，provenance 自动生成。

**首次发布**（包还不存在，npm 无法预先配置 trusted publisher）：

```bash
cd packages/vitepress-skill-directory
npm publish # 本地登录 npm 账号，2FA 验证
```

**一次性配置**：npmjs.com → 包 Settings → Trusted publisher → GitHub Actions：

| 字段                 | 值                            |
| -------------------- | ----------------------------- |
| Organization or user | `YunYouJun`                   |
| Repository           | `ai`                          |
| Workflow filename    | `publish-skill-directory.yml` |
| Environment name     | 留空                          |
| Allowed actions      | 启用 `npm publish`            |

也可用支持 `npm trust` 的新版 npm CLI 配置（会要求身份验证）：

```bash
npm trust github @yunyoujun/vitepress-skill-directory --repo YunYouJun/ai --file publish-skill-directory.yml --allow-publish --yes
```

配置后运行 `npm trust list @yunyoujun/vitepress-skill-directory` 检查关联。官方要求 npm CLI ≥11.5.1、Node.js ≥22.14.0；工作流使用 Node.js 24 和 npm 11，pnpm 负责安装与验证，发布由 `npm publish` 执行。

**之后每次发布**：

```bash
# 升级 packages/vitepress-skill-directory/package.json 的 version，提交并推送到 main 后：
git tag skill-directory-v0.0.2 && git push origin skill-directory-v0.0.2
```

或在 Actions 页面手动触发 `Publish vitepress-skill-directory` 工作流。确认 OIDC 可用后，可在包设置的 Publishing access 里选「Require 2FA and disallow tokens」收口。

工作流会检查 tag 与包版本一致，并通过 lint、类型检查、测试和文档构建后再发布。已发布版本不可重复发布，手动触发前也需升级版本。

发布后可被任意 Vue 3 + Vite 项目（含内网 VitePress 站点）安装使用。
