from __future__ import annotations

from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score
from .helpers import lower


def detect_network(
    event: Event,
    config: DetectionConfig,
) -> list[dict]:

    if event.category != "network":
        return []

    findings = []

    destination_ip = lower(
        event.attributes.get(
            "destination_ip",
            event.artifact,
        )
    )

    domain = lower(
        event.attributes.get("domain")
    )

    port = event.attributes.get(
        "destination_port"
    )

    configured_ips = {
        ip.lower()
        for ip in config.suspicious_ips
    }

    configured_domains = {
        domain.lower()
        for domain in config.suspicious_domains
    }

    # NET-001
    if (
        destination_ip in configured_ips
        or domain in configured_domains
    ):
        result = calculate_score(85)

        findings.append({
            "type": "IOC_NETWORK_MATCH",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "Network destination matched a configured "
                "IP/domain IOC"
            ),
        })

    # NET-002
    try:
        port_int = int(port)
    except (TypeError, ValueError):
        port_int = None

    if port_int in config.suspicious_network_ports:
        result = calculate_score(60)

        findings.append({
            "type": "SUSPICIOUS_NETWORK_CONNECTION",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "Network connection used configured "
                f"suspicious destination port {port_int}"
            ),
        })

    return findings