from __future__ import annotations

from typing import Any, Iterable

from .models import Event


def adapt_event(raw: dict[str, Any]) -> Event:
    """
    Convert Tejas's Evidence Processing event
    into the Detection Engine's internal Event model.

    Tejas's MVP event format:
        event_id
        case_id
        timestamp
        category
        action
        artifact
        source
        attributes

    The Detection rules use the internal Event model,
    so future changes to Tejas's schema can be handled here.
    """

    return Event.from_dict(raw)


def adapt_events(
    raw_events: Iterable[dict[str, Any]]
) -> list[Event]:

    return [
        adapt_event(event)
        for event in raw_events
    ]