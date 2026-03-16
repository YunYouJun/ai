---
name: address-copilot-review
description: "Fetch Copilot review comments on a PR, triage, fix valid issues, and reply to each comment. Single-pass."
argument-hint: "[pr-number-or-url]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git*), Bash(pnpm *), Read, Grep, Glob, Edit, Write
---

Fetch and address GitHub Copilot review comments on a PR in a single pass: triage, fix, reply.

## Instructions

### Step 1: Identify the PR

1. If `$ARGUMENTS` is provided, use it as the PR number or URL.
2. Otherwise, detect from the current branch: `gh pr view --json number,url -q '.number'`
3. Get repo info: `gh repo view --json owner,name -q '"\(.owner.login)/\(.name)"'`
4. Print the PR number and URL for confirmation.

### Step 2: Fetch Copilot review comments

Fetch **all** review comments and filter for Copilot:

```bash
# Inline review comments (line-level)
gh api "repos/{owner}/{repo}/pulls/<number>/comments" \
  --jq '.[] | select(.user.login == "copilot-pull-request-reviewer[bot]" or .user.login == "copilot[bot]" or (.user.type == "Bot" and (.user.login | test("copilot"; "i")))) | {id, path, line: .original_line, body, diff_hunk, in_reply_to_id, created_at}'

# PR-level review comments
gh api "repos/{owner}/{repo}/pulls/<number>/reviews" \
  --jq '.[] | select(.user.login == "copilot-pull-request-reviewer[bot]" or .user.login == "copilot[bot]" or (.user.type == "Bot" and (.user.login | test("copilot"; "i")))) | {id, state, body, submitted_at}'

# Issue-style comments
gh api "repos/{owner}/{repo}/issues/<number>/comments" \
  --jq '.[] | select(.user.login == "copilot-pull-request-reviewer[bot]" or .user.login == "copilot[bot]" or (.user.type == "Bot" and (.user.login | test("copilot"; "i")))) | {id, body, created_at}'
```

If no Copilot comments found, report "No Copilot review comments found on this PR." and stop.

### Step 3: Triage each comment

For each Copilot comment, read the referenced file and code context, then categorize:

| Category       | Criteria                                        | Action        |
| -------------- | ----------------------------------------------- | ------------- |
| **MUST_FIX**   | Bugs, security issues, correctness problems     | Fix and reply |
| **SHOULD_FIX** | Style, best practices, readability improvements | Fix and reply |
| **SKIP**       | False positives, not applicable, or nitpicks    | Reply only    |

**Triage guidelines:**

- Unused imports → usually valid, remove them
- Security warnings → take seriously, verify if real
- Performance suggestions → evaluate actual impact
- Refactoring suggestions → apply KISS/YAGNI; skip if over-engineering
- Type safety → usually valid for TypeScript projects

### Step 4: Fix valid issues

For each `MUST_FIX` (first) and `SHOULD_FIX` (second) comment:

1. Read the file and understand the surrounding code
2. Implement the fix following existing code patterns
3. Keep changes minimal and focused — one fix per comment

**Do NOT:**

- Bundle all fixes into one giant change
- Refactor unrelated code
- Change code formatting beyond what the comment requests

### Step 5: Verify changes

After all fixes:

1. `pnpm lint --fix` (if available)
2. `pnpm typecheck` (if available)
3. `pnpm test` (if available)

If any check fails, fix the issue before proceeding.

### Step 6: Commit and push

1. Stage changes: `git add -A`
2. Commit with descriptive message: `fix: address copilot review feedback`
   - If multiple distinct fixes, prefer separate commits per fix
3. Push: `git push`

### Step 7: Reply to each comment on the PR

Reply to **every** Copilot comment, not just the ones you fixed:

**For inline review comments** (line-level), reply directly on the review thread:

```bash
gh api "repos/{owner}/{repo}/pulls/<number>/comments/<comment_id>/replies" \
  -X POST -f body="<reply>"
```

**For PR-level or issue comments**, post a summary comment:

```bash
gh pr comment <number> --body "<summary>"
```

**Reply format:**

- Fixed: `"Fixed ✅ — <brief description of what was changed>"`
- Skipped: `"Skipped — <brief reason why this is not applicable>"`
- Partially addressed: `"Partially addressed — <what was done and what was deferred>"`

### Step 8: Summary report

Print a final summary table:

```
## Copilot Review — Summary

PR: #<number> (<url>)

| # | File:Line | Issue | Category | Action | Reply |
|---|-----------|-------|----------|--------|-------|
| 1 | src/foo.ts:42 | Unused import | SHOULD_FIX | Fixed | ✅ |
| 2 | src/bar.ts:10 | Null check | MUST_FIX | Fixed | ✅ |
| 3 | src/baz.ts:99 | Refactor suggestion | SKIP | Skipped | YAGNI |

Commits: <list of commit hashes and messages>
```
