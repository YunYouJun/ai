# 快速开始

本仓库提供了一系列 AI 辅助编程的 **Skills** 和 **Plugins**，适用于 Claude Code / CodeBuddy 等 AI Coding Agent。

## 前置要求

- **Node.js** >= 18（用于 `npx` 运行 Skills CLI）
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 或 [CodeBuddy](https://www.codebuddy.ai/) 等支持 Skills/Plugins 的 AI Coding Agent

## 安装 Skills

通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 一键安装：

```bash
# 安装全部 skills
npx skills add YunYouJun/ai --skill='*'

# 安装单个 skill（如 fix-issue）
npx skills add YunYouJun/ai --skill=fix-issue
```

安装后即可在 AI Agent 中使用斜杠命令调用：

```bash
/fix-issue 42
/review-feedback
/pr-cycle 42
```

::: tip 全局共享
将 skills 放在 `~/.claude/skills/` 下即可在所有项目中使用。
:::

全部 Skills 及各自用法见 [Skills 目录](./skills)。

## 安装 Plugins

### CodeBuddy

通过 CodeBuddy CLI 安装插件（需 CodeBuddy ≥ 2.4）：

```bash
codebuddy plugin install ai-coding@yunyoujun
```

### Claude Code

```bash
claude plugin install ai-coding@yunyoujun
```

安装后命令带 `ai-coding:` 命名空间前缀：

```bash
/ai-coding:fix-issue 42
/ai-coding:pr-cycle 42
/ai-coding:address-copilot-review
```

更多插件信息和使用方式详见 [Plugins](./plugins)。

## 下一步

- 🧩 [Skills 目录](./skills) — 按场景浏览全部 Skills
- 📖 [编写 Skill](./skills/authoring) — Skill 结构、Frontmatter 与编写要点
- 🔌 [Plugins 文档](./plugins) — Plugin 结构与推荐插件
- 🏪 [Marketplace 市场](./marketplace) — 发现和安装社区插件
- ✨ [最佳实践](./best-practices) — AI 辅助编码工作流技巧
