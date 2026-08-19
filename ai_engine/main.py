from schemas import Finding
from explanation import generate_explanation


test_finding = Finding(
    id="F-001",
    artifact="suspicious_sample.exe",
    type="IOC_MATCH",
    severity="HIGH",
    score=85,
    timestamp="2026-08-18T10:24:12",
    reasons=[
        "Configured IOC match",
        "Related suspicious event"
    ],
    source="simulator"
)


result = generate_explanation(test_finding)

print("AI ENGINE TEST")
print("=" * 50)
print("Finding ID:", result.finding_id)
print("Summary:", result.summary)
print("Priority:", result.priority_explanation)
print("Evidence Basis:", result.evidence_basis)
print("Confidence:", result.confidence)
print("Disclaimer:", result.disclaimer)