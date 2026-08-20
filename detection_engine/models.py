from dataclasses import dataclass, field
from typing import Any


@dataclass
class Event:
    event_id: str
    case_id: str
    timestamp: str
    category: str
    artifact: str
    action: str
    source: str
    actor: str | None = None
    attributes: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Event":
        required_fields = [
            "event_id",
            "case_id",
            "timestamp",
            "category",
            "artifact",
            "action",
            "source",
        ]

        missing = [
            field for field in required_fields
            if field not in data
        ]

        if missing:
            raise ValueError(
                f"Missing required event fields: {', '.join(missing)}"
            )

        return cls(
            event_id=str(data["event_id"]),
            case_id=str(data["case_id"]),
            timestamp=str(data["timestamp"]),
            category=str(data["category"]).lower(),
            artifact=str(data["artifact"]),
            action=str(data["action"]).lower(),
            source=str(data["source"]),
            actor=data.get("actor"),
            attributes=dict(data.get("attributes") or {}),
        )


@dataclass
class Finding:
    finding_id: str
    artifact: str
    type: str
    severity: str
    score: int
    timestamp: str
    reasons: list[str]
    source: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "finding_id": self.finding_id,
            "artifact": self.artifact,
            "type": self.type,
            "severity": self.severity,
            "score": self.score,
            "timestamp": self.timestamp,
            "reasons": self.reasons,
            "source": self.source,
        }