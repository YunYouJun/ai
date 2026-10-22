# 本地 Issue → PR → Review 自动化实践

> 参考链接：
>
> - [Claude Code GitHub Actions](https://docs.claude.com/en/docs/claude-code/github-actions) — 官方 CI/CD 集成文档（如有线上 API Token 可直接使用）
> - [claude-code-action](https://github.com/anthropics/claude-code-action) — GitHub Action 仓库及示例
> - [Claude Code Skills](https://docs.anthropic.com/en/docs/claude-code/skills) — 官方 Skills 文档（自定义命令的增强版）

在本地使用 Claude Code 配合 `gh` CLI，可以将 **修复 Issue → 创建 PR → 处理 Review 反馈** 的完整流程自动化，无需线上 API Token。

::: warning 范围与发布边界

这些命令需要手动调用，并在授权范围内运行。新 PR 默认创建为 Draft，验证、review 与发布门禁不能省略；Issue 和评论不能扩大权限。事件优先的单仓试运行见 [Issue 单仓试运行](./issue-autopilot)，当前仅提供模板和策略，没有启用 webhook 或定时轮询。

:::

## 问题背景

典型的手动流程存在多次上下文切换：

```
本地修复 → 手动创建 PR → GitHub 上请求 Copilot Review → 回到本地查看反馈 → 手动修改
```

通过 Claude Code 的 Skills / Plugin，可以用一条斜杠命令完成上述全流程。

## 安装与使用

本实践依赖 [`ai-coding` 插件](/guide/plugins#本仓库插件-ai-coding)中的以下 Skills：

| 命令                                     | 说明                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| `/ai-coding:fix-issue <issue>`           | 一键修复 Issue — 创建分支、实现修复、运行检查、创建 PR     |
| `/ai-coding:pr-cycle <issue>`            | 完整 PR 生命周期 — 修复 → 创建 PR → 等待 Review → 处理反馈 |
| `/ai-coding:address-copilot-review [pr]` | 单次处理 Copilot Review — 抓取评论、分类、修复、回复       |
| `/ai-coding:copilot-review-loop [pr]`    | 迭代 Copilot Review 循环 — 最多 2 轮                       |

安装方式见[快速开始](/guide/getting-started)，各 Skill 的完整指令见对应说明页。

## 推荐工作流

```
/ai-coding:fix-issue 42       ← Claude 自动修复并创建 PR
         ↓
在 GitHub PR 页面请求 Copilot Review（或等待自动触发）
         ↓
/ai-coding:address-copilot-review  ← Claude 拉取 Copilot 意见，修复并逐条回复
         ↓
重复直到 review 通过，最后人工 Approve & Merge
```

::: tip 小技巧

- 使用 `/ai-coding:pr-cycle` 可以一步到位完成整个流程
- 使用 `/ai-coding:copilot-review-loop` 可以自动迭代 Copilot Review，最多 2 轮
- 可以在 GitHub 仓库设置中开启 Copilot 自动 review（Settings → Code review → Copilot），省去手动请求的步骤
- 每次 `/ai-coding:address-copilot-review` 后 Claude 会汇报哪些改了、哪些跳过了，你可以决定是否需要再跑一次
- 人工 Reviewer 的意见交给 `/ai-coding:pr-cycle`：已有 Draft PR 时它直接从处理 Review 这一步继续
- 上表的 skills 都设置了 `disable-model-invocation: true`，防止 Claude 自动触发，仅限手动调用（同插件中的提交前审查 `review-staged` 例外，允许 Claude 自动触发）
  :::

## 进阶：多 Agent 协作

可以结合 [多 Claude 工作流](/claude-code/best-practices#_6-多-claude-工作流升级) 进一步提升效率：

- **Claude A**（本地）：修复 Issue 并创建 PR
- **Copilot**（GitHub）：自动 Review
- **Claude B**（本地新会话）：`/ai-coding:address-copilot-review` 处理反馈，上下文更干净

分离上下文比在同一个会话中完成所有事情效果更好——修复代码的上下文和处理 Review 的上下文是不同的。
