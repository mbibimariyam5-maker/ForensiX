from pydantic import BaseModel
from typing import List, Optional


class Finding(BaseModel):
    finding_id: str
    artifact: str
    type: str
    severity: str
    score: int
    timestamp: str
    reasons: List[str]
    source: Optional[str] = None


class Explanation(BaseModel):
    finding_id: str
    summary: str
    priority_explanation: str
    evidence_basis: List[str]
    confidence: str
    disclaimer: str