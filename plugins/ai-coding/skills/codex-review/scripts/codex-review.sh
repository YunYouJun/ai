#!/usr/bin/env bash
set -euo pipefail

# Wrapper for OpenAI Codex CLI Plan Review & Code Review
# Defaults to gpt-6.1-sol with xhigh reasoning effort.

MODEL="${CODEX_REVIEW_MODEL:-gpt-6.1-sol}"
EFFORT="${CODEX_REVIEW_EFFORT:-xhigh}"
OUT_FILE="${CODEX_REVIEW_OUT:-/tmp/codex-review-last.md}"

usage() {
  cat <<'EOF'
Usage:
  codex-review.sh plan <plan-file> [custom-prompt]
  codex-review.sh code [--uncommitted | --base <branch> | --commit <sha>]
  codex-review.sh custom "<prompt>"

Environment overrides:
  CODEX_REVIEW_MODEL   Model name (default: gpt-6.1-sol)
  CODEX_REVIEW_EFFORT  Reasoning effort (default: xhigh)
  CODEX_REVIEW_OUT     Output markdown path (default: /tmp/codex-review-last.md)
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

MODE="$1"
shift

case "$MODE" in
  plan)
    if [[ $# -lt 1 ]]; then
      echo "Error: 'plan' mode requires a <plan-file> path (or '-' for stdin)." >&2
      exit 1
    fi
    PLAN_FILE="$1"
    shift
    EXTRA_PROMPT="${*:-}"
    if [[ "$PLAN_FILE" == "-" ]]; then
      PLAN_FILE="/tmp/codex-plan-stdin-$$.md"
      cat > "$PLAN_FILE"
    fi
    PROMPT="You are a Staff Engineer performing an adversarial Plan Review. Read the implementation plan at '${PLAN_FILE}' and verify its assumptions against this repository. Categorize findings into:
- MUST_FIX: architectural flaws, invalid file/API assumptions, concurrency/state bugs, security risks, or missing critical edge cases.
- SHOULD_FIX: simpler alternatives, missing test strategy, or repo convention mismatches.
- NIT: minor suggestions.
${EXTRA_PROMPT}
End with 'VERDICT: APPROVED' or 'VERDICT: REVISE'."

    codex exec -s read-only --ephemeral \
      -c "model=\"${MODEL}\"" \
      -c "model_reasoning_effort=\"${EFFORT}\"" \
      -o "$OUT_FILE" \
      "$PROMPT"
    ;;

  code)
    # Default to --uncommitted when no target flags are passed
    if [[ $# -eq 0 ]]; then
      set -- --uncommitted
    fi
    codex exec review "$@" --ephemeral \
      -c "model=\"${MODEL}\"" \
      -c "model_reasoning_effort=\"${EFFORT}\"" \
      -o "$OUT_FILE"
    ;;

  custom)
    if [[ $# -lt 1 ]]; then
      echo "Error: 'custom' mode requires a prompt string." >&2
      exit 1
    fi
    codex exec -s read-only --ephemeral \
      -c "model=\"${MODEL}\"" \
      -c "model_reasoning_effort=\"${EFFORT}\"" \
      -o "$OUT_FILE" \
      "$*"
    ;;

  -h|--help|help)
    usage
    exit 0
    ;;

  *)
    echo "Unknown mode: $MODE" >&2
    usage
    exit 1
    ;;
esac

echo ""
echo "✅ Codex review saved to: $OUT_FILE"
