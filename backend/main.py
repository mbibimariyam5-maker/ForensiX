from datetime import datetime
import json

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from backend.database import (
    initialize_database,
    create_case,
    get_all_cases,
    get_case,
    create_evidence,
    get_case_evidence,
    create_finding,
    get_case_findings
)

from backend.schemas import EvidenceCreate, FindingCreate
from backend.ai_adapter import explain_finding


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
# STARTUP
# =========================================================

@app.on_event("startup")
def startup():
    initialize_database()


# =========================================================
# BASIC APIs
# =========================================================

@app.get("/")
def home():
    return {
        "project": "ForensiX AI",
        "role": "Backend API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================================================
# CASE APIs
# =========================================================

@app.post("/api/cases")
def create_new_case(case: CaseCreate):

    existing_case = get_case(case.case_id)

    if existing_case is not None:
        raise HTTPException(
            status_code=409,
            detail="Case ID already exists"
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
def get_case_details(case_id: str):

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

    existing_findings = get_case_findings(finding.case_id)

    for existing_finding in existing_findings:
        if existing_finding["finding_id"] == finding.finding_id:
            raise HTTPException(
                status_code=409,
                detail="Finding ID already exists"
            )

    reasons_json = json.dumps(finding.reasons)

    create_finding(
        finding_id=finding.finding_id,
        case_id=finding.case_id,
        artifact=finding.artifact,
        finding_type=finding.type,
        severity=finding.severity,
        score=finding.score,
        timestamp=finding.timestamp,
        reasons=reasons_json,
        source=finding.source
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
            "source": finding.source
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
            finding["reasons"] = json.loads(finding["reasons"])
        except (json.JSONDecodeError, TypeError):
            finding["reasons"] = []

    return {
        "status": "success",
        "case_id": case_id,
        "count": len(findings),
        "findings": findings
    }


# =========================================================
# AI EXPLANATION API
# =========================================================

@app.post("/api/ai/explain")
def explain_finding_api(finding: FindingCreate):

    finding_data = {
        "finding_id": finding.finding_id,
        "artifact": finding.artifact,
        "type": finding.type,
        "severity": finding.severity,
        "score": finding.score,
        "timestamp": finding.timestamp,
        "reasons": finding.reasons,
        "source": finding.source
    }

    try:
        explanation = explain_finding(finding_data)

        return {
            "status": "success",
            "finding_id": finding.finding_id,
            "explanation": explanation
        }

    except RuntimeError as error:
        raise HTTPException(
            status_code=502,
            detail=str(error)
        )