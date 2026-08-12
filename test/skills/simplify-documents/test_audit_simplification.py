from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
SCRIPT = (
    REPO_ROOT
    / "skills"
    / "simplify-documents"
    / "scripts"
    / "audit_simplification.py"
)
FIXTURES = Path(__file__).resolve().parent / "fixtures"


class AuditSimplificationTest(unittest.TestCase):
    def run_audit(
        self,
        simplified: str,
        *extra: str,
        original: str = "source.md",
        protected: str = "protected.json",
    ) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                str(SCRIPT),
                "--original",
                str(FIXTURES / original),
                "--simplified",
                str(FIXTURES / simplified),
                "--protected-file",
                str(FIXTURES / protected),
                "--json",
                *extra,
            ],
            check=False,
            capture_output=True,
            text=True,
        )

    def test_good_sample_meets_ratio_and_protection(self) -> None:
        result = self.run_audit(
            "concise-good.md",
            "--target-output-ratio",
            "0.65",
            "--tolerance",
            "0.10",
        )
        self.assertEqual(result.returncode, 0, result.stderr or result.stdout)
        report = json.loads(result.stdout)
        self.assertTrue(report["target_met"])
        self.assertTrue(report["protected_passages_met"])

    def test_missing_protected_passage_fails(self) -> None:
        result = self.run_audit("concise-bad.md")
        self.assertEqual(result.returncode, 1)
        report = json.loads(result.stdout)
        self.assertFalse(report["protected_passages_met"])

    def test_ratio_miss_fails(self) -> None:
        result = self.run_audit(
            "concise-good.md",
            "--target-output-ratio",
            "0.20",
            "--tolerance",
            "0.01",
        )
        self.assertEqual(result.returncode, 1)
        report = json.loads(result.stdout)
        self.assertFalse(report["target_met"])

    def test_protected_passage_must_exist_in_source(self) -> None:
        result = self.run_audit(
            "concise-good.md",
            protected="protected-not-in-source.json",
        )
        self.assertEqual(result.returncode, 1)
        report = json.loads(result.stdout)
        self.assertFalse(report["protected_passages"][0]["present_in_source"])

    def test_every_protected_occurrence_must_be_preserved(self) -> None:
        result = self.run_audit(
            "concise-repeated-bad.md",
            original="source-repeated.md",
            protected="protected-repeated.json",
        )
        self.assertEqual(result.returncode, 1)
        report = json.loads(result.stdout)
        self.assertEqual(report["protected_passages"][0]["source_occurrences"], 2)
        self.assertEqual(report["protected_passages"][0]["output_occurrences"], 1)
        self.assertFalse(report["protected_passages_met"])

    def test_protected_passages_must_keep_source_order(self) -> None:
        result = self.run_audit(
            "concise-reordered-bad.md",
            original="source-ordered.md",
            protected="protected-ordered.json",
        )
        self.assertEqual(result.returncode, 1)
        report = json.loads(result.stdout)
        self.assertFalse(report["protected_passages_ordered"])
        self.assertFalse(report["protected_passages_met"])


if __name__ == "__main__":
    unittest.main()
