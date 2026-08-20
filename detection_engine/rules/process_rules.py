from __future__ import annotations

from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score
from .helpers import lower, normalized_path


def detect_process(
    event: Event,
    config: DetectionConfig,
) -> list[dict]:

    if event.category != "process":
        return []

    findings = []

    path = normalized_path(
        event.attributes.get(
            "path",
            event.artifact,
        )
    )

    process_name = lower(
        event.attributes.get(
            "process_name",
            event.artifact,
        )
    )

    parent = lower(
        event.attributes.get(
            "parent_process"
        )
    )

    # PROC-001
    if any(
        marker in path
        for marker in config.suspicious_process_paths
    ):
        result = calculate_score(70)

        findings.append({
            "type": "SUSPICIOUS_PROCESS",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "Process executed from a configured "
                "suspicious location"
            ),
        })

    # PROC-002
    if (
        parent in config.suspicious_parent_processes
        and process_name in config.suspicious_child_processes
    ):
        result = calculate_score(75)

        findings.append({
            "type": "SUSPICIOUS_PROCESS_RELATION",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                f"Suspicious parent/child process relationship: "
                f"{parent} -> {process_name}"
            ),
        })

    return findings