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
npx skills add YunYouJun/ai --skill=fix-issue
```

## Plugins

### ai-coding

AI 辅助编程工作流 — PR 自动化、Issue 修复、代码审查、Copilot Review 循环。

| Skill                    | 说明                                                            |
| ------------------------ | --------------------------------------------------------------- |
| `review-staged`          | 审查 staged changes，分类标注严重程度                           |
| `fix-issue`              | 端到端修复 GitHub Issue — 创建分支、实现修复、跑检查、创建 PR   |
| `pr-cycle`               | 完整 PR 生命周期自动化：修复 → 创建 PR → 等待 Review → 处理反馈 |
| `address-copilot-review` | 获取 Copilot Review 评论，分类、修复并回复                      |
| `copilot-review-loop`    | 迭代式 Copilot Review 循环，最多 2 轮直到通过                   |
| `review-feedback`        | 处理 PR Review 反馈                                             |

### yunyoujun

YunYouJun 的编码偏好和工具约定（TypeScript、Vue、ESLint、pnpm 等）。

## 仓库结构

```
├── plugins/              # Plugin 扩展包
│   └── ai-coding/        # AI 辅助编程工作流插件
├── skills/               # 独立 Skills
│   └── yunyoujun/        # 编码偏好与工具约定
├── docs/                 # 文档站（VitePress）
├── packages/             # 工具包
└── test/                 # 测试
```

## 文档

- [快速开始](https://ai.yunyoujun.cn/guide/getting-started) — 安装与使用
- [Skills](https://ai.yunyoujun.cn/guide/skills) — Skill 编写、安装与完整列表
- [Plugins](https://ai.yunyoujun.cn/guide/plugins) — Plugin 结构与推荐插件
- [Marketplace](https://ai.yunyoujun.cn/guide/marketplace) — 发现和安装社区插件
- [Claude Code 最佳实践](https://ai.yunyoujun.cn/claude-code/best-practices) — 工作流技巧
- [PR 自动化实践](https://ai.yunyoujun.cn/claude-code/pr-automation) — Issue → PR → Review 自动化

## License

[MIT](./LICENSE) © [YunYouJun](https://github.com/YunYouJun)
