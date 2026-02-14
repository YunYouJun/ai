# Skills

> Skills 是 Claude Code 的自定义命令增强版，允许你通过 Markdown 文件定义可复用的自动化工作流。

## 什么是 Skills？

Skills 是一种用 Markdown 编写的可执行指令集，通过 Claude Code 的斜杠命令（`/command`）触发。每个 Skill 定义了一组 AI 应该遵循的步骤，让复杂的开发流程变成一条命令。

::: tip 与 Custom Commands 的区别
Skills 是 Custom Commands（`.claude/commands/`）的社区增强版，支持跨项目安装、版本管理和 Plugin 打包。参考 [Claude Code Skills 官方文档](https://docs.anthropic.com/en/docs/claude-code/skills)。
:::

## Skill 文件结构

每个 Skill 是一个独立目录，包含 `SKILL.md` 文件：

```
skills/
├── fix-issue/
│   └── SKILL.md
├── review-feedback/
│   └── SKILL.md
├── pr-cycle/
│   └── SKILL.md
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
| `disable-model-invocation` | `boolean` | 设为 `true` 则 AI 不会自动触发，仅限手动调用              |
| `metadata`                 | `object`  | 可选的额外信息（作者、版本等）                            |

## 本仓库 Skills 一览

### `/fix-issue` — 一键修复 Issue 并创建 PR

<<< @/../skills/fix-issue/SKILL.md

---

### `/review-feedback` — 拉取 Review 意见并自动修改

<<< @/../skills/review-feedback/SKILL.md

---

### `/pr-cycle` — 完整 PR 生命周期

<<< @/../skills/pr-cycle/SKILL.md

---

### `/yunyoujun` — 编码偏好与工具约定

<<< @/../skills/yunyoujun/SKILL.md

## 安装与使用

### 方式一：Skills CLI

通过 [vercel-labs/skills](https://github.com/vercel-labs/skills) CLI 安装：

```bash
# 安装全部 skills
pnpx skills add yunyoujun/ai --skill='*'

# 安装单个 skill
pnpx skills add yunyoujun/ai --skill=fix-issue
```

安装后直接用斜杠命令调用：

```bash
/fix-issue 42
/review-feedback
/pr-cycle 42
```

::: tip 全局共享
将 skills 放在 `~/.claude/skills/` 下即可在所有项目中使用。
:::

### 方式二：Plugin 加载

本仓库已打包为 Claude Code Plugin，整体加载后命令带 `yyj-ai:` 命名空间前缀：

```bash
claude --plugin-dir /path/to/yyj/ai
```

```bash
/yyj-ai:fix-issue 42
/yyj-ai:review-feedback
/yyj-ai:pr-cycle 42
```

## 编写自定义 Skill

创建 `skills/<skill-name>/SKILL.md`，按以下模板编写：

```markdown
---
name: my-skill
description: "What this skill does in one sentence."
disable-model-invocation: true
---

Brief summary of the skill.

## Instructions

1. Step one — describe what the AI should do
2. Step two — use `$ARGUMENTS` to accept user input
3. Step three — include specific CLI commands when需要
4. Final step — report results to the user

$ARGUMENTS should be <describe expected input>.
```

::: warning 注意事项

- `$ARGUMENTS` 是用户在斜杠命令后输入的参数，会被原样传入
- 建议设置 `disable-model-invocation: true`，避免 AI 在不恰当的时机自动触发
- 指令要具体明确，包含实际的 CLI 命令，减少 AI 的自由发挥空间
  :::

## 相关资源

- [PR 自动化实践](/guide/claude-code/pr-automation) — Skills 在 PR 工作流中的实际应用
- [Claude Code 最佳实践](/guide/claude-code/best-practices) — 斜杠命令与工具配合技巧
- [Claude Code Skills 官方文档](https://docs.anthropic.com/en/docs/claude-code/skills)
- [vercel-labs/skills](https://github.com/vercel-labs/skills) — Skills CLI 工具
