from datetime import datetime
import json
from pathlib import Path
from io import BytesIO

from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from backend.database import (
    initialize_database,
    create_case,
    get_all_cases,
    get_case,
    create_evidence,
    get_case_evidence,
    get_evidence,
    create_finding,
    get_case_findings,
    create_timeline_event,
    get_case_timeline
)

from backend.schemas import (
    EvidenceCreate,
    FindingCreate,
    TimelineEventCreate
)

from backend.ai_adapter import explain_finding
from evidence_processing.evidence_processing import process_evidence
from forensic.hashing import HashAnalyzer


app = FastAPI(
    title="ForensiX AI",
    description="AI-Assisted Cyber Forensic Triage Platform",
    version="1.0.0"
)


# =========================================================
# CASE SCHEMA
# =========================================================

class CaseCreate(BaseModel):
    case_id: str
    case_name: str
    description: str = ""


# =========================================================
# CASE APIs
# =========================================================

@app.post("/api/cases")
def add_case(case: CaseCreate):

    existing_case = get_case(case.case_id)

    if existing_case is not None:
        raise HTTPException(
            status_code=409,
            detail="Case already exists"
        )

    created_at = datetime.now().isoformat()

    create_case(
        case_id=case.case_id,
        case_name=case.case_name,
        description=case.description,
        created_at=created_at
    )

    return {
        "status": "success",
        "message": "Case created successfully",
        "case": {
            "case_id": case.case_id,
            "case_name": case.case_name,
            "description": case.description,
            "status": "OPEN",
            "created_at": created_at
        }
    }


@app.get("/api/cases")
def list_cases():

    cases = get_all_cases()

    return {
        "status": "success",
        "count": len(cases),
        "cases": cases
    }


@app.get("/api/cases/{case_id}")
def get_single_case(case_id: str):

    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    return {
        "status": "success",
        "case": case
    }


# =========================================================
# EVIDENCE APIs
# =========================================================

@app.post("/api/evidence")
def add_evidence(evidence: EvidenceCreate):

    case = get_case(evidence.case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    created_at = datetime.now().isoformat()

    create_evidence(
        case_id=evidence.case_id,
        filename=evidence.filename,
        file_path=evidence.file_path,
        sha256=evidence.sha256,
        size_bytes=evidence.size_bytes,
        artifact_type=evidence.artifact_type,
        source=evidence.source,
        created_at=created_at
    )

    return {
        "status": "success",
        "message": "Evidence metadata stored successfully",
        "evidence": {
            "case_id": evidence.case_id,
            "filename": evidence.filename,
            "file_path": evidence.file_path,
            "sha256": evidence.sha256,
            "size_bytes": evidence.size_bytes,
            "artifact_type": evidence.artifact_type,
            "source": evidence.source,
            "created_at": created_at
        }
    }


@app.post("/api/evidence/upload")
async def upload_evidence(
    case_id: str = Form(...),
    file: UploadFile = File(...)
):

    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must have a filename"
        )

    safe_filename = Path(file.filename).name

    evidence_directory = (
        Path(__file__).resolve().parent.parent / "evidence_storage" / case_id
    )

    evidence_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    destination = evidence_directory / safe_filename

    if destination.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        destination = (
            evidence_directory
            / f"{destination.stem}_{timestamp}{destination.suffix}"
        )

    try:
        with destination.open("wb") as output_file:

            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                output_file.write(chunk)

    except Exception as exc:

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to store evidence file: {exc}"
        )

    finally:
        await file.close()

    try:
        processed_evidence = process_evidence(
            destination,
            case_id
        )

    except FileNotFoundError as exc:

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )

    except OSError as exc:

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to process evidence file: {exc}"
        )

    project_root = Path(__file__).resolve().parent.parent
    relative_path = destination.relative_to(project_root)
    processed_evidence["file_path"] = str(relative_path)
    processed_evidence["filename"] = safe_filename
    processed_evidence["source"] = "evidence_processing"

    created_at = datetime.now().isoformat()

    create_evidence(
        case_id=processed_evidence["case_id"],
        filename=processed_evidence["filename"],
        file_path=processed_evidence["file_path"],
        sha256=processed_evidence["sha256"],
        size_bytes=processed_evidence["size_bytes"],
        artifact_type=processed_evidence["artifact_type"],
        source=processed_evidence["source"],
        created_at=created_at
    )

    return {
        "status": "success",
        "message": "Evidence uploaded, processed, and registered successfully",
        "evidence": {
            "case_id": processed_evidence["case_id"],
            "filename": processed_evidence["filename"],
            "file_path": processed_evidence["file_path"],
            "sha256": processed_evidence["sha256"],
            "size_bytes": processed_evidence["size_bytes"],
            "artifact_type": processed_evidence["artifact_type"],
            "source": processed_evidence["source"],
            "created_at": created_at
        }
    }


