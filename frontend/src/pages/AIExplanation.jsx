import { useState } from "react";

function AIExplanation() {
  const [selectedFinding, setSelectedFinding] = useState("F-002");

  const findings = [
    {
      id: "F-002",
      severity: "CRITICAL",
      type: "IOC MATCH",
      score: 94,
      artifact: "suspicious_file.exe",
      source: "File Analysis",
      timestamp: "18 Aug 2026 • 10:18:43",
      explanation:
        "The analyzed artifact matched a configured indicator of compromise. The AI identified this result as a high-priority investigation indicator based on the available forensic evidence.",
      evidence: [
        "suspicious_file.exe was analyzed",
        "Configured IOC match was detected",
        "Detection confidence score is 94",
        "Source: File Analysis",
      ],
    },
    {
      id: "F-001",
      severity: "HIGH",
      type: "MULTIPLE FAILED LOGINS",
      score: 85,
      artifact: "authentication.log",
      source: "Authentication Logs",
      timestamp: "18 Aug 2026 • 10:24:12",
      explanation:
        "Multiple failed authentication attempts were detected within a short period. The AI classified this pattern as an investigation indicator requiring review.",
      evidence: [
        "authentication.log contains repeated failures",
        "Multiple attempts occurred within a short period",
        "Activity requires investigator review",
        "Detection confidence score is 85",
      ],
    },
    {
      id: "F-003",
      severity: "MEDIUM",
      type: "SUSPICIOUS SYSTEM EVENT",
      score: 59,
      artifact: "system.log",
      source: "System Logs",
      timestamp: "18 Aug 2026 • 09:52:31",
      explanation:
        "An unusual system event was identified in the available logs. The AI classified the event as a medium-priority investigation indicator.",
      evidence: [
        "system.log contains an unusual event",
        "Event differs from expected activity",
        "Additional investigation is recommended",
        "Detection confidence score is 59",
      ],
    },
  ];

  const selected = findings.find(
    (finding) => finding.id === selectedFinding
  );

  return (
    <div className="ai-page">

      {/* HEADER */}

      <header className="ai-header">

        <div>
          <div className="ai-header-tag">
            FORENSIC INTELLIGENCE
          </div>

          <h1>
            AI Explanation
          </h1>

          <p>
            AI-assisted interpretation of detected forensic findings
          </p>
        </div>

        <div className="ai-case">
          <span>ACTIVE CASE</span>
          <strong>CASE-2026-001</strong>
        </div>

      </header>


      {/* AI ENGINE STATUS */}

      <div className="ai-engine">

        <div className="ai-engine-symbol">
          ✦
        </div>

        <div className="ai-engine-text">

          <strong>
            FORENSIX AI ANALYSIS ENGINE
          </strong>

          <span>
            Analysis generated from available forensic evidence
          </span>

        </div>

        <div className="ai-engine-status">
          <span></span>
          EVIDENCE GROUNDED
        </div>

      </div>


      {/* WORKSPACE */}

      <div className="ai-workspace">


        {/* LEFT SIDE */}

        <section className="ai-sidebar-panel">

          <div className="ai-sidebar-header">

            <div>
              <span>DETECTION QUEUE</span>
              <h2>Findings</h2>
            </div>

            <strong>
              {findings.length}
            </strong>

          </div>


          <div className="ai-finding-list">

            {findings.map((finding) => (

              <button
                key={finding.id}
                className={`ai-finding-card ${
                  selectedFinding === finding.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedFinding(finding.id)
                }
              >

                <div className="ai-finding-row">

                  <span
                    className={`ai-severity-indicator ${finding.severity.toLowerCase()}`}
                  ></span>

                  <span className="ai-finding-severity">
                    {finding.severity}
                  </span>

                  <span className="ai-finding-id">
                    {finding.id}
                  </span>

                </div>

                <h3>
                  {finding.type}
                </h3>

                <p>
                  {finding.artifact}
                </p>

                <div className="ai-card-score">
                  DETECTION SCORE

                  <strong>
                    {finding.score}
                  </strong>
                </div>

              </button>

            ))}

          </div>

        </section>


        {/* RIGHT SIDE */}

        {selected && (

          <section className="ai-main-panel">


            {/* FINDING HEADER */}

            <div className="ai-main-header">

              <div>

                <span>
                  AI-ASSISTED FINDING ANALYSIS
                </span>

                <h2>
                  {selected.type}
                </h2>

                <p>
                  {selected.id} &nbsp;•&nbsp; {selected.source}
                </p>

              </div>

              <div
                className={`ai-main-severity ${selected.severity.toLowerCase()}`}
              >
                {selected.severity}
              </div>

            </div>


            {/* SCORE */}

            <div className="ai-score-area">

              <div className="ai-score-value">

                <span>
                  DETECTION SCORE
                </span>

                <div>
                  <strong>
                    {selected.score}
                  </strong>

                  <small>
                    /100
                  </small>
                </div>

              </div>

              <div className="ai-score-meter">

                <div className="ai-score-track">

                  <div
                    style={{
                      width: `${selected.score}%`,
                    }}
                  ></div>

                </div>

                <div className="ai-score-scale">

                  <span>LOW</span>
                  <span>MEDIUM</span>
                  <span>HIGH</span>
                  <span>CRITICAL</span>

                </div>

              </div>

            </div>


            {/* FORENSIC CONTEXT */}

            <div className="ai-block">

              <div className="ai-block-heading">

                <span>
                  01
                </span>

                <div>
                  <small>
                    FORENSIC CONTEXT
                  </small>

                  <h3>
                    Source Information
                  </h3>
                </div>

              </div>


              <div className="ai-context">

                <div>
                  <span>ARTIFACT</span>

                  <strong>
                    {selected.artifact}
                  </strong>
                </div>

                <div>
                  <span>SOURCE</span>

                  <strong>
                    {selected.source}
                  </strong>
                </div>

                <div>
                  <span>TIMESTAMP</span>

                  <strong>
                    {selected.timestamp}
                  </strong>
                </div>

                <div>
                  <span>FINDING ID</span>

                  <strong>
                    {selected.id}
                  </strong>
                </div>

              </div>

            </div>


            {/* AI REASONING */}

            <div className="ai-block">

              <div className="ai-block-heading">

                <span>
                  02
                </span>

                <div>
                  <small>
                    AI REASONING
                  </small>

                  <h3>
                    Explanation
                  </h3>
                </div>

              </div>


              <div className="ai-reasoning">

                <div className="ai-reasoning-icon">
                  AI
                </div>

                <p>
                  {selected.explanation}
                </p>

              </div>

            </div>


            {/* EVIDENCE */}

            <div className="ai-block">

              <div className="ai-block-heading">

                <span>
                  03
                </span>

                <div>
                  <small>
                    EVIDENCE CORRELATION
                  </small>

                  <h3>
                    Supporting Evidence
                  </h3>
                </div>

              </div>


              <div className="ai-evidence">

                {selected.evidence.map(
                  (item, index) => (

                    <div
                      className="ai-evidence-row"
                      key={index}
                    >

                      <span>
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <p>
                        {item}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* GROUNDING */}

            <div className="ai-grounded-box">

              <div className="ai-grounded-icon">
                ✓
              </div>

              <div>

                <strong>
                  GROUNDED IN FORENSIC EVIDENCE
                </strong>

                <p>
                  This explanation is based on detected
                  forensic artifacts and findings available
                  in the investigation. The AI does not
                  create or modify forensic evidence.
                </p>

              </div>

            </div>


            {/* WARNING */}

            <div className="ai-warning">

              <div className="ai-warning-icon">
                !
              </div>

              <div>

                <strong>
                  INVESTIGATOR REVIEW REQUIRED
                </strong>

                <p>
                  AI output is decision-support information.
                  Validate this explanation against the
                  underlying forensic evidence before
                  drawing conclusions.
                </p>

              </div>

            </div>

          </section>

        )}

      </div>

    </div>
  );
}

export default AIExplanation;