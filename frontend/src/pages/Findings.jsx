import { useEffect, useState } from "react";
import { getCases, getCaseFindings } from "../services/api";

function Findings() {
  const [filter, setFilter] = useState("ALL");
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFindings() {
      try {
        setLoading(true);
        setError("");

        const casesResponse = await getCases();
        const cases = casesResponse.cases || [];

        if (cases.length === 0) {
          setCaseData(null);
          setFindings([]);
          return;
        }

        const currentCase = cases[0];
        setCaseData(currentCase);

        const findingsResponse = await getCaseFindings(
          currentCase.case_id
        );

        setFindings(findingsResponse.findings || []);
      } catch (err) {
        console.error("Findings API error:", err);
        setError(err.message || "Failed to load findings.");
      } finally {
        setLoading(false);
      }
    }

    loadFindings();
  }, []);

  const filters = [
    "ALL",
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW",
  ];

  const filteredFindings =
    filter === "ALL"
      ? findings
      : findings.filter(
          (finding) => finding.severity === filter
        );

  const criticalCount = findings.filter(
    (finding) => finding.severity === "CRITICAL"
  ).length;

  const highCount = findings.filter(
    (finding) => finding.severity === "HIGH"
  ).length;

  const averageScore =
    findings.length > 0
      ? Math.round(
          findings.reduce(
            (total, finding) =>
              total + (Number(finding.score) || 0),
            0
          ) / findings.length
        )
      : 0;

  function formatTimestamp(timestamp) {
    if (!timestamp) {
      return "--";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function getExplanation(finding) {
    if (finding.explanation) {
      return finding.explanation;
    }

    if (finding.reasons && finding.reasons.length > 0) {
      return finding.reasons.join(". ") + ".";
    }

    return "No explanation is available for this finding yet.";
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Findings</h1>
            <p>Loading forensic findings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Findings</h1>
            <p>Unable to load findings.</p>
          </div>
        </div>

        <div className="section-card">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Findings</h1>
            <p>No investigation case is available.</p>
          </div>
        </div>

        <div className="section-card">
          <p>
            Create a case in the backend before viewing findings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">

        <div>
          <h1>Findings</h1>

          <p>
            Review detected forensic findings and investigation indicators.
          </p>
        </div>

        <div className="case-info">
          <span>CASE</span>
          <strong>{caseData.case_id}</strong>
        </div>

      </div>


      {/* SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Findings</h3>
          <div className="stat-value">
            {findings.length}
          </div>
          <small>Detected findings</small>
        </div>

        <div className="stat-card">
          <h3>Critical</h3>
          <div className="stat-value">
            {String(criticalCount).padStart(2, "0")}
          </div>
          <small>Immediate review</small>
        </div>

        <div className="stat-card">
          <h3>High</h3>
          <div className="stat-value">
            {String(highCount).padStart(2, "0")}
          </div>
          <small>Requires attention</small>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="stat-value">
            {findings.length > 0 ? averageScore : "--"}
          </div>
          <small>Across findings</small>
        </div>

      </div>


      {/* FINDINGS CONTAINER */}
      <div className="section-card">

        {/* HEADER */}
        <div className="findings-page-header">

          <div>
            <h2>Detected Findings</h2>

            <span>
              Showing {filteredFindings.length} findings
            </span>
          </div>


          {/* FILTERS */}
          <div className="filter-container">

            {filters.map((item) => (
              <button
                key={item}
                className={`filter-button ${
                  filter === item ? "selected" : ""
                }`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}

          </div>

        </div>


        {/* FINDINGS LIST */}
        <div className="findings-page-list">

          {filteredFindings.map((finding) => (

            <div
              className={`finding-large-card ${
                selectedFinding?.finding_id === finding.finding_id
                  ? "finding-selected"
                  : ""
              }`}
              key={finding.finding_id}
              onClick={() => setSelectedFinding(finding)}
            >

              {/* TOP */}
              <div className="finding-large-top">

                <div className="finding-title">

                  <span
                    className={`severity-badge ${
                      finding.severity?.toLowerCase() || ""
                    }`}
                  >
                    {finding.severity || "UNKNOWN"}
                  </span>

                  <div>
                    <h3>
                      {finding.type || "UNKNOWN"}
                    </h3>

                    <span>
                      {finding.finding_id}
                    </span>
                  </div>

                </div>


                <div className="score-box">

                  <strong>
                    {finding.score ?? "--"}
                  </strong>

                  <span>
                    SCORE
                  </span>

                </div>

              </div>


              {/* DETAILS */}
              <div className="finding-details">

                <div>
                  <span>ARTIFACT</span>
                  <strong>
                    {finding.artifact || "--"}
                  </strong>
                </div>

                <div>
                  <span>SOURCE</span>
                  <strong>
                    {finding.source || "--"}
                  </strong>
                </div>

                <div>
                  <span>TIMESTAMP</span>
                  <strong>
                    {formatTimestamp(finding.timestamp)}
                  </strong>
                </div>

              </div>


              {/* EXPLANATION */}
              <div className="finding-explanation">

                <span>EXPLANATION</span>

                <p>
                  {getExplanation(finding)}
                </p>

              </div>


              {/* CLICK INDICATOR */}
              <div className="finding-click-hint">
                Click to view investigation details →
              </div>

            </div>

          ))}


          {filteredFindings.length === 0 && (

            <div className="no-findings">
              No findings available for this severity.
            </div>

          )}

        </div>

      </div>


      {/* NOTE */}
      <div className="investigation-note">

        <strong>Investigator Note:</strong>{" "}
        Findings are detection results that require investigator
        interpretation. A high score does not independently establish
        malicious activity.

      </div>


      {/* FINDING DETAILS PANEL */}
      {selectedFinding && (

        <div className="finding-overlay">

          <div className="finding-details-panel">

            {/* PANEL HEADER */}
            <div className="details-panel-header">

              <div>
                <span className="panel-label">
                  FINDING DETAILS
                </span>

                <h2>
                  {selectedFinding.type || "UNKNOWN"}
                </h2>

                <span className="panel-id">
                  {selectedFinding.finding_id}
                </span>
              </div>

              <button
                className="close-details-button"
                onClick={() => setSelectedFinding(null)}
              >
                ×
              </button>

            </div>


            {/* SEVERITY + SCORE */}
            <div className="details-summary">

              <div>
                <span>SEVERITY</span>

                <strong
                  className={`panel-severity ${
                    selectedFinding.severity?.toLowerCase() || ""
                  }`}
                >
                  {selectedFinding.severity || "UNKNOWN"}
                </strong>
              </div>


              <div>
                <span>DETECTION SCORE</span>

                <strong className="panel-score">
                  {selectedFinding.score ?? "--"}
                </strong>
              </div>

            </div>


            {/* INFORMATION */}
            <div className="details-section">

              <h3>
                Finding Information
              </h3>

              <div className="details-grid">

                <div>
                  <span>ARTIFACT</span>
                  <strong>
                    {selectedFinding.artifact || "--"}
                  </strong>
                </div>

                <div>
                  <span>SOURCE</span>
                  <strong>
                    {selectedFinding.source || "--"}
                  </strong>
                </div>

                <div>
                  <span>TIMESTAMP</span>
                  <strong>
                    {formatTimestamp(selectedFinding.timestamp)}
                  </strong>
                </div>

                <div>
                  <span>FINDING ID</span>
                  <strong>
                    {selectedFinding.finding_id}
                  </strong>
                </div>

              </div>

            </div>


            {/* EXPLANATION */}
            <div className="details-section">

              <h3>
                Detection Explanation
              </h3>

              <div className="panel-explanation">

                {getExplanation(selectedFinding)}

              </div>

            </div>


            {/* REASONS */}
            <div className="details-section">

              <h3>
                Detection Reasons
              </h3>

              <div className="reason-list">

                {selectedFinding.reasons &&
                selectedFinding.reasons.length > 0 ? (
                  selectedFinding.reasons.map(
                    (reason, index) => (

                      <div
                        className="reason-item"
                        key={index}
                      >
                        <span>✓</span>

                        <p>
                          {reason}
                        </p>
                      </div>

                    )
                  )
                ) : (
                  <div className="reason-item">
                    <span>—</span>

                    <p>
                      No detection reasons were provided by
                      the backend.
                    </p>
                  </div>
                )}

              </div>

            </div>


            {/* INVESTIGATOR NOTE */}
            <div className="panel-investigator-note">

              <strong>
                Investigator Guidance
              </strong>

              <p>
                This finding is a detection result generated from
                available evidence. It should be correlated with
                other forensic artifacts before drawing conclusions.
              </p>

            </div>


            {/* CLOSE */}
            <button
              className="panel-close-button"
              onClick={() => setSelectedFinding(null)}
            >
              Close Details
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Findings;