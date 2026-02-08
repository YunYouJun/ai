# 本地 Issue → PR → Review 自动化实践

> 参考链接：
>
> - [Claude Code GitHub Actions](https://docs.claude.com/en/docs/claude-code/github-actions) — 官方 CI/CD 集成文档（如有线上 API Token 可直接使用）
> - [claude-code-action](https://github.com/anthropics/claude-code-action) — GitHub Action 仓库及示例
> - [Claude Code Skills](https://docs.anthropic.com/en/docs/claude-code/skills) — 官方 Skills 文档（自定义命令的增强版）

在本地使用 Claude Code 配合 `gh` CLI，可以将 **修复 Issue → 创建 PR → 处理 Review 反馈** 的完整流程自动化，无需线上 API Token。

## 问题背景

典型的手动流程存在多次上下文切换：

```
本地修复 → 手动创建 PR → GitHub 上请求 Copilot Review → 回到本地查看反馈 → 手动修改
```

通过 Claude Code 的 Skills / Plugin，可以用一条斜杠命令完成上述全流程。

## 安装方式

### 方式一：Skills CLI 安装

通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 安装单个或全部 skills：

```bash
# 安装全部 skills
pnpx skills add yunyoujun/ai --skill='*'

# 安装单个 skill
pnpx skills add yunyoujun/ai --skill=fix-issue
```

安装后命令不带前缀：`/fix-issue`、`/review-feedback`、`/pr-cycle`

::: tip 全局共享
将 skills 放在 `~/.claude/skills/` 下即可在所有项目中使用。
:::

### 方式二：Plugin 加载

本仓库已打包为 Claude Code Plugin（`.claude-plugin/plugin.json`），可整体加载：

```bash
claude --plugin-dir /path/to/yyj/ai
```

作为 Plugin 加载后，所有命令带 `yyj-ai:` 命名空间前缀，避免与其他 skills 冲突。

## Skills 详情

> 以下命令名以 Skills CLI 安装为例（不带前缀）。Plugin 方式安装时，命令自动带 `yyj-ai:` 前缀（如 `/yyj-ai:fix-issue`）。

### `/fix-issue` — 一键修复 Issue 并创建 PR

<<< @/../skills/fix-issue/SKILL.md

使用方式：`/fix-issue 42`（Plugin: `/yyj-ai:fix-issue 42`）

### `/review-feedback` — 拉取 Review 意见并自动修改

<<< @/../skills/review-feedback/SKILL.md

使用方式：`/review-feedback` 或 `/review-feedback 123`

### `/pr-cycle` — 完整生命周期

<<< @/../skills/pr-cycle/SKILL.md

使用方式：`/pr-cycle 42`

## 推荐工作流

```
/fix-issue 42              ← Claude 自动修复并创建 PR
         ↓
在 GitHub PR 页面请求 Copilot Review（或等待自动触发）
         ↓
/review-feedback           ← Claude 拉取 review 意见，自动修改并推送
         ↓
重复直到 review 通过，最后人工 Approve & Merge
```

::: tip 小技巧

- 使用 `/pr-cycle` 可以一步到位完成整个流程
- 可以在 GitHub 仓库设置中开启 Copilot 自动 review（Settings → Code review → Copilot），省去手动请求的步骤
- 每次 `/review-feedback` 后 Claude 会汇报哪些改了、哪些跳过了，你可以决定是否需要再跑一次
- 所有 skills 都设置了 `disable-model-invocation: true`，防止 Claude 自动触发，仅限手动调用
  :::

## 进阶：多 Agent 协作

可以结合 [多 Claude 工作流](/guide/claude-code/best-practices#_6-多-claude-工作流升级) 进一步提升效率：

- **Claude A**（本地）：修复 Issue 并创建 PR
- **Copilot**（GitHub）：自动 Review
- **Claude B**（本地新会话）：`/review-feedback` 处理反馈，上下文更干净

分离上下文比在同一个会话中完成所有事情效果更好——修复代码的上下文和处理 Review 的上下文是不同的。
