"""Tests for the hashing module."""

import pytest
import tempfile
from pathlib import Path
from forensic.hashing import HashAnalyzer


class TestHashAnalyzer:
    """Test cases for HashAnalyzer class."""

    def test_init_with_valid_algorithm(self):
        """Test initialization with valid algorithm."""
        analyzer = HashAnalyzer("sha256")
        assert analyzer.algorithm == "sha256"

    def test_init_with_invalid_algorithm(self):
        """Test initialization with invalid algorithm raises ValueError."""
        with pytest.raises(ValueError):
            HashAnalyzer("invalid_algo")

    def test_hash_data_sha256(self):
        """Test hashing data with SHA256."""
        analyzer = HashAnalyzer("sha256")
        data = b"test data"
        hash_result = analyzer.hash_data(data)
        assert isinstance(hash_result, str)
        assert len(hash_result) == 64  # SHA256 hex is 64 characters

    def test_hash_data_md5(self):
        """Test hashing data with MD5."""
        analyzer = HashAnalyzer("md5")
        data = b"test data"
        hash_result = analyzer.hash_data(data)
        assert isinstance(hash_result, str)
        assert len(hash_result) == 32  # MD5 hex is 32 characters

    def test_hash_file(self):
        """Test hashing a file."""
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(b"test file content")
            tmp_path = Path(tmp.name)

        try:
            analyzer = HashAnalyzer("sha256")
            file_hash = analyzer.hash_file(tmp_path)
            assert isinstance(file_hash, str)
            assert len(file_hash) == 64
        finally:
            tmp_path.unlink()

    def test_verify_hash_valid(self):
        """Test verify_hash with valid hash."""
        analyzer = HashAnalyzer("sha256")
        data = b"test data"
        hash_result = analyzer.hash_data(data)
        assert analyzer.verify_hash(data, hash_result) is True

    def test_verify_hash_invalid(self):
        """Test verify_hash with invalid hash."""
        analyzer = HashAnalyzer("sha256")
        data = b"test data"
        wrong_hash = "0" * 64
        assert analyzer.verify_hash(data, wrong_hash) is False

    def test_verify_hash_case_insensitive(self):
        """Test verify_hash is case insensitive."""
        analyzer = HashAnalyzer("sha256")
        data = b"test data"
        hash_result = analyzer.hash_data(data)
        assert analyzer.verify_hash(data, hash_result.upper()) is True
