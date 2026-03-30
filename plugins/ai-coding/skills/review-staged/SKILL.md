---
name: review-staged
description: "Review staged git changes before committing — catch bugs, security issues, and style problems early."
argument-hint: "[--fix]"
---

Review all staged (`git diff --cached`) changes before committing. Shift-left code review.

## Instructions

1. Get staged changes: `git diff --cached --stat` and `git diff --cached`. If empty, report "No staged changes" and stop.
2. Scan for project conventions (linter configs, `tsconfig.json`, `CLAUDE.md`, `AGENTS.md`) to understand project standards.
3. For each changed file, read the **full file** for context, then review the **staged hunks** specifically:
   - **Correctness**: logic errors, null access, race conditions, missing error handling
   - **Security**: hardcoded secrets, injection, unsafe eval, exposed credentials
   - **Types & style**: missing types, `any` abuse, naming, dead code, unused imports
   - **Tests**: changed logic without corresponding test updates
4. Categorize each finding:
   - 🔴 **MUST_FIX** — bugs, security, data loss risks
   - 🟡 **SHOULD_FIX** — style, types, readability, missing tests
   - 🔵 **NIT** — minor suggestions, optional improvements
   - ✅ **GOOD** — well-written code worth highlighting
5. Focus on staged changes only — don't flag pre-existing issues unless the change makes them worse.
6. If `$ARGUMENTS` contains `--fix`: implement fixes for MUST_FIX and SHOULD_FIX items, re-stage fixed files (`git add <files>`), run `pnpm lint --fix` / `pnpm typecheck` if available. Without `--fix`, report only.
7. Print summary:

```
## Staged Changes Review

Files: <N> | Changes: +<add> / -<del>

| # | Severity | File:Line | Issue | Suggestion |
|---|----------|-----------|-------|------------|

Verdict: ✅ Ready to commit / ⚠️ <N> issues to review / 🚫 <N> critical issues — fix first
```
