from __future__ import annotations

from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score


def detect_privilege(
    event: Event,
    config: DetectionConfig,
) -> list[dict]:

    if event.category != "privilege":
        return []

    if event.action in {
        "privilege_escalation",
        "privilege_change",
        "admin_granted",
        "role_changed",
    }:

        result = calculate_score(75)

        return [{
            "type": "PRIVILEGE_CHANGE",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "Privilege or role change event detected"
            ),
        }]

    return []