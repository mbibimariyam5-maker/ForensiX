"""Tests for the timeline module."""

import pytest
from datetime import datetime, timedelta
from forensic.timeline import TimelineAnalyzer, TimelineEvent, EventType


class TestTimelineEvent:
    """Test cases for TimelineEvent class."""

    def test_event_creation(self):
        """Test creating a TimelineEvent."""
        now = datetime.now()
        event = TimelineEvent(
            timestamp=now,
            event_type=EventType.FILE_CREATION,
            source="filesystem",
            description="File created",
        )
        assert event.timestamp == now
        assert event.event_type == EventType.FILE_CREATION
        assert event.source == "filesystem"
        assert event.description == "File created"
        assert event.metadata == {}

    def test_event_with_metadata(self):
        """Test creating TimelineEvent with metadata."""
        event = TimelineEvent(
            timestamp=datetime.now(),
            event_type=EventType.FILE_CREATION,
            source="filesystem",
            description="File created",
            metadata={"filename": "test.txt", "size": 1024},
        )
        assert event.metadata["filename"] == "test.txt"
        assert event.metadata["size"] == 1024


class TestTimelineAnalyzer:
    """Test cases for TimelineAnalyzer class."""

    def test_init(self):
        """Test TimelineAnalyzer initialization."""
        analyzer = TimelineAnalyzer()
        assert analyzer.events == []

    def test_add_event(self):
        """Test adding events."""
        analyzer = TimelineAnalyzer()
        event = TimelineEvent(
            timestamp=datetime.now(),
            event_type=EventType.FILE_CREATION,
            source="filesystem",
            description="File created",
        )
        analyzer.add_event(event)
        assert len(analyzer.events) == 1
        assert analyzer.events[0] == event

    def test_get_sorted_events(self):
        """Test getting sorted events by timestamp."""
        analyzer = TimelineAnalyzer()
        now = datetime.now()

        event1 = TimelineEvent(
            timestamp=now + timedelta(hours=2),
            event_type=EventType.FILE_CREATION,
            source="filesystem",
            description="Event 2",
        )
        event2 = TimelineEvent(
            timestamp=now,
            event_type=EventType.FILE_MODIFICATION,
            source="filesystem",
            description="Event 1",
        )
        event3 = TimelineEvent(
            timestamp=now + timedelta(hours=1),
            event_type=EventType.FILE_DELETION,
            source="filesystem",
            description="Event 3",
        )

        analyzer.add_event(event1)
        analyzer.add_event(event2)
        analyzer.add_event(event3)

        sorted_events = analyzer.get_sorted_events()
        assert sorted_events[0].description == "Event 1"
        assert sorted_events[1].description == "Event 3"
        assert sorted_events[2].description == "Event 2"

    def test_filter_by_type(self):
        """Test filtering events by type."""
        analyzer = TimelineAnalyzer()
        now = datetime.now()

        analyzer.add_event(
            TimelineEvent(
                timestamp=now,
                event_type=EventType.FILE_CREATION,
                source="filesystem",
                description="File created",
            )
        )
        analyzer.add_event(
            TimelineEvent(
                timestamp=now,
                event_type=EventType.FILE_MODIFICATION,
                source="filesystem",
                description="File modified",
            )
        )
        analyzer.add_event(
            TimelineEvent(
                timestamp=now,
                event_type=EventType.FILE_CREATION,
                source="filesystem",
                description="Another file created",
            )
        )

        creation_events = analyzer.filter_by_type(EventType.FILE_CREATION)
        assert len(creation_events) == 2
        assert all(e.event_type == EventType.FILE_CREATION for e in creation_events)

    def test_filter_by_date_range(self):
        """Test filtering events by date range."""
        analyzer = TimelineAnalyzer()
        base = datetime(2024, 1, 1)

        analyzer.add_event(
            TimelineEvent(
                timestamp=base + timedelta(hours=1),
                event_type=EventType.FILE_CREATION,
                source="filesystem",
                description="Event 1",
            )
        )
        analyzer.add_event(
            TimelineEvent(
                timestamp=base + timedelta(hours=5),
                event_type=EventType.FILE_MODIFICATION,
                source="filesystem",
                description="Event 2",
            )
        )
        analyzer.add_event(
            TimelineEvent(
                timestamp=base + timedelta(hours=10),
                event_type=EventType.FILE_DELETION,
                source="filesystem",
                description="Event 3",
            )
        )

        start = base
        end = base + timedelta(hours=6)
        filtered = analyzer.filter_by_date_range(start, end)
        assert len(filtered) == 2

    def test_get_event_sequence(self):
        """Test getting chronological event sequence."""
        analyzer = TimelineAnalyzer()
        now = datetime.now()

        analyzer.add_event(
            TimelineEvent(
                timestamp=now,
                event_type=EventType.FILE_CREATION,
                source="filesystem",
                description="File created",
            )
        )
        analyzer.add_event(
            TimelineEvent(
                timestamp=now + timedelta(hours=1),
                event_type=EventType.FILE_MODIFICATION,
                source="filesystem",
                description="File modified",
            )
        )

        sequence = analyzer.get_event_sequence()
        assert len(sequence) == 2
        assert isinstance(sequence[0], str)
        assert "file_creation" in sequence[0]
