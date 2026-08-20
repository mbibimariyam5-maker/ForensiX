from __future__ import annotations

from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score
from .helpers import extension, normalized_path


def detect_file(
    event: Event,
    config: DetectionConfig,
) -> list[dict]:

    if event.category != "file":
        return []

    findings = []

    path = normalized_path(
        event.attributes.get(
            "path",
            event.artifact,
        )
    )

    ext = extension(event.artifact)

    # FILE-001
    if (
        event.action in {"create", "write", "modify"}
        and any(
            marker in path
            for marker in config.suspicious_process_paths
        )
        and ext in config.suspicious_extensions
    ):
        result = calculate_score(65)

        findings.append({
            "type": "SUSPICIOUS_FILE",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "Executable/script file was created or modified "
                "in a configured suspicious location"
            ),
        })

    return findings