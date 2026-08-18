"""
Schemas module for forensic analysis.

Defines data structures and validation schemas for forensic data.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any


@dataclass
class FileMetadata:
    """Metadata for a file in forensic analysis."""

    name: str
    path: str
    size: int
    created: datetime
    modified: datetime
    accessed: datetime
    permissions: str = ""
    owner: str = ""
    hash_md5: Optional[str] = None
    hash_sha256: Optional[str] = None

    def __post_init__(self):
        """Validate file metadata."""
        if self.size < 0:
            raise ValueError("File size cannot be negative")


@dataclass
class ProcessExecution:
    """Process execution record for forensic analysis."""

    process_id: int
    process_name: str
    executable_path: str
    start_time: datetime
    end_time: Optional[datetime] = None
    parent_process_id: Optional[int] = None
    command_line: str = ""
    user: str = ""
    environment_variables: Dict[str, str] = field(default_factory=dict)

    @property
    def duration_seconds(self) -> Optional[float]:
        """Calculate process duration in seconds."""
        if self.end_time is None:
            return None
        return (self.end_time - self.start_time).total_seconds()


@dataclass
class NetworkConnection:
    """Network connection record for forensic analysis."""

    timestamp: datetime
    source_ip: str
    source_port: int
    destination_ip: str
    destination_port: int
    protocol: str
    process_id: int
    process_name: str
    bytes_sent: int = 0
    bytes_received: int = 0
    connection_state: str = "ESTABLISHED"


@dataclass
class ForensicData:
    """Container for forensic analysis data."""

    case_name: str
    examination_date: datetime
    examiner: str
    files: List[FileMetadata] = field(default_factory=list)
    processes: List[ProcessExecution] = field(default_factory=list)
    network_connections: List[NetworkConnection] = field(default_factory=list)
    notes: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def add_file(self, file: FileMetadata) -> None:
        """Add a file to forensic data."""
        self.files.append(file)

    def add_process(self, process: ProcessExecution) -> None:
        """Add a process to forensic data."""
        self.processes.append(process)

    def add_network_connection(self, connection: NetworkConnection) -> None:
        """Add a network connection to forensic data."""
        self.network_connections.append(connection)

    def summary(self) -> Dict[str, int]:
        """Get summary statistics of forensic data."""
        return {
            "total_files": len(self.files),
            "total_processes": len(self.processes),
            "total_connections": len(self.network_connections),
        }
