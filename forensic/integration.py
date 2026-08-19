"""
ForensiX AI - Forensic Integration

Connects the Evidence Processing module with the Backend API.

This module does not modify original evidence files.
It accepts the evidence metadata produced by Tejas's
evidence_processing module and sends that metadata to the backend.
"""

from typing import Any

import requests


REQUIRED_EVIDENCE_FIELDS = {
    "case_id",
    "filename",
    "file_path",
    "sha256",
    "size_bytes",
    "artifact_type",
    "source",
}


def validate_evidence_payload(evidence: dict[str, Any]) -> None:
    """
    Validate the evidence metadata before sending it to the backend.

    Raises:
        TypeError: If evidence is not a dictionary.
        ValueError: If required fields are missing or invalid.
    """

    if not isinstance(evidence, dict):
        raise TypeError("Evidence payload must be a dictionary.")

    missing_fields = REQUIRED_EVIDENCE_FIELDS - evidence.keys()

    if missing_fields:
        raise ValueError(
            f"Missing required evidence fields: "
            f"{sorted(missing_fields)}"
        )

    if not evidence["case_id"]:
        raise ValueError("case_id cannot be empty.")

    if not evidence["filename"]:
        raise ValueError("filename cannot be empty.")

    if not evidence["sha256"]:
        raise ValueError("sha256 cannot be empty.")

    if len(evidence["sha256"]) != 64:
        raise ValueError("sha256 must contain 64 hexadecimal characters.")

    if not isinstance(evidence["size_bytes"], int):
        raise ValueError("size_bytes must be an integer.")


def send_evidence_to_backend(
    evidence: dict[str, Any],
    backend_url: str = "http://127.0.0.1:8000",
) -> dict[str, Any]:
    """
    Send evidence metadata to the ForensiX Backend.

    Args:
        evidence: Evidence metadata produced by Tejas's
            evidence-processing module.
        backend_url: Base URL of the running backend.

    Returns:
        Backend JSON response.

    Raises:
        ValueError: If the evidence payload is invalid.
        requests.RequestException: If the backend cannot be reached.
    """

    validate_evidence_payload(evidence)

    response = requests.post(
        f"{backend_url}/api/evidence",
        json=evidence,
        timeout=10,
    )

    response.raise_for_status()

    return response.json()