@app.get("/api/cases/{case_id}/evidence")
def list_case_evidence(case_id: str):

    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    evidence = get_case_evidence(case_id)

    return {
        "status": "success",
        "case_id": case_id,
        "count": len(evidence),
        "evidence": evidence
    }


@app.post("/api/evidence/{evidence_id}/verify")
def verify_evidence(evidence_id: int):

    evidence = get_evidence(evidence_id)

    if evidence is None:
        raise HTTPException(
            status_code=404,
            detail="Evidence not found"
        )

    project_root = Path(__file__).resolve().parent.parent
    evidence_path = project_root / evidence["file_path"]

    if not evidence_path.is_file():
        return {
            "status": "success",
            "verification": {
                "evidence_id": evidence_id,
                "case_id": evidence["case_id"],
                "filename": evidence["filename"],
                "status": "MISSING",
                "verified": False,
                "recorded_sha256": evidence["sha256"],
                "calculated_sha256": None,
                "message": "Stored evidence file could not be found."
            }
        }

    hash_analyzer = HashAnalyzer("sha256")

    try:
        calculated_sha256 = hash_analyzer.hash_file(evidence_path)

    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read evidence file: {exc}"
        )

    recorded_sha256 = evidence["sha256"]
    verified = calculated_sha256.lower() == recorded_sha256.lower()

    verification_status = (
        "VERIFIED"
        if verified
        else "MISMATCH"
    )

    message = (
        "Evidence integrity verified successfully."
        if verified
        else "Evidence integrity check failed. The calculated SHA-256 does not match the recorded hash."
    )

    return {
        "status": "success",
        "verification": {
            "evidence_id": evidence_id,
            "case_id": evidence["case_id"],
            "filename": evidence["filename"],
            "status": verification_status,
            "verified": verified,
            "recorded_sha256": recorded_sha256,
            "calculated_sha256": calculated_sha256,
            "message": message
        }
    }


# =========================================================
# FINDINGS APIs
# =========================================================

