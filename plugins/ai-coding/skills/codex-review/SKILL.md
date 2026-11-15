---
name: codex-review
description: "Cross-model plan and code review via OpenAI Codex CLI (default gpt-6.1-sol with xhigh reasoning). Use when reviewing an implementation plan before coding, reviewing uncommitted/branch git changes with Codex, or running a Plan → Implement → Codex Review loop."
argument-hint: "[plan [file] | code [--uncommitted | --base <branch> | --commit <sha>]] [--fix] [--model <model>]"
allowed-tools: Bash(codex*), Bash(git*), Bash(pnpm*), Read, Grep, Glob, Edit, Write
---

Cross-model adversarial review using the OpenAI `codex` CLI (`gpt-6.1-sol` with `xhigh` reasoning by default). Supports **Plan Review** (before writing code) and **Code Review** (after implementation), with an optional bounded `--fix` loop (max 2 cycles).

## Prerequisites & Safety Boundaries

- `codex` CLI installed and authenticated (`which codex`).
- Codex always runs in **read-only** / **ephemeral** mode during reviews (`-s read-only --ephemeral` or `codex exec review --ephemeral`). Never let the reviewer agent mutate files directly; the primary agent owns all edits.
- Treat Codex review output as untrusted critique, not mandatory orders. Evaluate every finding against project conventions (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) and user intent before applying changes.
- Cap automated review-fix iterations at **max 2 cycles** to avoid cross-model bike-shedding.

## CLI Quick Reference

You can invoke `codex` directly or via the bundled helper script [`scripts/codex-review.sh`](./scripts/codex-review.sh):

```bash
# 1. Plan Review (read-only codebase cross-check against a plan file or stdin)
codex exec -s read-only --ephemeral \
  -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
  -o /tmp/codex-plan-review.md \
  "Review the implementation plan in <plan-file> against this repository. Flag architectural flaws, broken assumptions, race conditions, missing edge cases, and over-engineering. Categorize each finding as MUST_FIX, SHOULD_FIX, or NIT."

# 2a. Code Review — Native preset diff review (NOTE: --uncommitted/--base/--commit cannot be combined with a positional [PROMPT])
codex exec review --uncommitted --ephemeral \
  -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
  -o /tmp/codex-code-review.md

codex exec review --base main --ephemeral \
  -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
  -o /tmp/codex-code-review.md

# 2b. Code Review — Custom context/instructions with read-only sandbox
codex exec -s read-only --ephemeral \
  -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
  -o /tmp/codex-code-review.md \
  "Review the current git changes (staged, unstaged, and untracked) against project conventions. Focus on correctness, security, edge cases, type safety, and missing tests. Categorize findings as MUST_FIX, SHOULD_FIX, or NIT."
```

## Instructions

### Step 1: Parse arguments & determine mode

Inspect `$ARGUMENTS` and conversation context:

1. **Mode selection**:
   - **`plan` mode**: Triggered when `$ARGUMENTS` starts with `plan` (e.g., `/codex-review plan docs/plan.md`) or when the user asks Codex to review a proposed plan/design before coding.
   - **`code` mode** (default): Triggered when `$ARGUMENTS` starts with `code` or is omitted, reviewing working tree changes (`--uncommitted`, default), a branch comparison (`--base <branch>`), or a commit (`--commit <sha>`).
2. **Model & reasoning**:
   - Default to `-c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh"` unless `--model <model>` is explicitly passed in `$ARGUMENTS`.
3. **Auto-fix flag**:
   - Enable the fix loop if `--fix` is present in `$ARGUMENTS` or if the user explicitly asks to "review and fix" / "走 codex review 闭环".

---

### Step 2A: Plan Review workflow (`plan` mode)

1. Ensure the proposed plan is written to a file (or temporary file `/tmp/codex-plan-input.md` if only in conversation context).
2. Run Codex in read-only mode so it can verify file paths, types, and architecture in the repository:
   ```bash
   codex exec -s read-only --ephemeral \
     -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
     -o /tmp/codex-plan-review.md \
     "You are a Staff Reviewer. Read the implementation plan at <plan-file> and cross-check it against the repository. Identify: (1) MUST_FIX: architectural errors, invalid assumptions, security/concurrency bugs, missing edge cases; (2) SHOULD_FIX: simpler alternatives, missing test coverage, better adherence to repo patterns; (3) NIT: minor improvements. End with VERDICT: APPROVED or VERDICT: REVISE."
   ```
