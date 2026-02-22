---
name: pr-cycle
description: "Full PR lifecycle automation: fix issue → create PR → wait for review → address feedback. All in one command."
disable-model-invocation: true
---

Full PR lifecycle: fix issue → create PR → wait for review → address feedback.

## Instructions

This is the full automated cycle. Run the following steps:

### Step 1: Fix the issue

1. Fetch issue details: `gh issue view $ARGUMENTS --json title,body,labels,comments`
2. Create branch, implement fix, run checks, commit, push
3. Create PR: `gh pr create --fill`

### Step 2: Check for existing reviews

1. Wait a moment, then check: `gh pr view --json reviews,comments`
2. Fetch inline comments: `gh api repos/{owner}/{repo}/pulls/<number>/comments`

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
