from __future__ import annotations
from datetime import datetime, timezone
from ..config import DetectionConfig
from ..models import Event
from ..scoring import calculate_score


def parse_timestamp(value: str) -> datetime:
    parsed = datetime.fromisoformat(
        value.replace("Z", "+00:00")
    )

    if parsed.tzinfo is None:
        parsed = parsed.replace(
            tzinfo=timezone.utc
        )

    return parsed


def detect_authentication(
    event: Event,
    all_events: list[Event],
    config: DetectionConfig,
) -> list[dict]:

    if event.category != "authentication":
        return []

    if event.action not in {
        "login_failed",
        "authentication_failed",
        "failed_login",
    }:
        return []

    try:
        current = parse_timestamp(
            event.timestamp
        )
    except ValueError:
        return []

    actor = str(
        event.actor
        or event.attributes.get("username")
        or ""
    )

    failures = 0

    for candidate in all_events:

        if candidate.category != "authentication":
            continue

        if candidate.action not in {
            "login_failed",
            "authentication_failed",
            "failed_login",
        }:
            continue

        candidate_actor = str(
            candidate.actor
            or candidate.attributes.get("username")
            or ""
        )

        if candidate_actor != actor:
            continue

        try:
            candidate_time = parse_timestamp(
                candidate.timestamp
            )
        except ValueError:
            continue

        delta = abs(
            (
                current - candidate_time
            ).total_seconds()
        )

        if delta <= config.failed_auth_window_seconds:
            failures += 1

        if failures >= config.failed_auth_threshold:

                # Only create the finding for the latest event
                # in this authentication failure window.
                later_failures = 0

                for candidate in all_events:
                    if candidate.category != "authentication":
                        continue

                    if candidate.action not in {
                        "login_failed",
                        "authentication_failed",
                        "failed_login",
                    }:
                        continue

                    candidate_actor = str(
                        candidate.actor
                        or candidate.attributes.get("username")
                        or ""
                    )

                    if candidate_actor != actor:
                        continue

                    try:
                        candidate_time = parse_timestamp(
                            candidate.timestamp
                        )
                    except ValueError:
                        continue

                    if candidate_time > current:
                        later_failures += 1

                if later_failures > 0:
                    return []

                result = calculate_score(70)

                return [{
                    "type": "REPEATED_AUTH_FAILURE",
                    "score": result.score,
                    "severity": result.severity,
                    "reason": (
                        f"{failures} failed authentication events "
                        f"for actor '{actor}' within "
                        f"{config.failed_auth_window_seconds} seconds"
                    ),
                }]

    return []