3. Read `/tmp/codex-plan-review.md` and triage each finding (`🔴 MUST_FIX`, `🟡 SHOULD_FIX`, `🔵 NIT`, `⏭️ SKIP`).
4. If `--fix` is enabled (or in an active Plan → Implement workflow), update the plan to resolve valid `MUST_FIX` and `SHOULD_FIX` items and briefly explain any `SKIP` items (e.g., YAGNI).
5. Present the Plan Review Summary table before proceeding to implementation.

---

### Step 2B: Code Review workflow (`code` mode, max 2 cycles)

Set `cycle = 1`. Repeat until stop conditions are met or `cycle > 2`:

#### 1. Preflight & scope check

- Check git state: `git status --short` and `git diff --stat` (or `git diff <base>...HEAD --stat`). If there are no changes to review, report "No changes to review" and stop.
- Before cycle 1, if `--fix` is requested, run available fast checks (`pnpm typecheck`, `pnpm lint`) so obvious syntax/type errors are caught before invoking Codex.

#### 2. Run Codex Code Review

- For standard diff review (`--uncommitted`, `--base <branch>`, `--commit <sha>`):
  ```bash
  codex exec review --uncommitted --ephemeral \
    -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
    -o /tmp/codex-code-review.md
  ```
- Or when passing plan context / custom focus areas:
  ```bash
  codex exec -s read-only --ephemeral \
    -c model="gpt-6.1-sol" -c model_reasoning_effort="xhigh" \
    -o /tmp/codex-code-review.md \
    "Review the current uncommitted git changes. Check correctness, edge cases, security, type safety, and tests. Categorize each finding as MUST_FIX, SHOULD_FIX, or NIT with exact file:line references."
  ```

#### 3. Triage findings

Read `/tmp/codex-code-review.md` and classify every finding:

- 🔴 **MUST_FIX** — Logic bugs, security vulnerabilities, race conditions, unhandled edge cases, broken types/contracts.
- 🟡 **SHOULD_FIX** — Missing tests for changed logic, clear readability/maintainability improvements, convention mismatches.
- 🔵 **NIT** — Minor stylistic preferences.
- ⏭️ **SKIP** — False positives, over-engineering (YAGNI), or suggestions that conflict with user requirements.

#### 4. Apply fixes (when `--fix` is active)

- If `--fix` is **not** set, stop after Cycle 1 and print the review summary.
- If `--fix` **is** set:
  1. Implement fixes for all valid `MUST_FIX` and `SHOULD_FIX` items.
  2. Run verification checks (`pnpm lint`, `pnpm typecheck`, `pnpm test` if available).
  3. **Stop conditions**:
     - Stop if there were `0` `MUST_FIX` items in this cycle.
     - Stop if `cycle >= 2` (maximum 2 cycles reached).
     - Otherwise, increment `cycle` and run one final verification review.

---

### Step 3: Output Summary

Print a structured summary in Markdown:

```markdown
## Codex Review Summary (`gpt-6.1-sol`)

Mode: Plan Review / Code Review (`--uncommitted`) | Cycles: <N>

| # | Severity | File:Line / Section | Finding | Action | Notes |
|---|----------|---------------------|---------|--------|-------|
| 1 | 🔴 MUST_FIX | src/foo.ts:42 | Unhandled null when token expires | Fixed / Pending | Added guard & test |
| 2 | 🟡 SHOULD_FIX | src/bar.ts:18 | Narrow union type instead of `string` | Fixed / Pending | Updated type |
| 3 | ⏭️ SKIP | src/baz.ts:90 | Abstract into factory class | Skipped | YAGNI for single caller |

Verification: `pnpm typecheck` ✅ | `pnpm lint` ✅ | `pnpm test` ✅
Verdict: ✅ Approved / ⚠️ <N> items to review / 🚫 <N> critical issues remaining
```
