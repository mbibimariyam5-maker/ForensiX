"""
Timeline module for forensic analysis.

Provides utilities for temporal analysis, event sequencing, and
timeline reconstruction from digital evidence.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional, Dict
from enum import Enum


class EventType(Enum):
    """Types of forensic events."""

    FILE_CREATION = "file_creation"
    FILE_MODIFICATION = "file_modification"
    FILE_DELETION = "file_deletion"
    FILE_ACCESS = "file_access"
    REGISTRY_CHANGE = "registry_change"
    NETWORK_CONNECTION = "network_connection"
    PROCESS_EXECUTION = "process_execution"
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    OTHER = "other"


@dataclass
class TimelineEvent:
    """Represents a single forensic event in a timeline."""

    timestamp: datetime
    event_type: EventType
    source: str
    description: str
    metadata: Dict = None

    def __post_init__(self):
        """Initialize metadata if not provided."""
        if self.metadata is None:
            self.metadata = {}


class TimelineAnalyzer:
    """Analyze and reconstruct timelines from forensic events."""

    def __init__(self):
        """Initialize TimelineAnalyzer."""
        self.events: List[TimelineEvent] = []

    def add_event(self, event: TimelineEvent) -> None:
        """
        Add an event to the timeline.

        Args:
            event: TimelineEvent to add
        """
        self.events.append(event)

    def get_sorted_events(self) -> List[TimelineEvent]:
        """
        Get events sorted by timestamp.

        Returns:
            Sorted list of TimelineEvent objects
        """
        return sorted(self.events, key=lambda e: e.timestamp)

    def filter_by_type(self, event_type: EventType) -> List[TimelineEvent]:
        """
        Filter events by type.

        Args:
            event_type: Type of event to filter

        Returns:
            List of events matching the type
        """
        return [e for e in self.events if e.event_type == event_type]

    def filter_by_date_range(
        self, start: datetime, end: datetime
    ) -> List[TimelineEvent]:
        """
        Filter events within a date range.

        Args:
            start: Start datetime
            end: End datetime

        Returns:
            List of events within range
        """
        return [e for e in self.events if start <= e.timestamp <= end]

    def get_event_sequence(self) -> List[str]:
        """
        Get chronological sequence of events.

        Returns:
            List of event descriptions in chronological order
        """
        sorted_events = self.get_sorted_events()
        return [
            f"{e.timestamp.isoformat()} | {e.event_type.value} | {e.description}"
            for e in sorted_events
        ]
