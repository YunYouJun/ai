# 编写 Skill

> Skills 是 Claude Code 的自定义命令增强版，允许你通过 Markdown 文件定义可复用的自动化工作流。每个 Skill 定义了一组 AI 应该遵循的步骤，让复杂的开发流程变成一条斜杠命令。

## 什么是 Skills？

Skills 是用 Markdown 编写的**可执行指令集**，是插件系统的最小功能单元。

Skills 分为两类：

- **Commands（命令）**：位于 `commands/` 目录，作为 Markdown 文件，由用户通过 `/command` 显式调用
- **Agent Skills（代理技能）**：位于 `skills/` 目录，包含 `SKILL.md` 文件，可由 Claude 根据任务上下文自动调用

::: tip 与 Plugins 和 Marketplace 的关系
Skills 是最小功能单元，可独立使用，也可打包进 [Plugins](../plugins) 并通过 [Marketplace](../marketplace) 分发。三者的定位、命名空间与版本管理对比见[指南简介](../)。
:::

## Skill 文件结构

每个 Skill 是一个独立目录，包含 `SKILL.md` 文件：

```
skills/
├── simplify-documents/
│   ├── SKILL.md
│   ├── scripts/
│   └── references/
└── yunyoujun/
    └── SKILL.md
```

`SKILL.md` 使用 YAML frontmatter 定义元数据，正文部分为 AI 的执行指令：

```markdown
---
name: fix-issue
description: Fix a GitHub issue end-to-end.
disable-model-invocation: true
---

Fix a GitHub issue end-to-end.

## Instructions

1. Fetch the issue details using `gh issue view $ARGUMENTS`
2. Analyze the issue...
3. Create a new branch...
```

### Frontmatter 字段

| 字段                       | 类型      | 说明                                                      |
| -------------------------- | --------- | --------------------------------------------------------- |
| `name`                     | `string`  | Skill 名称，即斜杠命令名（如 `fix-issue` → `/fix-issue`） |
| `description`              | `string`  | 功能描述，帮助 AI 理解何时使用该 Skill                    |
| `argument-hint`            | `string`  | 参数提示（如 `"[issue-number-or-url]"`）                  |
| `disable-model-invocation` | `boolean` | 设为 `true` 则 AI 不会自动触发，仅限手动调用              |
| `allowed-tools`            | `string`  | 限制 Skill 可使用的工具列表                               |
| `metadata`                 | `object`  | 可选的额外信息（作者、版本等）                            |

### `$ARGUMENTS` 参数传递

使用 `$ARGUMENTS` 占位符捕获用户在斜杠命令后输入的参数，实现动态交互。参数会被原样传入 Skill 正文。

```markdown
Fix GitHub issue $ARGUMENTS end-to-end.
```

用户调用 `/fix-issue 42` 时，`$ARGUMENTS` 被替换为 `42`。

## 编写 Skill 最佳实践

### 基础 Skill 模板

创建 `skills/<skill-name>/SKILL.md`：

```markdown
---
name: my-skill
description: "What this skill does in one sentence."
argument-hint: "[required-argument]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git *), Read, Grep, Glob, Edit, Write
---

Brief summary of the skill.

## Instructions

1. Step one — describe what the AI should do
2. Step two — use `$ARGUMENTS` to accept user input
3. Step three — include specific CLI commands
4. Final step — report results to the user

$ARGUMENTS should be <describe expected input>.
```

### 编写要点

- **指令要具体**：写出实际的 CLI 命令和判定标准，减少 AI 的自由发挥：

  ```markdown
  <!-- ❌ 模糊 -->
  Review the code changes.

  <!-- ✅ 具体 -->
  1. Run `git diff --cached --stat` to get changed files
  2. For each file, read the full file for context
  3. Review staged hunks for: bugs, security issues, types, dead code
  4. Categorize as MUST_FIX / SHOULD_FIX / NIT / GOOD
  5. Print summary table with file:line, severity, and suggestion
  ```

- **用编号步骤组织**，最后一步要求 AI 汇报结果
- **默认手动触发**：设置 `disable-model-invocation: true`，避免 AI 在不恰当的时机自动调用；只有希望按需自动触发的通用 Skill（如代码审查）才放开
- **限制工具范围**：用 `allowed-tools` 收窄可用工具，降低安全风险和意外操作
- **只封装多步编排**：`git commit` 这类原子操作直接用自然语言即可，见 [Commit / Push 工作流](/claude-code/best-practices#commit-push-工作流最佳实践)
- **全局共享**：放在 `~/.claude/skills/` 下即可在所有项目中使用

## 在本仓库新增 Skill

1. 在 `skills/<name>/`（独立 Skill）或 `plugins/ai-coding/skills/<name>/`（插件 Skill）下创建 `SKILL.md`；
2. 在 `docs/.vitepress/data/skill-catalog.ts` 的 `SKILL_SHOWCASE` 中登记标题、图标、分类和中文简介，[Skills 目录](../skills)与侧边栏会自动收录；
3. 新建 `docs/guide/skills/<name>.md` 使用说明，并在 README 的 Skills 表格中补一行。

`pnpm test` 会检查以上三处是否齐全。

## 参考链接

- [Skills 目录](../skills) — 本仓库全部 Skills
- [Plugins 开发](../plugins) — Plugin 创建、结构与迁移
- [Marketplace 市场](../marketplace) — 发现、安装、创建与分发市场
- [创建插件 — Claude Code 官方文档](https://code.claude.com/docs/zh-CN/plugins)
- [发现和安装插件 — Claude Code 官方文档](https://code.claude.com/docs/zh-CN/discover-plugins)
- [Claude Code Skills 官方文档](https://docs.anthropic.com/en/docs/claude-code/skills)
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — Skills CLI 安装工具
- [PR 自动化实践](/practices/pr-automation) — Skills 在 PR 工作流中的实际应用
- [Claude Code 最佳实践](/claude-code/best-practices) — 斜杠命令与工具配合技巧
- [MCP（Model Context Protocol）](/guide/mcp) — MCP Server 集成说明
