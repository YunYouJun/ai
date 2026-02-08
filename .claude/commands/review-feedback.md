Fetch and address PR review feedback (from Copilot or human reviewers).

## Instructions

1. Get the current PR number. If $ARGUMENTS is provided, use it as the PR number. Otherwise, detect from the current branch: `gh pr view --json number -q .number`
2. Fetch all review comments: `gh pr view <number> --json reviews,comments,reviewRequests`
3. Also fetch inline review comments: `gh api repos/{owner}/{repo}/pulls/<number>/comments --jq '.[] | {path, line: .original_line, body, diff_hunk}'`
4. Analyze each review comment and categorize:
   - **Must fix**: bugs, security issues, correctness problems
   - **Should fix**: style, readability, best practices
   - **Optional**: nitpicks, suggestions
5. For each "must fix" and "should fix" item, implement the changes
6. Run lint/typecheck after changes
7. Commit with message: `fix: address review feedback`
8. Push the changes: `git push`
9. Reply to each addressed comment on the PR: `gh pr comment <number> --body "Addressed review feedback: <summary>"`
10. Report what was changed and what was intentionally skipped (with reasoning)
