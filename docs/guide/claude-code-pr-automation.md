# 本地 Issue → PR → Review 自动化实践

> 参考链接：
>
> - [Claude Code GitHub Actions](https://docs.claude.com/en/docs/claude-code/github-actions) — 官方 CI/CD 集成文档（如有线上 API Token 可直接使用）
> - [claude-code-action](https://github.com/anthropics/claude-code-action) — GitHub Action 仓库及示例
> - [Claude Code Custom Commands](https://docs.claude.com/en/docs/claude-code/tutorials/custom-slash-commands) — 自定义斜杠命令教程

在本地使用 Claude Code 配合 `gh` CLI，可以将 **修复 Issue → 创建 PR → 处理 Review 反馈** 的完整流程自动化，无需线上 API Token。

## 问题背景

典型的手动流程存在多次上下文切换：

```
本地修复 → 手动创建 PR → GitHub 上请求 Copilot Review → 回到本地查看反馈 → 手动修改
```

通过 Claude Code 的自定义命令（`.claude/commands/`），可以用一条斜杠命令完成上述全流程。

## 自定义命令配置

在项目根目录创建 `.claude/commands/` 文件夹，添加以下 Markdown 文件：

### `/fix-issue` — 一键修复 Issue 并创建 PR

```md
Fix a GitHub issue end-to-end.

## Instructions

1. Fetch the issue details using `gh issue view $ARGUMENTS --json title,body,labels,comments`
2. Analyze the issue and understand what needs to be fixed
3. Create a new branch: `git checkout -b fix/issue-<number>` (extract number from $ARGUMENTS)
4. Implement the fix with proper code changes
5. Run lint/typecheck if available (`pnpm lint`, `pnpm typecheck`)
6. Commit with a conventional commit message referencing the issue:
   `fix: <description> (closes #<number>)`
7. Push the branch: `git push -u origin HEAD`
8. Create a PR: `gh pr create --title "fix: <description>" --body "Closes #<number>" --fill`
9. Report the PR URL and summary of changes

$ARGUMENTS should be the issue number or URL, e.g. `42`
```

使用方式：在 Claude Code 中输入 `/fix-issue 42`

### `/review-feedback` — 拉取 Review 意见并自动修改

```md
Fetch and address PR review feedback (from Copilot or human reviewers).

## Instructions

1. Get the current PR number. If $ARGUMENTS is provided, use it as the PR number.
   Otherwise, detect from the current branch: `gh pr view --json number -q .number`
2. Fetch all review comments:
   `gh pr view <number> --json reviews,comments,reviewRequests`
3. Also fetch inline review comments:
   `gh api repos/{owner}/{repo}/pulls/<number>/comments \
     --jq '.[] | {path, line: .original_line, body, diff_hunk}'`
4. Analyze each review comment and categorize:
   - **Must fix**: bugs, security issues, correctness problems
   - **Should fix**: style, readability, best practices
   - **Optional**: nitpicks, suggestions
5. For each "must fix" and "should fix" item, implement the changes
6. Run lint/typecheck after changes
7. Commit with message: `fix: address review feedback`
8. Push the changes: `git push`
9. Reply to each addressed comment on the PR:
   `gh pr comment <number> --body "Addressed review feedback: <summary>"`
10. Report what was changed and what was intentionally skipped (with reasoning)
```

使用方式：在 Claude Code 中输入 `/review-feedback` 或 `/review-feedback 123`

### `/pr-cycle` — 完整生命周期

```md
Full PR lifecycle: fix issue → create PR → wait for review → address feedback.

## Instructions

This is the full automated cycle. Run the following steps:

### Step 1: Fix the issue
1. Fetch issue details: `gh issue view $ARGUMENTS --json title,body,labels,comments`
2. Create branch, implement fix, run checks, commit, push
3. Create PR: `gh pr create --fill`

### Step 2: Check for existing reviews
1. Wait a moment, then check: `gh pr view --json reviews,comments`
2. Fetch inline comments:
   `gh api repos/{owner}/{repo}/pulls/<number>/comments`

### Step 3: Address feedback (if any)
1. If there are review comments, analyze and fix them
2. Commit and push fixes
3. Comment on PR with summary

### Step 4: Final status report
Report:
- PR URL
- Changes made for the original issue
- Review comments addressed (if any)
- Any remaining items that need human decision

$ARGUMENTS should be the issue number, e.g. `42`
```

使用方式：在 Claude Code 中输入 `/pr-cycle 42`

## 推荐工作流

```
/fix-issue 42       ← Claude 自动修复并创建 PR
         ↓
在 GitHub PR 页面请求 Copilot Review（或等待自动触发）
         ↓
/review-feedback    ← Claude 拉取 review 意见，自动修改并推送
         ↓
重复直到 review 通过，最后人工 Approve & Merge
```

::: tip 小技巧
- 使用 `/pr-cycle` 可以一步到位完成整个流程
- 可以在 GitHub 仓库设置中开启 Copilot 自动 review（Settings → Code review → Copilot），省去手动请求的步骤
- 每次 `/review-feedback` 后 Claude 会汇报哪些改了、哪些跳过了，你可以决定是否需要再跑一次
:::

## 进阶：多 Agent 协作

可以结合 [多 Claude 工作流](/guide/claude-code-best-practices#_6-多-claude-工作流升级) 进一步提升效率：

- **Claude A**（本地）：修复 Issue 并创建 PR
- **Copilot**（GitHub）：自动 Review
- **Claude B**（本地新会话）：`/review-feedback` 处理反馈，上下文更干净

分离上下文比在同一个会话中完成所有事情效果更好——修复代码的上下文和处理 Review 的上下文是不同的。
