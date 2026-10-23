# AI

AI 辅助编程的 Skills、Plugins 与实践文档。适用于 [Claude Code](https://docs.anthropic.com/en/docs/claude-code) / [CodeBuddy](https://www.codebuddy.ai/) 等 AI Coding Agent。

📖 文档站：[ai.yunyoujun.cn](https://ai.yunyoujun.cn) | [ai.yyj.moe](https://ai.yyj.moe)（海外）

## 快速开始

### 安装 Plugin（推荐）

```bash
# CodeBuddy
codebuddy plugin install ai-coding@yunyoujun

# Claude Code
claude plugin install ai-coding@yunyoujun
```

### 安装独立 Skills

```bash
# 安装全部 skills
npx skills add YunYouJun/ai --skill='*'

# 安装单个 skill
npx skills add YunYouJun/ai --skill=simplify-documents
```

## Skills

按场景浏览、搜索和复制安装命令：[Skills 目录](https://ai.yunyoujun.cn/guide/skills)。

| 场景       | Skill                                                                                   | 说明                                                       |
| ---------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Issue → PR | [`triage-issues`](https://ai.yunyoujun.cn/guide/skills/triage-issues)                   | 只读筛选已授权仓库的 Issue，输出低风险候选或跳过原因       |
| Issue → PR | [`fix-issue`](https://ai.yunyoujun.cn/guide/skills/fix-issue)                           | 复现、回归测试、最小修复并创建 Draft PR                    |
| Issue → PR | [`pr-cycle`](https://ai.yunyoujun.cn/guide/skills/pr-cycle)                             | 修复 Issue → Draft PR → 处理 Review                        |
| 代码审查   | [`review-staged`](https://ai.yunyoujun.cn/guide/skills/review-staged)                   | 提交前审查暂存区变更，按严重程度分级                       |
| 代码审查   | [`address-copilot-review`](https://ai.yunyoujun.cn/guide/skills/address-copilot-review) | 单轮处理 Copilot Review：抓取、分类、修复、回复            |
| 代码审查   | [`copilot-review-loop`](https://ai.yunyoujun.cn/guide/skills/copilot-review-loop)       | 触发 Copilot Review → 处理 → 再触发，最多 2 轮             |
| 文档写作   | [`simplify-documents`](https://ai.yunyoujun.cn/guide/skills/simplify-documents)         | 按目标比例精简文档，保留事实、约束、步骤和指定段落         |
| 发布交付   | [`ios-testflight`](https://ai.yunyoujun.cn/guide/skills/ios-testflight)                 | 用 ASC CLI 打包、校验并发布原生 iOS TestFlight 内部测试    |
| 会话管理   | [`wrap-up`](https://ai.yunyoujun.cn/guide/skills/wrap-up)                               | 校验、沉淀结论、只提交本任务改动，再归档会话               |
| 编码约定   | [`yunyoujun`](https://ai.yunyoujun.cn/guide/skills/yunyoujun)                           | YunYouJun 的编码偏好和工具约定（TypeScript、Vue、pnpm 等） |

Issue → PR 与代码审查两类打包在 `ai-coding` 插件中，插件加载后命令带 `ai-coding:` 前缀（如 `/ai-coding:fix-issue 42`）；其余为独立 Skill。

## 仓库结构

```
├── plugins/                  # Plugin 扩展包
│   └── ai-coding/            # Issue → PR 与代码审查 Skills
├── skills/                   # 独立 Skills
│   ├── ios-testflight/       # TestFlight 内部测试发布
│   ├── simplify-documents/   # 高保真文档精简
│   ├── wrap-up/              # 任务收尾：提交并归档会话
│   └── yunyoujun/            # 编码偏好与工具约定
├── docs/                     # 文档站（VitePress）
│   ├── guide/                # 快速开始、Plugins、Marketplace、MCP
│   ├── guide/skills/         # 每个 Skill 的使用说明
│   ├── claude-code/          # Claude Code 使用技巧
│   ├── practices/            # 自动化、App 开发实践与验证记录
│   ├── tools/                # 框架、API、开发工具与学习资源
│   └── .vitepress/data/      # Skills 目录的展示信息（skill-catalog.ts）
├── packages/                 # 工具包
│   ├── browser-use/          # 浏览器自动化
│   └── ai-docs/              # 提示词卡片与 Skill 目录等文档组件
└── test/                     # 测试
```

## 文档

- [快速开始](https://ai.yunyoujun.cn/guide/getting-started) — 安装与使用
- [Skills 目录](https://ai.yunyoujun.cn/guide/skills) — 按场景浏览全部 Skills
- [编写 Skill](https://ai.yunyoujun.cn/guide/skills/authoring) — Skill 结构与编写要点
- [Plugins](https://ai.yunyoujun.cn/guide/plugins) — Plugin 结构与推荐插件
- [Marketplace](https://ai.yunyoujun.cn/guide/marketplace) — 发现和安装社区插件
- [Claude Code 最佳实践](https://ai.yunyoujun.cn/claude-code/best-practices) — 工作流技巧
- [PR 自动化实践](https://ai.yunyoujun.cn/practices/pr-automation) — Issue → PR → Review 自动化
- [App 开发实践](./docs/practices/app-development/index.md) — 账号隔离、升级恢复、测试证据与外部参考
- [Copilot 双语 Release Notes](https://ai.yunyoujun.cn/practices/copilot-release-notes) — 用 `GITHUB_TOKEN` 自动生成双语版本说明

## License

[MIT](./LICENSE) © [YunYouJun](https://github.com/YunYouJun)
