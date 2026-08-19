import pytest

from forensic.integration import validate_evidence_payload


def valid_evidence():
    return {
        "case_id": "CASE-001",
        "filename": "test_evidence.txt",
        "file_path": "evidence/CASE-001/test_evidence.txt",
        "sha256": "a" * 64,
        "size_bytes": 100,
        "artifact_type": "TEXT",
        "source": "evidence_processing",
    }


def test_valid_evidence_payload():
    evidence = valid_evidence()

    # Should not raise an exception.
    validate_evidence_payload(evidence)


def test_missing_required_field():
    evidence = valid_evidence()
    del evidence["sha256"]

    with pytest.raises(ValueError):
        validate_evidence_payload(evidence)


def test_invalid_sha256_length():
    evidence = valid_evidence()
    evidence["sha256"] = "abc"

    with pytest.raises(ValueError):
        validate_evidence_payload(evidence)


def test_invalid_size():
    evidence = valid_evidence()
    evidence["size_bytes"] = "100"

    with pytest.raises(ValueError):
        validate_evidence_payload(evidence)