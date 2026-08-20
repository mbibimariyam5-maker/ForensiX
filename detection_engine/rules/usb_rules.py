from __future__ import annotations
from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score


def detect_usb(
    event: Event,
    config: DetectionConfig,
) -> list[dict]:

    if event.category != "usb":
        return []

    if event.action in {
        "device_connected",
        "mount",
        "removable_media_connected",
    }:

        result = calculate_score(45)

        return [{
            "type": "USB_DEVICE_ACTIVITY",
            "score": result.score,
            "severity": result.severity,
            "reason": (
                "USB/removable device connection event detected"
            ),
        }]

    return []