@app.post("/api/findings")
def add_finding(finding: FindingCreate):

    case = get_case(finding.case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    created_at = datetime.now().isoformat()

    create_finding(
        finding_id=finding.finding_id,
        case_id=finding.case_id,
        artifact=finding.artifact,
        finding_type=finding.type,
        severity=finding.severity,
        score=finding.score,
        timestamp=finding.timestamp,
        reasons=json.dumps(finding.reasons),
        source=finding.source,
        created_at=created_at
    )

    return {
        "status": "success",
        "message": "Finding stored successfully",
        "finding": {
            "finding_id": finding.finding_id,
            "case_id": finding.case_id,
            "artifact": finding.artifact,
            "type": finding.type,
            "severity": finding.severity,
            "score": finding.score,
            "timestamp": finding.timestamp,
            "reasons": finding.reasons,
            "source": finding.source,
            "created_at": created_at
        }
    }


@app.get("/api/cases/{case_id}/findings")
def list_case_findings(case_id: str):

    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    findings = get_case_findings(case_id)

    for finding in findings:

        try:
            finding["reasons"] = json.loads(
                finding["reasons"]
            )

        except (
            json.JSONDecodeError,
            TypeError
        ):
            finding["reasons"] = []

    return {
        "status": "success",
        "case_id": case_id,
        "count": len(findings),
        "findings": findings
    }


# =========================================================
# TIMELINE APIs
# =========================================================

@app.post("/api/timeline")
def add_timeline_event(event: TimelineEventCreate):

    case = get_case(event.case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    metadata_json = json.dumps(event.metadata)

    create_timeline_event(
        case_id=event.case_id,
        timestamp=event.timestamp,
        event_type=event.event_type,
        source=event.source,
        description=event.description,
        metadata=metadata_json
    )

    return {
        "status": "success",
        "message": "Timeline event stored successfully",
        "event": {
            "case_id": event.case_id,
            "timestamp": event.timestamp,
            "event_type": event.event_type,
            "source": event.source,
            "description": event.description,
            "metadata": event.metadata
        }
    }


@app.get("/api/cases/{case_id}/timeline")
def list_case_timeline(case_id: str):

    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    events = get_case_timeline(case_id)

    for event in events:

        try:
            event["metadata"] = json.loads(
                event["metadata"]
            )

        except (
            json.JSONDecodeError,
            TypeError
        ):
            event["metadata"] = {}

    return {
        "status": "success",
        "case_id": case_id,
        "count": len(events),
        "events": events
    }


# =========================================================
# AI APIs
# =========================================================

@app.post("/api/ai/explain")
def explain_finding_api(finding: FindingCreate):

    try:
        return explain_finding(finding.model_dump())

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )


# =========================================================
# REPORT APIs
# =========================================================

@app.get("/api/cases/{case_id}/report/pdf")
def generate_case_report_pdf(case_id: str):

    case = get_case(case_id)

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Case not found"
        )

    evidence = get_case_evidence(case_id)
    findings = get_case_findings(case_id)
    timeline = get_case_timeline(case_id)

    buffer = BytesIO()

    pdf = canvas.Canvas(
        buffer,
        pagesize=A4
    )

    page_width, page_height = A4

    y = page_height - 50

    def add_line(text, size=10, bold=False):

        nonlocal y

        pdf.setFont(
            "Helvetica-Bold" if bold else "Helvetica",
            size
        )

        pdf.drawString(
            50,
            y,
            str(text)[:110]
        )

        y -= 18

        if y < 50:
            pdf.showPage()
            y = page_height - 50

    # -----------------------------------------------------
    # TITLE
    # -----------------------------------------------------

    add_line(
        "FORENSIX - DIGITAL FORENSICS INVESTIGATION REPORT",
        16,
        True
    )

    y -= 8

    add_line(
        f"Case ID: {case['case_id']}",
        11,
        True
    )

    add_line(
        f"Case Name: {case['case_name']}"
    )

    add_line(
        f"Status: {case.get('status', 'OPEN')}"
    )

    add_line(
        f"Generated: {datetime.now().isoformat()}"
    )

    y -= 12

    # -----------------------------------------------------
    # DESCRIPTION
    # -----------------------------------------------------

    add_line(
        "CASE DESCRIPTION",
        12,
        True
    )

    description = case.get(
        "description",
        ""
    )

    add_line(
        description or "No description available."
    )

    y -= 12

    # -----------------------------------------------------
    # EVIDENCE
    # -----------------------------------------------------

    add_line(
        "EVIDENCE",
        12,
        True
    )

    add_line(
        f"Total Evidence: {len(evidence)}"
    )

    for item in evidence:

        add_line(
            f"Evidence #{item['id']} - {item['filename']}"
        )

        add_line(
            f"Type: {item.get('artifact_type', 'UNKNOWN')}"
        )

        add_line(
            f"SHA-256: {item.get('sha256', 'N/A')}"
        )

        add_line(
            f"Size: {item.get('size_bytes', 0)} bytes"
        )

        y -= 5

    # -----------------------------------------------------
    # FINDINGS
    # -----------------------------------------------------

    add_line(
        "FINDINGS",
        12,
        True
    )

    add_line(
        f"Total Findings: {len(findings)}"
    )

    for finding in findings:

        add_line(
            f"{finding.get('finding_id', 'UNKNOWN')} - "
            f"{finding.get('type', 'UNKNOWN')}",
            10,
            True
        )

        add_line(
            f"Severity: {finding.get('severity', 'UNKNOWN')}"
        )

        add_line(
            f"Score: {finding.get('score', 0)}"
        )

        add_line(
            f"Artifact: {finding.get('artifact', 'UNKNOWN')}"
        )

        y -= 5

    # -----------------------------------------------------
    # TIMELINE
    # -----------------------------------------------------

    add_line(
        "INVESTIGATION TIMELINE",
        12,
        True
    )

    add_line(
        f"Total Timeline Events: {len(timeline)}"
    )

    for event in timeline:

        add_line(
            f"{event.get('timestamp', '')} - "
            f"{event.get('event_type', 'UNKNOWN')}"
        )

        add_line(
            event.get(
                "description",
                ""
            )
        )

        y -= 5

    # -----------------------------------------------------
    # FOOTER
    # -----------------------------------------------------

    y -= 10

    add_line(
        "FORENSIX REPORT",
        9,
        True
    )

    add_line(
        "Generated from the current investigation data."
    )

    pdf.save()

    buffer.seek(0)

    filename = (
        f"{case_id}-forensic-report.pdf"
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )


# =========================================================
# STARTUP
# =========================================================

initialize_database()
