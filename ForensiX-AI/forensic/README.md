# ForensiX-AI Forensic Module

## Overview

The `forensic` module provides core functionality for digital forensics analysis, including:

- **Hashing**: Cryptographic hash computation and verification for evidence integrity
- **Timeline Analysis**: Temporal analysis and event sequencing for timeline reconstruction
- **Data Schemas**: Structured data models for forensic artifacts

## Components

### HashAnalyzer

Compute and verify cryptographic hashes of files and data.

**Supported Algorithms**: MD5, SHA1, SHA256, SHA512

```python
from forensic.hashing import HashAnalyzer

analyzer = HashAnalyzer(algorithm="sha256")
file_hash = analyzer.hash_file("evidence.bin")
is_valid = analyzer.verify_hash(data, expected_hash)
```

### TimelineAnalyzer

Reconstruct and analyze event timelines from forensic data.

```python
from forensic.timeline import TimelineAnalyzer, TimelineEvent, EventType
from datetime import datetime

timeline = TimelineAnalyzer()
event = TimelineEvent(
    timestamp=datetime.now(),
    event_type=EventType.FILE_CREATION,
    source="filesystem",
    description="File created"
)
timeline.add_event(event)
sorted_events = timeline.get_sorted_events()
```

### Data Schemas

Structured models for forensic data:

- `FileMetadata`: File information and hashes
- `ProcessExecution`: Process execution records
- `NetworkConnection`: Network connection data
- `ForensicData`: Container for all forensic data

```python
from forensic.schemas import ForensicData, FileMetadata
from datetime import datetime

case_data = ForensicData(
    case_name="Case-001",
    examination_date=datetime.now(),
    examiner="John Doe"
)
```

## Installation

Install the package and its dependencies:

```bash
pip install -r requirements.txt
```

## Testing

Run the test suite:

```bash
pytest tests/
```
