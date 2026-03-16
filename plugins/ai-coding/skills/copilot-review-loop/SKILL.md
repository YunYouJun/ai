---
name: copilot-review-loop
description: "Iterative Copilot review loop: trigger review → delegate to address-copilot-review → re-trigger. Max 2 cycles until clean."
argument-hint: "[pr-number-or-url]"
disable-model-invocation: true
allowed-tools: Bash(gh *), Bash(git*), Bash(pnpm *), Read, Grep, Glob, Edit, Write
---

Iterative Copilot review loop. Triggers Copilot review, delegates comment handling to `/address-copilot-review`, then re-triggers until clean. Max 2 cycles.

## Prerequisites

- `gh` CLI installed and authenticated
- Optional: `gh-copilot-review` extension (`gh extension install ChrisCarini/gh-copilot-review`)

## Instructions

### Step 1: Preflight checks

1. Verify `gh` CLI: `gh auth status`
2. Check `gh-copilot-review` extension: `gh extension list | grep copilot-review`
   - If not installed, will use fallback `gh pr review --request copilot`.
3. If `$ARGUMENTS` is provided, use it as the PR number or URL.
4. Otherwise, detect from current branch: `gh pr view --json number,url -q '.number'`
5. Get repo info: `gh repo view --json owner,name -q '"\(.owner.login)/\(.name)"'`
6. Print the PR number and URL for confirmation.
7. Scan for project conventions (`CLAUDE.md`, `AGENTS.md`, `Makefile`, `.github/workflows/`) to understand available safety checks.

### Step 2: Safety checks (before any changes)

Run all available checks to ensure the branch is green:

1. `pnpm lint` (if available)
2. `pnpm typecheck` (if available)
3. `pnpm test` (if available)

**If any check fails, stop immediately and report.** Do not start the loop on a broken branch.

### Step 3: Review loop (max 2 cycles)

Set `cycle = 1`. Repeat until stop conditions are met or `cycle > 2`:

---

#### 3a. Record baseline

Count current unresolved Copilot comments for later comparison:

```bash
gh api "repos/{owner}/{repo}/pulls/<number>/comments" \
  --jq '[.[] | select(.user.login == "copilot-pull-request-reviewer[bot]" or .user.login == "copilot[bot]" or (.user.type == "Bot" and (.user.login | test("copilot"; "i"))))] | length'
```

#### 3b. Trigger Copilot review

```bash
# Prefer extension if available:
gh copilot-review <number>

# Fallback:
gh pr review <number> --request copilot
```

#### 3c. Wait for Copilot to finish

Poll every 30 seconds. Compare comment count against baseline.

- New comments appear → proceed to 3d.
- No new comments after **5 minutes** → timeout, skip to Step 4.

#### 3d. Delegate to `/address-copilot-review`

Run the `/address-copilot-review <number>` skill to:

1. Fetch all Copilot comments
2. Triage (MUST_FIX / SHOULD_FIX / SKIP)
3. Fix valid issues
4. Verify (lint/typecheck/test)
5. Commit and push
6. Reply to each comment

Collect the results (how many MUST_FIX / SHOULD_FIX / SKIP).

#### 3e. Check stop conditions

- **Stop** if no `MUST_FIX` comments were found in this cycle.
- **Stop** if all comments were `SKIP`.
- **Stop** if `cycle >= 2` (max cycles reached).
- Otherwise, increment `cycle` and go back to **3a**.

---

### Step 4: Final summary

Post a summary comment on the PR and print to console:

```
## Copilot Review Loop — Summary

PR: #<number> (<url>)
Cycles completed: <N>

| # | File:Line | Issue | Category | Action | Reply | Cycle |
|---|-----------|-------|----------|--------|-------|-------|
| 1 | src/foo.ts:42 | Unused import | SHOULD_FIX | Fixed | ✅ | 1 |
| 2 | src/bar.ts:10 | Null check | MUST_FIX | Fixed | ✅ | 1 |
| 3 | src/baz.ts:99 | Refactor suggestion | SKIP | Skipped | YAGNI | 1 |
| 4 | src/qux.ts:5 | Missing error handling | MUST_FIX | Fixed | ✅ | 2 |

Commits:
- abc1234 fix: address copilot review feedback (cycle 1)
- def5678 fix: address copilot review feedback (cycle 2)

Remaining items needing human review: <list or "None">
```

Post to PR:

```bash
gh pr comment <number> --body "<summary above>"
```
