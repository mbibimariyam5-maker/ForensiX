from pydantic import BaseModel
from typing import Any


class EvidenceCreate(BaseModel):
    case_id: str
    filename: str
    file_path: str
    sha256: str
    size_bytes: int
    artifact_type: str = "UNKNOWN"
    source: str = "evidence_processing"


class FindingCreate(BaseModel):
    finding_id: str
    case_id: str
    artifact: str
    type: str
    severity: str
    score: int
    timestamp: str
    reasons: list[str]
    source: str = "detection_engine"


class TimelineEventCreate(BaseModel):
    case_id: str
    timestamp: str
    event_type: str
    source: str
    description: str
    metadata: dict[str, Any] = {}