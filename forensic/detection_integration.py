import requests

from detection_engine import DetectionEngine
from detection_engine.input_adapter import adapt_events


BACKEND_URL = "http://127.0.0.1:8000"


def send_finding_to_backend(finding: dict, case_id: str):
    payload = {
        "finding_id": finding["finding_id"],
        "case_id": case_id,
        "artifact": finding["artifact"],
        "type": finding["type"],
        "severity": finding["severity"],
        "score": finding["score"],
        "timestamp": finding["timestamp"],
        "reasons": finding["reasons"],
        "source": finding["source"],
    }

    response = requests.post(
        f"{BACKEND_URL}/api/findings",
        json=payload,
        timeout=10
    )

    response.raise_for_status()

    return response.json()


def process_events(
    raw_events: list[dict],
    backend_case_id: str
):
    """
    Run the Detection Engine and send generated findings
    to the specified backend case.

    The backend_case_id is explicitly supplied by the
    integration layer so test event case IDs do not need
    to match backend case IDs.
    """

    events = adapt_events(raw_events)

    engine = DetectionEngine()

    findings = engine.detect(events)

    results = []

    for finding in findings:
        finding_dict = finding.to_dict()

        result = send_finding_to_backend(
            finding_dict,
            backend_case_id
        )

        results.append(result)

    return results