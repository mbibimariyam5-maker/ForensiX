import sqlite3
from pathlib import Path


DATABASE_DIR = Path("database")
DATABASE_FILE = DATABASE_DIR / "forensix.db"


def get_connection():
    DATABASE_DIR.mkdir(exist_ok=True)

    connection = sqlite3.connect(DATABASE_FILE)
    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    connection = get_connection()
    cursor = connection.cursor()

    # -------------------------
    # CASES TABLE
    # -------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT UNIQUE NOT NULL,
            case_name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'OPEN',
            created_at TEXT NOT NULL
        )
    """)

    # -------------------------
    # EVIDENCE TABLE
    # -------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            sha256 TEXT NOT NULL,
            size_bytes INTEGER NOT NULL,
            artifact_type TEXT NOT NULL,
            source TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases(case_id)
        )
    """)

    # -------------------------
    # FINDINGS TABLE
    # -------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS findings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            finding_id TEXT UNIQUE NOT NULL,
            case_id TEXT NOT NULL,
            artifact TEXT NOT NULL,
            type TEXT NOT NULL,
            severity TEXT NOT NULL,
            score INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            reasons TEXT NOT NULL,
            source TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases(case_id)
        )
    """)

    # -------------------------
    # TIMELINE EVENTS TABLE
    # -------------------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS timeline_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            case_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            source TEXT NOT NULL,
            description TEXT NOT NULL,
            metadata TEXT NOT NULL DEFAULT '{}',
            FOREIGN KEY (case_id) REFERENCES cases(case_id)
        )
    """)

    connection.commit()
    connection.close()


# =========================================================
# CASE FUNCTIONS
# =========================================================

def create_case(
    case_id: str,
    case_name: str,
    description: str,
    created_at: str
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO cases (
            case_id,
            case_name,
            description,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        case_id,
        case_name,
        description,
        "OPEN",
        created_at
    ))

    connection.commit()
    connection.close()


def get_all_cases():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            case_id,
            case_name,
            description,
            status,
            created_at
        FROM cases
        ORDER BY id DESC
    """)

    cases = cursor.fetchall()
    connection.close()

    return [dict(case) for case in cases]


def get_case(case_id: str):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            case_id,
            case_name,
            description,
            status,
            created_at
        FROM cases
        WHERE case_id = ?
    """, (case_id,))

    case = cursor.fetchone()
    connection.close()

    if case is None:
        return None

    return dict(case)


# =========================================================
# EVIDENCE FUNCTIONS
# =========================================================

def create_evidence(
    case_id: str,
    filename: str,
    file_path: str,
    sha256: str,
    size_bytes: int,
    artifact_type: str,
    source: str,
    created_at: str
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO evidence (
            case_id,
            filename,
            file_path,
            sha256,
            size_bytes,
            artifact_type,
            source,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        filename,
        file_path,
        sha256,
        size_bytes,
        artifact_type,
        source,
        created_at
    ))

    connection.commit()
    connection.close()


def get_case_evidence(case_id: str):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            case_id,
            filename,
            file_path,
            sha256,
            size_bytes,
            artifact_type,
            source,
            created_at
        FROM evidence
        WHERE case_id = ?
        ORDER BY id DESC
    """, (case_id,))

    evidence = cursor.fetchall()
    connection.close()

    return [dict(item) for item in evidence]


# =========================================================
# FINDINGS FUNCTIONS
# =========================================================

def create_finding(
    finding_id: str,
    case_id: str,
    artifact: str,
    finding_type: str,
    severity: str,
    score: int,
    timestamp: str,
    reasons: str,
    source: str
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO findings (
            finding_id,
            case_id,
            artifact,
            type,
            severity,
            score,
            timestamp,
            reasons,
            source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        finding_id,
        case_id,
        artifact,
        finding_type,
        severity,
        score,
        timestamp,
        reasons,
        source
    ))

    connection.commit()
    connection.close()


def get_case_findings(case_id: str):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            finding_id,
            case_id,
            artifact,
            type,
            severity,
            score,
            timestamp,
            reasons,
            source
        FROM findings
        WHERE case_id = ?
        ORDER BY id DESC
    """, (case_id,))

    findings = cursor.fetchall()
    connection.close()

    return [dict(finding) for finding in findings]


# =========================================================
# TIMELINE FUNCTIONS
# =========================================================

def create_timeline_event(
    case_id: str,
    timestamp: str,
    event_type: str,
    source: str,
    description: str,
    metadata: str
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO timeline_events (
            case_id,
            timestamp,
            event_type,
            source,
            description,
            metadata
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        case_id,
        timestamp,
        event_type,
        source,
        description,
        metadata
    ))

    connection.commit()
    connection.close()


def get_case_timeline(case_id: str):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            case_id,
            timestamp,
            event_type,
            source,
            description,
            metadata
        FROM timeline_events
        WHERE case_id = ?
        ORDER BY timestamp ASC, id ASC
    """, (case_id,))

    events = cursor.fetchall()
    connection.close()

    return [dict(event) for event in events]

def delete_evidence(evidence_id: int):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM evidence
        WHERE id = ?
    """, (evidence_id,))

    deleted = cursor.rowcount

    connection.commit()
    connection.close()

    return deleted