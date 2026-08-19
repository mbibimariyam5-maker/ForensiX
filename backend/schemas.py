from pydantic import BaseModel


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