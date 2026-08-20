import { useEffect, useState } from "react";
import {
  getCases,
  getCaseEvidence,
  getCaseFindings,
  getCaseTimeline,
} from "../services/api";

function Reports() {
  const [reportStatus, setReportStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [findings, setFindings] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

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

        setEvidence(evidenceResponse.evidence || []);
        setFindings(findingsResponse.findings || []);
        setTimelineEvents(timelineResponse.events || []);

        setLoading(false);
      } catch (err) {
        console.error("Failed to load report data:", err);
        setError("Failed to load report data from the backend.");
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const totalEvidence = evidence.length;
  const totalFindings = findings.length;

  /*
   * The backend currently stores evidence SHA-256 values,
   * but the original evidence files are not available for
   * recalculation. Therefore we must not claim that the
   * evidence has been cryptographically verified.
   */
  const integrityStatus =
    totalEvidence > 0
      ? "VERIFICATION PENDING"
      : "NO EVIDENCE";

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
        timeline_events: timelineEvents.length,
      },

      evidence,
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

  const handlePDF = () => {
    setReportStatus(
      "PDF generation will be connected to the backend"
    );
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
              !
            </div>

            <div>

              <strong>
                VERIFICATION PENDING
              </strong>

              <p>
                SHA-256 values are recorded for the evidence,
                but the original evidence files are currently
                unavailable for hash recalculation.
              </p>

            </div>

          </div>


          <div className="integrity-details">

            <div>
              <span>COLLECTED</span>
              <strong>{totalEvidence}</strong>
            </div>

            <div>
              <span>HASH RECORDED</span>
              <strong>{totalEvidence}</strong>
            </div>

            <div>
              <span>VERIFIED</span>
              <strong>00</strong>
            </div>

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
            <span>!</span>
            Integrity verification pending
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
          >
            Export PDF
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
        forensic evidence. SHA-256 integrity verification remains
        pending until the original evidence files are available.

      </div>

    </div>
  );
}

export default Reports;