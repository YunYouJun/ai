---
name: wrap-up
description: "Wrap up the finished task in this session: verify, persist durable knowledge, commit only this session's changes, then archive the session."
argument-hint: "[push] [keep]"
disable-model-invocation: true
---

Close out the task this session worked on so the next session can start fresh from the repository alone. Anything not written to the repository, memory, or an issue is lost once the session is archived.

`$ARGUMENTS` may contain:

- `push` — push the commits after committing
- `keep` — do everything except archive the session

Any other text is a note about what to persist or how to word the commit.

## Instructions

1. **Scope the changes.** Run `git status --short` and `git diff --stat` (plus `git diff --cached --stat` if anything is staged). Using this conversation, sort every changed path into:
   - **this task** — changes this session made for the task;
   - **unrelated** — changes that existed before the session or belong to other work.

   Stage only the paths in "this task", by name. Never `git add -A` or `git add .`. If a file mixes both, stage the relevant hunks with `git add -p` or ask. If unsure whether a change belongs to this task, ask before committing it. Leave unrelated changes untouched and list them in the report.

2. **Check for secrets.** Do not stage `.env*`, credentials, tokens, keys, or local-only config (such as `.claude/settings.local.json`). Stop and ask if one appears in "this task".

3. **Verify.** If code changed since checks last passed in this session, run the project's quick checks for the touched area (lint, typecheck, related tests). If they fail, fix them or stop and report. Do not commit or archive a broken state.

4. **Persist durable knowledge.** Ask: what would a fresh session need that is not obvious from the diff?
   - Design decisions, rejected options, and pitfalls go in the repository's own docs (follow `AGENTS.md` / `CLAUDE.md`: plan, ADR, changelog).
   - The user's preferences or corrections that apply across tasks go to memory.
   - Unfinished follow-ups go into a TODO, an issue, or a proposed new session, not just the final message.

   Skip this step when there is nothing new. Do not repeat what the commit message already says.

5. **Commit.** Follow the repository's commit conventions (Conventional Commits by default, plus any required attribution lines). Split unrelated logical changes into separate commits. Respect the repository's branch rules. If it forbids committing to the default branch, create a branch first.

6. **Push** only if `$ARGUMENTS` contains `push` or the repository's instructions require it. Never force-push.

7. **Check whether it is safe to archive.** Do not archive, and say why, if any of these holds:
   - the session runs in a worktree that still has uncommitted changes, because archiving cleans up the worktree;
   - background tasks or side sessions started from this session are still running;
   - an open PR from this session is waiting for review or CI. Suggest keeping the session, or enabling auto-archive on PR close, instead.

8. **Report** in a few lines:

   ```
   ## Wrap-up

   Commits: <short-hash> <subject> (pushed / not pushed)
   Persisted: <docs or memory updated, or "nothing new">
   Left alone: <unrelated changed paths, or "clean">
   Follow-ups: <issue / TODO / proposed session, or "none">
   ```

9. **Archive.** Skip this step if `$ARGUMENTS` contains `keep` or step 7 blocked it. Otherwise archive this session as the very last action. In the Claude Code desktop app, call the session archive tool with `session_id: "self"`. The conversation ends there. If the host has no such tool (CLI or other agents), say the task is closed and suggest `/clear` or starting a new session. Do not claim the session was archived.
