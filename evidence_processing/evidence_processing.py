import hashlib
import json
import mimetypes
from pathlib import Path


def calculate_sha256(file_path):
    """Calculate the SHA-256 hash of a file."""
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:
        while chunk := file.read(8192):
            sha256.update(chunk)

    return sha256.hexdigest()


def get_artifact_type(file_path):
    """Determine artifact type from file extension."""
    extension = Path(file_path).suffix.lower()

    artifact_types = {
        ".exe": "EXECUTABLE",
        ".dll": "EXECUTABLE",
        ".bin": "BINARY",
        ".log": "LOG",
        ".txt": "TEXT",
        ".csv": "CSV",
        ".json": "JSON",
        ".zip": "ARCHIVE",
        ".rar": "ARCHIVE",
        ".7z": "ARCHIVE",
        ".pdf": "DOCUMENT",
        ".doc": "DOCUMENT",
        ".docx": "DOCUMENT",
        ".xls": "DOCUMENT",
        ".xlsx": "DOCUMENT",
        ".jpg": "IMAGE",
        ".jpeg": "IMAGE",
        ".png": "IMAGE",
    }

    return artifact_types.get(extension, "UNKNOWN")


def process_evidence(file_path, case_id):
    """Process an evidence artifact and create the backend JSON payload."""

    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(f"Evidence file not found: {file_path}")

    sha256 = calculate_sha256(path)
    size_bytes = path.stat().st_size
    artifact_type = get_artifact_type(path)

    evidence = {
        "case_id": case_id,
        "filename": path.name,
        "file_path": str(path),
        "sha256": sha256,
        "size_bytes": size_bytes,
        "artifact_type": artifact_type,
        "source": "evidence_processing"
    }

    return evidence


if __name__ == "__main__":

    # Change this to your actual evidence file
    evidence_file = "test_evidence.txt"

    # Case ID provided by the investigation
    case_id = "CASE-001"

    try:
        result = process_evidence(evidence_file, case_id)

        print("\nProcessed Evidence:")
        print(json.dumps(result, indent=4))

    except FileNotFoundError as error:
        print(f"Error: {error}")