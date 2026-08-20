from dataclasses import dataclass


@dataclass(frozen=True)
class ScoreResult:
    score: int
    severity: str


def severity_for_score(score: int) -> str:
    if score >= 90:
        return "CRITICAL"

    if score >= 70:
        return "HIGH"

    if score >= 40:
        return "MEDIUM"

    return "LOW"


def calculate_score(
    base_score: int,
    extra: int = 0,
) -> ScoreResult:
    """
    Generate an investigation-priority score.

    This is NOT a probability of maliciousness.
    It is NOT a forensic conclusion.
    """

    score = max(0, min(100, base_score + extra))

    return ScoreResult(
        score=score,
        severity=severity_for_score(score),
    )