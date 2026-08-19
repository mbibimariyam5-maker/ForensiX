from .schemas import Finding, Explanation


def generate_explanation(finding: Finding) -> Explanation:

    reasons = finding.reasons

    if finding.severity.upper() == "HIGH":
        priority = (
            f"This finding has a high investigation priority "
            f"with a score of {finding.score}."
        )
    elif finding.severity.upper() == "MEDIUM":
        priority = (
            f"This finding has a medium investigation priority "
            f"with a score of {finding.score}."
        )
    else:
        priority = (
            f"This finding has a low investigation priority "
            f"with a score of {finding.score}."
        )

    reason_text = ", ".join(reasons)

    summary = (
        f"The artifact '{finding.artifact}' was identified as a "
        f"potentially relevant finding based on: {reason_text}."
    )

    if finding.source == "simulator":
        summary += " The source is marked as simulated evidence."

    return Explanation(
        finding_id=finding.finding_id,
        summary=summary,
        priority_explanation=priority,
        evidence_basis=reasons,
        confidence="rule_based",
        disclaimer=(
            "This finding represents investigation priority and "
            "does not by itself prove malicious activity."
        )
    )