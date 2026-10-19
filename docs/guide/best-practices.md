# 最佳实践

本文总结了使用 AI Coding Agent（Claude Code / CodeBuddy 等）进行日常开发的最佳实践。

## 工作流策略

### 探索 → 规划 → 编码 → 提交

适用于大多数任务的通用流程：

1. **探索**：让 AI 读取相关文件和上下文，**明确告知暂时不要写代码**
2. **规划**：使用 "think" / "think hard" 触发深度思考，将计划保存为文档或 Issue
3. **编码**：让 AI 实施解决方案
4. **提交**：让 AI 提交并创建 PR

### TDD 驱动

Anthropic 内部推崇的开发方式：

1. 让 AI 写测试（明确告知不要写实现代码）
2. 运行测试确认失败
3. 提交测试
4. 让 AI 写代码通过测试（禁止修改测试）
5. 提交代码

### PR 全流程自动化

使用 [`ai-coding` 插件](/guide/plugins#本仓库插件-ai-coding) 实现 Issue → PR → Review 的闭环：

```bash
/ai-coding:fix-issue 42           # 修复 Issue 并创建 PR
/ai-coding:review-feedback         # 拉取 Review 意见并修复
/ai-coding:copilot-review-loop     # 自动迭代 Copilot Review
```

详见 [PR 自动化实践](/claude-code/pr-automation)。

## Skill 编写技巧

### 指令要具体

具体的指令能显著提高成功率，减少 AI 的自由发挥：

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

### 限制工具范围

通过 `allowed-tools` 减少安全风险和意外操作：

```yaml
allowed-tools: Bash(gh *), Bash(git *), Read, Grep, Glob, Edit, Write
```

### 设置 `disable-model-invocation: true`

避免 AI 在不恰当的时机自动触发 Skill。除非你明确希望 AI 按需自动调用（如通用代码审查 Skill），否则建议保持手动触发。

### 使用 `$ARGUMENTS` 传参

让 Skill 灵活接受用户输入，如 Issue 编号、PR URL、自定义选项：

```markdown
Fix GitHub issue $ARGUMENTS end-to-end.
```

## 上下文管理

### 善用 `CLAUDE.md`

在仓库根目录创建 `CLAUDE.md`，记录：

- 常用命令（lint、test、build）
- 代码风格约定
- 分支命名规则
- 项目特有的注意事项

### 及时 `/clear`

长会话中上下文会累积无关信息。在切换任务时使用 `/clear` 重置，保持上下文聚焦。

### 多实例并行

分离上下文通常比单个会话处理所有事情效果更好：

- **Claude A**：功能开发
- **Claude B**：修复 Bug 并创建 PR
- **Claude C**：审查 PR 并处理反馈

可以结合 [Git Worktree](/claude-code/git-worktree) 实现真正的并行开发。

## Plugin 开发建议

### 命名空间

Plugin 中的命令自动带 `plugin-name:command` 前缀，避免与其他 Plugin 冲突。设计 Skill 名时保持简短有意义：

```bash
/ai-coding:fix-issue     # ✅ 清晰
/ai-coding:do-thing      # ❌ 含糊
```

### 版本管理

在 `plugin.json` 中使用语义版本控制，添加重大更新时升级版本号。

### 测试验证

发布前用 `claude plugin validate .` 或 `--plugin-dir` 本地验证：

```bash
claude --plugin-dir ./my-plugin
claude plugin validate .
```

## 相关资源

- [Skills 目录](/guide/skills) — 本仓库全部 Skills
- [编写 Skill](/guide/skills/authoring) — Skill 结构与编写要点
- [Plugins 文档](/guide/plugins) — Plugin 结构与推荐插件
- [Claude Code 最佳实践](/claude-code/best-practices) — 更详细的 Claude Code 使用技巧
- [PR 自动化实践](/claude-code/pr-automation) — Issue → PR → Review 实战
- [Git Worktree](/claude-code/git-worktree) — 多实例并行开发
