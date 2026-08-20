import hashlib
import json
from datetime import datetime
from pathlib import Path

from backend.database import create_timeline_event
from forensic.timeline import EventType, TimelineAnalyzer, TimelineEvent


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


def _create_timeline_from_file(path, case_id, sha256, artifact_type, file_stats):
    """Create supported filesystem timeline events for an evidence file."""
    analyzer = TimelineAnalyzer()

    metadata = {
        "case_id": case_id,
        "filename": path.name,
        "sha256": sha256,
        "artifact_type": artifact_type,
        "file_path": str(path),
        "timestamp_source": "filesystem_metadata",
    }

    analyzer.add_event(
        TimelineEvent(
            timestamp=datetime.fromtimestamp(file_stats.st_ctime),
            event_type=EventType.FILE_CREATION,
            source="evidence_processing",
            description=f"Evidence file created: {path.name}",
            metadata={**metadata, "timestamp_field": "created"},
        )
    )

    analyzer.add_event(
        TimelineEvent(
            timestamp=datetime.fromtimestamp(file_stats.st_mtime),
            event_type=EventType.FILE_MODIFICATION,
            source="evidence_processing",
            description=f"Evidence file modified: {path.name}",
            metadata={**metadata, "timestamp_field": "modified"},
        )
    )

    for event in analyzer.get_sorted_events():
        create_timeline_event(
            case_id=case_id,
            timestamp=event.timestamp.isoformat(),
            event_type=event.event_type.value,
            source=event.source,
            description=event.description,
            metadata=json.dumps(event.metadata),
        )


def process_evidence(file_path, case_id):
    """Process an evidence artifact and create the backend JSON payload."""

    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(f"Evidence file not found: {file_path}")

    file_stats = path.stat()
    sha256 = calculate_sha256(path)
    size_bytes = file_stats.st_size
    artifact_type = get_artifact_type(path)

    _create_timeline_from_file(
        path,
        case_id,
        sha256,
        artifact_type,
        file_stats,
    )

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

    evidence_file = "test_evidence.txt"
    case_id = "CASE-001"

    try:
        result = process_evidence(evidence_file, case_id)

        print("\nProcessed Evidence:")
        print(json.dumps(result, indent=4))

    except FileNotFoundError as error:
        print(f"Error: {error}")