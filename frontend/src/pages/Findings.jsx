import { useState } from "react";

function Findings() {
  const [filter, setFilter] = useState("ALL");
  const [selectedFinding, setSelectedFinding] = useState(null);

  const findings = [
    {
      id: "F-001",
      severity: "HIGH",
      type: "MULTIPLE_FAILED_LOGINS",
      artifact: "authentication.log",
      source: "Authentication Logs",
      timestamp: "18 Aug 2026 • 10:24:12",
      score: 85,
      explanation:
        "Multiple failed authentication attempts were detected within a short period.",
      reasons: [
        "Repeated authentication failures",
        "Multiple attempts within a short time window",
        "Activity requires investigator review",
      ],
    },
    {
      id: "F-002",
      severity: "CRITICAL",
      type: "IOC_MATCH",
      artifact: "suspicious_file.exe",
      source: "File Analysis",
      timestamp: "18 Aug 2026 • 10:18:43",
      score: 94,
      explanation:
        "The analyzed artifact matched a configured indicator of compromise.",
      reasons: [
        "Configured IOC match detected",
        "Artifact identified during file analysis",
        "High confidence detection result",
      ],
    },
    {
      id: "F-003",
      severity: "MEDIUM",
      type: "SUSPICIOUS_EVENT",
      artifact: "system.log",
      source: "System Logs",
      timestamp: "18 Aug 2026 • 09:52:31",
      score: 59,
      explanation:
        "An unusual system event was identified and requires investigator review.",
      reasons: [
        "Unusual system activity detected",
        "Event differs from expected behavior",
        "Additional investigation recommended",
      ],
    },
    {
      id: "F-004",
      severity: "HIGH",
      type: "UNUSUAL_PROCESS",
      artifact: "process_list.json",
      source: "Process Analysis",
      timestamp: "18 Aug 2026 • 09:41:18",
      score: 81,
      explanation:
        "A process with unusual execution characteristics was detected.",
      reasons: [
        "Unusual process execution detected",
        "Process behavior requires review",
        "Related process artifact identified",
      ],
    },
    {
      id: "F-005",
      severity: "LOW",
      type: "UNCOMMON_FILE_ACCESS",
      artifact: "browser_history.db",
      source: "Browser Analysis",
      timestamp: "18 Aug 2026 • 09:30:05",
      score: 31,
      explanation:
        "An uncommon file access pattern was observed during analysis.",
      reasons: [
        "Uncommon access pattern detected",
        "Browser artifact associated with event",
        "Low priority investigation indicator",
      ],
    },
  ];

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
          <strong>CASE-2026-001</strong>
        </div>

      </div>


      {/* SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Findings</h3>
          <div className="stat-value">17</div>
          <small>Detected findings</small>
        </div>

        <div className="stat-card">
          <h3>Critical</h3>
          <div className="stat-value">02</div>
          <small>Immediate review</small>
        </div>

        <div className="stat-card">
          <h3>High</h3>
          <div className="stat-value">05</div>
          <small>Requires attention</small>
        </div>

        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="stat-value">70</div>
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
                selectedFinding?.id === finding.id
                  ? "finding-selected"
                  : ""
              }`}
              key={finding.id}
              onClick={() => setSelectedFinding(finding)}
            >

              {/* TOP */}
              <div className="finding-large-top">

                <div className="finding-title">

                  <span
                    className={`severity-badge ${finding.severity.toLowerCase()}`}
                  >
                    {finding.severity}
                  </span>

                  <div>
                    <h3>
                      {finding.type}
                    </h3>

                    <span>
                      {finding.id}
                    </span>
                  </div>

                </div>


                <div className="score-box">

                  <strong>
                    {finding.score}
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
                    {finding.artifact}
                  </strong>
                </div>

                <div>
                  <span>SOURCE</span>
                  <strong>
                    {finding.source}
                  </strong>
                </div>

                <div>
                  <span>TIMESTAMP</span>
                  <strong>
                    {finding.timestamp}
                  </strong>
                </div>

              </div>


              {/* EXPLANATION */}
              <div className="finding-explanation">

                <span>EXPLANATION</span>

                <p>
                  {finding.explanation}
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
                  {selectedFinding.type}
                </h2>

                <span className="panel-id">
                  {selectedFinding.id}
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
                  className={`panel-severity ${selectedFinding.severity.toLowerCase()}`}
                >
                  {selectedFinding.severity}
                </strong>
              </div>


              <div>
                <span>DETECTION SCORE</span>

                <strong className="panel-score">
                  {selectedFinding.score}
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
                    {selectedFinding.artifact}
                  </strong>
                </div>

                <div>
                  <span>SOURCE</span>
                  <strong>
                    {selectedFinding.source}
                  </strong>
                </div>

                <div>
                  <span>TIMESTAMP</span>
                  <strong>
                    {selectedFinding.timestamp}
                  </strong>
                </div>

                <div>
                  <span>FINDING ID</span>
                  <strong>
                    {selectedFinding.id}
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

                {selectedFinding.explanation}

              </div>

            </div>


            {/* REASONS */}
            <div className="details-section">

              <h3>
                Detection Reasons
              </h3>

              <div className="reason-list">

                {selectedFinding.reasons.map(
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