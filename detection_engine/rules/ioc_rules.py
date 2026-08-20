from __future__ import annotations
from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score
from .helpers import lower


def detect_ioc(
    event: Event,
    config: DetectionConfig,
) -> list[dict]:

    values = {
        lower(event.artifact),
        lower(event.attributes.get("hash")),
        lower(event.attributes.get("sha256")),
        lower(event.attributes.get("destination_ip")),
        lower(event.attributes.get("domain")),
    }

    configured_iocs = (
        {item.lower() for item in config.suspicious_hashes}
        |
        {item.lower() for item in config.suspicious_ips}
        |
        {item.lower() for item in config.suspicious_domains}
    )

    if values & configured_iocs:

        result = calculate_score(90)

        return [{
            "type": "IOC_MATCH",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "Artifact or network indicator matched "
                "a configured IOC"
            ),
        }]

    return []