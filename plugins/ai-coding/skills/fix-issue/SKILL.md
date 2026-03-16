---
name: fix-issue
description: Fix a GitHub issue end-to-end - create branch, implement fix, run checks, and create PR.
argument-hint: "[issue-number-or-url]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git*), Bash(pnpm *), Read, Grep, Glob, Edit, Write
---

Fix GitHub issue $ARGUMENTS end-to-end.

## Instructions

1. Fetch the issue details using `gh issue view $ARGUMENTS --json title,body,labels,comments`
2. Analyze the issue and understand what needs to be fixed
3. Create a new branch: `git checkout -b fix/issue-<number>` (extract number from $ARGUMENTS)
4. Implement the fix with proper code changes
5. Write or update tests to cover the fix
6. Run lint/typecheck if available (`pnpm lint`, `pnpm typecheck`)
7. Commit with a conventional commit message referencing the issue: `fix: <description> (closes #<number>)`
8. Push the branch: `git push -u origin HEAD`
9. Create a PR: `gh pr create --title "fix: <description>" --body "Closes #<number>" --fill`
10. Report the PR URL and summary of changes
