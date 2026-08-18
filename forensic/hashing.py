"""
Hashing module for forensic analysis.

Provides utilities for hash computation, verification, and analysis
of digital evidence and data artifacts.
"""

import hashlib
from typing import Dict, List, Optional
from pathlib import Path


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

        Args:
            filepath: Path to the file

        Returns:
            Hexadecimal hash string
        """
        hash_obj = hashlib.new(self.algorithm)
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_obj.update(chunk)
        return hash_obj.hexdigest()

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
