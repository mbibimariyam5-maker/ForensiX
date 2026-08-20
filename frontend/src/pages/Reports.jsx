import { useEffect, useState } from "react";
import {
  getCases,
  getCaseEvidence,
  getCaseFindings,
  getCaseTimeline,
  verifyEvidence,
  exportCaseReportPDF,
} from "../services/api";

function Reports() {
  const [reportStatus, setReportStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [findings, setFindings] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [verificationResults, setVerificationResults] = useState([]);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        setError("");

        const casesResponse = await getCases();
        const cases = casesResponse.cases || [];

        if (cases.length === 0) {
          setError("No investigation case found.");
          setLoading(false);
          return;
        }

        const currentCase = cases[0];

        setCaseData(currentCase);

        const [
          evidenceResponse,
          findingsResponse,
          timelineResponse,
        ] = await Promise.all([
          getCaseEvidence(currentCase.case_id),
          getCaseFindings(currentCase.case_id),
          getCaseTimeline(currentCase.case_id),
        ]);

        const evidenceItems = evidenceResponse.evidence || [];

        setEvidence(evidenceItems);
        setFindings(findingsResponse.findings || []);
        setTimelineEvents(timelineResponse.events || []);

        const verificationResponses = await Promise.all(
          evidenceItems.map(async (item) => {
            try {
              const response = await verifyEvidence(item.id);

              return response.verification;
            } catch (err) {
              console.error(
                `Failed to verify evidence ${item.id}:`,
                err
              );

              return {
                evidence_id: item.id,
                verified: false,
                status: "ERROR",
                message:
                  "Verification could not be completed.",
              };
            }
          })
        );

        setVerificationResults(verificationResponses);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load report data:", err);

        setError(
          "Failed to load report data from the backend."
        );

        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const totalEvidence = evidence.length;
  const totalFindings = findings.length;

  const verifiedEvidence = verificationResults.filter(
    (result) => result?.verified === true
  ).length;

  const verificationIssues = verificationResults.filter(
    (result) => result?.verified !== true
  ).length;

  const recordedHashes = evidence.filter(
    (item) => item.sha256
  ).length;

  const integrityStatus =
    totalEvidence === 0
      ? "NO EVIDENCE"
      : verificationResults.length < totalEvidence
        ? "VERIFICATION PENDING"
        : verifiedEvidence === totalEvidence
          ? "VERIFIED"
          : verifiedEvidence > 0
            ? "PARTIAL"
            : "FAILED";

  const criticalFindings = findings.filter(
    (finding) =>
      String(finding.severity || "").toUpperCase() === "CRITICAL"
  ).length;

  const highFindings = findings.filter(
    (finding) =>
      String(finding.severity || "").toUpperCase() === "HIGH"
  ).length;

  const mediumFindings = findings.filter(
    (finding) =>
      String(finding.severity || "").toUpperCase() === "MEDIUM"
  ).length;

  const lowFindings = findings.filter(
    (finding) =>
      String(finding.severity || "").toUpperCase() === "LOW"
  ).length;

  const highCriticalFindings =
    criticalFindings + highFindings;

  const investigationPriority =
    findings.length > 0
      ? Math.round(
          findings.reduce(
            (total, finding) =>
              total + Number(finding.score || 0),
            0
          ) / findings.length
        )
      : 0;

  const handleGenerate = () => {
    setReportStatus("Report generated successfully");
  };

  const handleJSON = () => {
    if (!caseData) {
      setReportStatus("No case data available");
      return;
    }

    const reportData = {
      case_id: caseData.case_id,
      case_name: caseData.case_name,
      description: caseData.description,
      status: caseData.status,

      statistics: {
        total_evidence: totalEvidence,
        findings: totalFindings,
        critical_findings: criticalFindings,
        high_findings: highFindings,
        medium_findings: mediumFindings,
        low_findings: lowFindings,
        investigation_priority: investigationPriority,
        evidence_integrity: integrityStatus,
        verified_evidence: verifiedEvidence,
        verification_issues: verificationIssues,
        timeline_events: timelineEvents.length,
      },

      evidence,
      verification_results: verificationResults,
      findings,
      timeline: timelineEvents,

      generated_by: "FORENSIX",
      report_type: "DIGITAL FORENSICS",
    };

    const blob = new Blob(
      [JSON.stringify(reportData, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${caseData.case_id}-report.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setReportStatus("JSON report exported");
  };

  const handlePDF = async () => {
    if (!caseData) {
      setReportStatus("No case data available");
      return;
    }

    try {
      setExportingPDF(true);
      setReportStatus("");

      await exportCaseReportPDF(caseData.case_id);

      setReportStatus("PDF report exported successfully");
    } catch (err) {
      console.error("Failed to export PDF:", err);

      setReportStatus(
        err.message || "Failed to export PDF report"
      );
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="report-status">
          Loading investigation report data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="report-status">
          {error}
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="reports-page">
        <div className="report-status">
          No investigation case available.
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">

      {/* HEADER */}

      <div className="reports-header">

        <div>

          <div className="reports-label">
            FORENSIC REPORTING
          </div>

          <h1>
            Investigation Reports
          </h1>

          <p>
            Generate and export a structured forensic investigation report.
          </p>

        </div>

        <div className="reports-case">

          <span>
            CASE
          </span>

          <strong>
            {caseData.case_id}
          </strong>

        </div>

      </div>


      {/* REPORT STATUS */}

      {reportStatus && (

        <div className="report-status">

          <span>
            ✓
          </span>

          {reportStatus}

        </div>

      )}


      {/* CASE OVERVIEW */}

      <div className="report-overview">

        <div className="report-overview-main">

          <div className="report-overview-title">

            <span>
              INVESTIGATION REPORT
            </span>

            <h2>
              {caseData.case_id}
            </h2>

            <p>
              {caseData.case_name}
            </p>

          </div>

          <div className="report-risk">

            <span>
              INVESTIGATION PRIORITY
            </span>

            <strong>
              {investigationPriority}
            </strong>

            <small>
              {investigationPriority >= 70
                ? "HIGH PRIORITY"
                : investigationPriority >= 40
                  ? "MEDIUM PRIORITY"
                  : "LOW PRIORITY"}
            </small>

          </div>

        </div>

        <div className="report-meta">

          <div>
            <span>REPORT STATUS</span>
            <strong>READY</strong>
          </div>

          <div>
            <span>EVIDENCE STATUS</span>
            <strong>
              {integrityStatus}
            </strong>
          </div>

          <div>
            <span>CASE TYPE</span>
            <strong>
              DIGITAL FORENSICS
            </strong>
          </div>

          <div>
            <span>GENERATED BY</span>
            <strong>
              FORENSIX
            </strong>
          </div>

        </div>

      </div>


      {/* STATISTICS */}

      <div className="report-stats">

        <div className="report-stat">

          <span>
            TOTAL EVIDENCE
          </span>

          <strong>
            {totalEvidence}
          </strong>

          <small>
            Collected items
          </small>

        </div>

        <div className="report-stat">

          <span>
            ARTIFACTS
          </span>

          <strong>
            {totalEvidence}
          </strong>

          <small>
            Available evidence records
          </small>

        </div>

        <div className="report-stat">

          <span>
            FINDINGS
          </span>

          <strong>
            {totalFindings}
          </strong>

          <small>
            Detection results
          </small>

        </div>

        <div className="report-stat">

          <span>
            HIGH / CRITICAL
          </span>

          <strong className="report-danger">
            {String(highCriticalFindings).padStart(2, "0")}
          </strong>

          <small>
            Requires attention
          </small>

        </div>

      </div>


      {/* REPORT CONTENT */}

      <div className="report-content-grid">

        {/* FINDINGS SUMMARY */}

        <section className="report-section">

          <div className="report-section-header">

            <div>

              <span>
                FINDINGS ANALYSIS
              </span>

              <h2>
                Detection Summary
              </h2>

            </div>

          </div>

          <div className="finding-summary-row">

            <div>
              <span className="summary-dot critical"></span>

              <div>
                <strong>Critical</strong>
                <small>{criticalFindings} findings</small>
              </div>

              <b>
                {String(criticalFindings).padStart(2, "0")}
              </b>
            </div>

            <div>
              <span className="summary-dot high"></span>

              <div>
                <strong>High</strong>
                <small>{highFindings} findings</small>
              </div>

              <b>
                {String(highFindings).padStart(2, "0")}
              </b>
            </div>

            <div>
              <span className="summary-dot medium"></span>

              <div>
                <strong>Medium</strong>
                <small>{mediumFindings} findings</small>
              </div>

              <b>
                {String(mediumFindings).padStart(2, "0")}
              </b>
            </div>

            <div>
              <span className="summary-dot low"></span>

              <div>
                <strong>Low</strong>
                <small>{lowFindings} findings</small>
              </div>

              <b>
                {String(lowFindings).padStart(2, "0")}
              </b>
            </div>

          </div>

        </section>


        {/* INTEGRITY */}

        <section className="report-section">

          <div className="report-section-header">

            <div>

              <span>
                EVIDENCE VALIDATION
              </span>

              <h2>
                Integrity Status
              </h2>

            </div>

          </div>

          <div className="integrity-report">

            <div className="integrity-icon">
              {integrityStatus === "VERIFIED" ? "✓" : "!"}
            </div>

            <div>

              <strong>
                {integrityStatus}
              </strong>

              <p>
                {totalEvidence === 0
                  ? "No evidence is currently available for integrity verification."
                  : integrityStatus === "VERIFIED"
                    ? `All ${totalEvidence} evidence item(s) passed SHA-256 integrity verification.`
                    : `${verifiedEvidence} of ${totalEvidence} evidence item(s) passed SHA-256 integrity verification. ${verificationIssues} item(s) require attention because their stored files could not be successfully verified.`}
              </p>

            </div>

          </div>


          {/* MAIN INTEGRITY SUMMARY */}

          <div className="integrity-details">

            <div>
              <span>COLLECTED</span>
              <strong>
                {totalEvidence}
              </strong>
            </div>

            <div>
              <span>HASH RECORDED</span>
              <strong>
                {recordedHashes}
              </strong>
            </div>

            <div>
              <span>VERIFIED</span>
              <strong>
                {String(verifiedEvidence).padStart(2, "0")}
              </strong>
            </div>

          </div>


          {/* VERIFICATION DETAILS */}

          <div className="verification-report-list">

            {verificationResults.map((result) => (

              <div
                className="verification-report-item"
                key={result.evidence_id}
              >

                <div>

                  <span>
                    EVIDENCE #{result.evidence_id}
                  </span>

                  <strong>
                    {result.status}
                  </strong>

                </div>

                <p>
                  {result.message}
                </p>

              </div>

            ))}

          </div>

        </section>

      </div>


      {/* REPORT SCOPE */}

      <section className="report-scope">

        <div>

          <span>
            REPORT SCOPE
          </span>

          <h2>
            Included Investigation Data
          </h2>

        </div>

        <div className="scope-items">

          <div>
            <span>✓</span>
            Evidence metadata
          </div>

          <div>
            <span>✓</span>
            Artifact analysis
          </div>

          <div>
            <span>✓</span>
            Detection findings
          </div>

          <div>
            <span>✓</span>
            Investigation timeline
          </div>

          <div>
            <span>✓</span>
            AI explanations
          </div>

          <div>
            <span>
              {integrityStatus === "VERIFIED" ? "✓" : "!"}
            </span>
            Integrity verification: {integrityStatus}
          </div>

        </div>

      </section>


      {/* ACTIONS */}

      <section className="report-actions">

        <div>

          <span>
            REPORT GENERATION
          </span>

          <h2>
            Export Investigation Report
          </h2>

          <p>
            Generate a structured report containing the
            current investigation data.
          </p>

        </div>

        <div className="report-buttons">

          <button
            className="report-primary-button"
            onClick={handleGenerate}
          >
            Generate Report
          </button>

          <button
            className="report-secondary-button"
            onClick={handleJSON}
          >
            Export JSON
          </button>

          <button
            className="report-secondary-button"
            onClick={handlePDF}
            disabled={exportingPDF}
          >
            {exportingPDF
              ? "Exporting PDF..."
              : "Export PDF"}
          </button>

        </div>

      </section>


      {/* NOTE */}

      <div className="report-note">

        <strong>
          Report Note:
        </strong>

        {" "}
        Generated reports represent the current investigation
        state. AI-generated explanations are decision-support
        information and should be validated against the underlying
        forensic evidence. SHA-256 integrity status is based on
        live verification of the stored evidence files.

      </div>

    </div>
  );
}

export default Reports;