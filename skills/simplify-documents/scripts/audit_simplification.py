#!/usr/bin/env python3
"""Audit document length reduction and exact preservation of protected passages."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


def non_whitespace_length(text: str) -> int:
    """Return a language-neutral approximation of document length."""
    return sum(not character.isspace() for character in text)


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        raise ValueError(f"cannot read UTF-8 text from {path}: {error}") from error


def read_protected(path: Path) -> list[str]:
    try:
        value = json.loads(read_text(path))
    except json.JSONDecodeError as error:
        raise ValueError(f"protected file must be valid JSON: {error}") from error

    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ValueError("protected file must contain a JSON array of strings")
    if any(not item for item in value):
        raise ValueError("protected passages must not be empty")
    if len(set(value)) != len(value):
        raise ValueError("protected passages must not contain duplicates")
    return value


def occurrence_positions(text: str, passage: str) -> list[int]:
    """Return the start of every non-overlapping occurrence."""
    positions = []
    start = 0
    while True:
        position = text.find(passage, start)
        if position < 0:
            return positions
        positions.append(position)
        start = position + len(passage)


def audit(
    original: str,
    simplified: str,
    protected: list[str],
    target_output_ratio: float | None,
    tolerance: float,
) -> dict[str, Any]:
    original_length = non_whitespace_length(original)
    simplified_length = non_whitespace_length(simplified)
    if original_length == 0:
        raise ValueError("original document has no non-whitespace characters")

    output_ratio = simplified_length / original_length
    reduction_ratio = 1 - output_ratio
    target_ok = (
        target_output_ratio is None
        or abs(output_ratio - target_output_ratio) <= tolerance
    )
    protected_results = []
    source_sequence = []
    output_sequence = []
    for index, passage in enumerate(protected, start=1):
        source_positions = occurrence_positions(original, passage)
        output_positions = occurrence_positions(simplified, passage)
        source_occurrences = len(source_positions)
        output_occurrences = len(output_positions)
        occurrence_count_met = (
            source_occurrences > 0 and output_occurrences == source_occurrences
        )
        source_sequence.extend((position, index) for position in source_positions)
        output_sequence.extend((position, index) for position in output_positions)
        protected_results.append(
            {
                "index": index,
                "present_in_source": source_occurrences > 0,
                "preserved": occurrence_count_met,
                "occurrence_count_met": occurrence_count_met,
                "source_occurrences": source_occurrences,
                "output_occurrences": output_occurrences,
            }
        )
    source_order = [index for _, index in sorted(source_sequence)]
    output_order = [index for _, index in sorted(output_sequence)]
    order_preserved = source_order == output_order
    protection_ok = (
        all(item["preserved"] for item in protected_results) and order_preserved
    )

    return {
        "passed": target_ok and protection_ok,
        "metric": "non_whitespace_characters",
        "original_length": original_length,
        "simplified_length": simplified_length,
        "output_ratio": round(output_ratio, 4),
        "reduction_ratio": round(reduction_ratio, 4),
        "target_output_ratio": target_output_ratio,
        "tolerance": tolerance if target_output_ratio is not None else None,
        "target_met": target_ok,
        "protected_passages_met": protection_ok,
        "protected_passages_ordered": order_preserved,
        "protected_passages": protected_results,
    }


def format_text(result: dict[str, Any]) -> str:
    lines = [
        f"Result: {'PASS' if result['passed'] else 'FAIL'}",
        f"Metric: {result['metric']}",
        f"Length: {result['original_length']} -> {result['simplified_length']}",
        f"Output ratio: {result['output_ratio']:.2%}",
        f"Reduction ratio: {result['reduction_ratio']:.2%}",
    ]
    if result["target_output_ratio"] is not None:
        lines.append(
            "Target: "
            f"{result['target_output_ratio']:.2%} ± {result['tolerance']:.2%} "
            f"({'met' if result['target_met'] else 'missed'})"
        )
    if result["protected_passages"]:
        preserved = sum(
            item["preserved"] for item in result["protected_passages"]
        )
        lines.append(
            f"Protected passages: {preserved}/{len(result['protected_passages'])} preserved"
        )
        for item in result["protected_passages"]:
            if not item["present_in_source"]:
                lines.append(f"  - Protected passage #{item['index']} is not in the source")
            elif not item["preserved"]:
                lines.append(
                    f"  - Protected passage #{item['index']} occurrence count differs: "
                    f"{item['source_occurrences']} in source, "
                    f"{item['output_occurrences']} in output"
                )
        if not result["protected_passages_ordered"]:
            lines.append("  - Protected passage order differs from the source")
    return "\n".join(lines)


def ratio(value: str) -> float:
    try:
        parsed = float(value)
    except ValueError as error:
        raise argparse.ArgumentTypeError("must be a number from 0 to 1") from error
    if not 0 <= parsed <= 1:
        raise argparse.ArgumentTypeError("must be a number from 0 to 1")
    return parsed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Measure the output ratio using non-whitespace characters and verify "
            "that protected passages remain exact substrings."
        )
    )
    parser.add_argument("--original", required=True, type=Path)
    parser.add_argument("--simplified", required=True, type=Path)
    parser.add_argument("--protected-file", type=Path)
    parser.add_argument("--target-output-ratio", type=ratio)
    parser.add_argument("--tolerance", type=ratio, default=0.05)
    parser.add_argument("--json", action="store_true", dest="as_json")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        original = read_text(args.original)
        simplified = read_text(args.simplified)
        protected = read_protected(args.protected_file) if args.protected_file else []
        result = audit(
            original,
            simplified,
            protected,
            args.target_output_ratio,
            args.tolerance,
        )
    except ValueError as error:
        parser.error(str(error))

    if args.as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(format_text(result))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
