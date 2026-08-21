from .schemas import Finding, Explanation

def generate_explanation(finding: Finding) -> Explanation:
    """
    Generate an evidence-grounded explanation for a detection finding.

    The detection engine's severity is treated as authoritative.
    The AI layer explains the existing finding and does not independently
    determine whether the artifact is malicious.
    """

    severity = finding.severity.strip().upper()

    priority_messages = {
        "CRITICAL": (
            f"This finding has a critical investigation priority "
            f"with a score of {finding.score}."
        ),
        "HIGH": (
            f"This finding has a high investigation priority "
            f"with a score of {finding.score}."
        ),
        "MEDIUM": (
            f"This finding has a medium investigation priority "
            f"with a score of {finding.score}."
        ),
        "LOW": (
            f"This finding has a low investigation priority "
            f"with a score of {finding.score}."
        )
    }

    # Handle unexpected severity values safely.
    if severity in priority_messages:
        priority_explanation = priority_messages[severity]
    else:
        priority_explanation = (
            f"This finding has a severity of '{finding.severity}' "
            f"and an investigation score of {finding.score}. "
            f"The severity value was provided by the detection engine."
        )

    # Safely handle an empty reasons list.
    if finding.reasons:
        reason_text = ", ".join(finding.reasons)

        summary = (
            f"The artifact '{finding.artifact}' was identified as a "
            f"potentially relevant finding based on: {reason_text}."
        )
    else:
        summary = (
            f"The artifact '{finding.artifact}' was identified as a "
            f"potentially relevant finding, but no specific detection "
            f"reason was provided."
        )

    # Clearly identify simulated evidence.
    if finding.source and finding.source.lower() == "simulator":
        summary += " The source is marked as simulated evidence."

    return Explanation(
        finding_id=finding.finding_id,
        summary=summary,
        priority_explanation=priority_explanation,
        evidence_basis=finding.reasons,
        confidence="rule_based",
        disclaimer=(
            "This finding represents investigation priority and does not "
            "by itself prove malicious activity."
        )
    )