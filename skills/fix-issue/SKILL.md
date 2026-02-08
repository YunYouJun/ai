---
name: fix-issue
description: Fix a GitHub issue end-to-end - create branch, implement fix, run checks, and create PR.
disable-model-invocation: true
---

Fix a GitHub issue end-to-end.

## Instructions

1. Fetch the issue details using `gh issue view $ARGUMENTS --json title,body,labels,comments`
2. Analyze the issue and understand what needs to be fixed
3. Create a new branch: `git checkout -b fix/issue-<number>` (extract number from $ARGUMENTS)
4. Implement the fix with proper code changes
5. Run lint/typecheck if available (`pnpm lint`, `pnpm typecheck`)
6. Commit with a conventional commit message referencing the issue: `fix: <description> (closes #<number>)`
7. Push the branch: `git push -u origin HEAD`
8. Create a PR: `gh pr create --title "fix: <description>" --body "Closes #<number>" --fill`
9. Report the PR URL and summary of changes

$ARGUMENTS should be the issue number or URL, e.g. `42` or `https://github.com/owner/repo/issues/42`
