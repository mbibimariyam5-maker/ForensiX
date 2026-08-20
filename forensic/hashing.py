"""
Hashing module for forensic analysis.

Provides utilities for hash computation, verification, and analysis
of digital evidence and data artifacts.
"""

import hashlib
import json
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

from backend.database import create_timeline_event, get_case_evidence


class HashAnalyzer:
    """Analyze and manage cryptographic hashes for forensic purposes."""

    SUPPORTED_ALGORITHMS = ["md5", "sha1", "sha256", "sha512"]

    def __init__(self, algorithm: str = "sha256"):
        """
        Initialize HashAnalyzer.

        Args:
            algorithm: Hash algorithm to use (default: sha256)

        Raises:
            ValueError: If algorithm is not supported
        """
        if algorithm not in self.SUPPORTED_ALGORITHMS:
            raise ValueError(
                f"Algorithm '{algorithm}' not supported. "
                f"Supported: {', '.join(self.SUPPORTED_ALGORITHMS)}"
            )
        self.algorithm = algorithm

    def hash_file(self, filepath: Path) -> str:
        """
        Compute hash of a file.

        When a SHA-256 hash is calculated for a registered evidence file,
        record the integrity verification result in the existing timeline.

        Args:
            filepath: Path to the file

        Returns:
            Hexadecimal hash string
        """
        hash_obj = hashlib.new(self.algorithm)
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_obj.update(chunk)
        calculated_hash = hash_obj.hexdigest()

        if self.algorithm == "sha256":
            self._record_evidence_verification(filepath, calculated_hash)

        return calculated_hash

    def _record_evidence_verification(
        self,
        filepath: Path,
        calculated_hash: str
    ) -> None:
        """Record verification of a registered evidence file in the timeline."""
        try:
            project_root = Path(__file__).resolve().parent.parent
            absolute_path = filepath.resolve()
            relative_path = absolute_path.relative_to(project_root)
            relative_path_text = str(relative_path).replace("/", "\\")
            case_id = absolute_path.parent.name

            evidence_items = get_case_evidence(case_id)
            evidence = next(
                (
                    item
                    for item in evidence_items
                    if str(item.get("file_path", "")).replace("/", "\\")
                    == relative_path_text
                ),
                None
            )

            if evidence is None:
                return

            recorded_hash = evidence.get("sha256", "")
            verified = calculated_hash.lower() == recorded_hash.lower()
            verification_status = "VERIFIED" if verified else "MISMATCH"

            create_timeline_event(
                case_id=case_id,
                timestamp=datetime.now().isoformat(),
                event_type="other",
                source="chain_of_custody",
                description=(
                    f"Chain of custody: Integrity verification "
                    f"{verification_status} for {evidence['filename']}"
                ),
                metadata=json.dumps({
                    "case_id": case_id,
                    "evidence_id": evidence["id"],
                    "filename": evidence["filename"],
                    "custody_action": "INTEGRITY_VERIFICATION",
                    "verification_status": verification_status,
                    "recorded_sha256": recorded_hash,
                    "calculated_sha256": calculated_hash,
                    "file_path": str(relative_path)
                })
            )

        except (OSError, ValueError, KeyError, TypeError):
            # Hash calculation itself must remain reliable even if audit logging fails.
            return

    def hash_data(self, data: bytes) -> str:
        """
        Compute hash of binary data.

        Args:
            data: Binary data to hash

        Returns:
            Hexadecimal hash string
        """
        hash_obj = hashlib.new(self.algorithm)
        hash_obj.update(data)
        return hash_obj.hexdigest()

    def verify_hash(self, data: bytes, expected_hash: str) -> bool:
        """
        Verify data matches expected hash.

        Args:
            data: Binary data to verify
            expected_hash: Expected hash value

        Returns:
            True if hash matches, False otherwise
        """
        computed_hash = self.hash_data(data)
        return computed_hash.lower() == expected_hash.lower()
