import { useEffect, useState } from "react";
import {
  getCases,
  getCaseFindings,
  getAIExplanation,
} from "../services/api";

function AIExplanation() {
  const [caseData, setCaseData] = useState(null);
  const [findings, setFindings] = useState([]);
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [aiExplanation, setAIExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAIError] = useState("");

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

        const backendFindings = findingsResponse.findings || [];

        setFindings(backendFindings);

        if (backendFindings.length > 0) {
          setSelectedFindingId(
            backendFindings[0].finding_id
          );
        }
      } catch (err) {
        console.error("AI findings API error:", err);
        setError(
          err.message || "Failed to load findings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadFindings();
  }, []);

  const selected = findings.find(
    (finding) =>
      finding.finding_id === selectedFindingId
  );

  useEffect(() => {
    async function loadAIExplanation() {
      if (!selected) {
        setAIExplanation(null);
        return;
      }

      try {
        setAILoading(true);
        setAIError("");

        const response = await getAIExplanation(selected);

        setAIExplanation(
          response.explanation || null
        );
      } catch (err) {
        console.error("AI explanation API error:", err);
        setAIError(
          err.message ||
            "Failed to generate AI explanation."
        );
        setAIExplanation(null);
      } finally {
        setAILoading(false);
      }
    }

    loadAIExplanation();
  }, [selected]);

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

  function getExplanationText() {
    if (aiLoading) {
      return "Generating AI-assisted explanation...";
    }

    if (aiError) {
      return aiError;
    }

    if (aiExplanation?.summary) {
      return aiExplanation.summary;
    }

    return "No AI explanation is available for this finding yet.";
  }

  function getEvidenceBasis() {
    if (
      aiExplanation?.evidence_basis &&
      aiExplanation.evidence_basis.length > 0
    ) {
      return aiExplanation.evidence_basis;
    }

    if (selected?.reasons && selected.reasons.length > 0) {
      return selected.reasons;
    }

    return [
      "No supporting evidence details were returned by the backend.",
    ];
  }

  if (loading) {
    return (
      <div className="ai-page">
        <header className="ai-header">
          <div>
            <div className="ai-header-tag">
              FORENSIC INTELLIGENCE
            </div>

            <h1>AI Explanation</h1>

            <p>
              Loading forensic findings...
            </p>
          </div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-page">
        <header className="ai-header">
          <div>
            <div className="ai-header-tag">
              FORENSIC INTELLIGENCE
            </div>

            <h1>AI Explanation</h1>

            <p>
              Unable to load forensic findings.
            </p>
          </div>
        </header>

        <div className="ai-warning">
          <div className="ai-warning-icon">
            !
          </div>

          <div>
            <strong>API ERROR</strong>

            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="ai-page">
        <header className="ai-header">
          <div>
            <div className="ai-header-tag">
              FORENSIC INTELLIGENCE
            </div>

            <h1>AI Explanation</h1>

            <p>
              No investigation case is available.
            </p>
          </div>
        </header>

        <div className="ai-warning">
          <div className="ai-warning-icon">
            !
          </div>

          <div>
            <strong>NO ACTIVE CASE</strong>

            <p>
              Create a case before using AI-assisted
              finding analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <strong>{caseData.case_id}</strong>
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
                key={finding.finding_id}
                className={`ai-finding-card ${
                  selectedFindingId === finding.finding_id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedFindingId(
                    finding.finding_id
                  )
                }
              >

                <div className="ai-finding-row">

                  <span
                    className={`ai-severity-indicator ${
                      finding.severity?.toLowerCase() || ""
                    }`}
                  ></span>

                  <span className="ai-finding-severity">
                    {finding.severity || "UNKNOWN"}
                  </span>

                  <span className="ai-finding-id">
                    {finding.finding_id}
                  </span>

                </div>

                <h3>
                  {finding.type || "UNKNOWN"}
                </h3>

                <p>
                  {finding.artifact || "--"}
                </p>

                <div className="ai-card-score">
                  DETECTION SCORE

                  <strong>
                    {finding.score ?? "--"}
                  </strong>
                </div>

              </button>

            ))}

            {findings.length === 0 && (
              <div className="no-findings">
                No findings available for AI analysis.
              </div>
            )}

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
                  {selected.type || "UNKNOWN"}
                </h2>

                <p>
                  {selected.finding_id}
                  &nbsp;•&nbsp;
                  {selected.source || "--"}
                </p>

              </div>

              <div
                className={`ai-main-severity ${
                  selected.severity?.toLowerCase() || ""
                }`}
              >
                {selected.severity || "UNKNOWN"}
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
                    {selected.score ?? "--"}
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
                      width: `${Math.min(
                        Math.max(
                          Number(selected.score) || 0,
                          0
                        ),
                        100
                      )}%`,
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
                    {selected.artifact || "--"}
                  </strong>
                </div>

                <div>
                  <span>SOURCE</span>

                  <strong>
                    {selected.source || "--"}
                  </strong>
                </div>

                <div>
                  <span>TIMESTAMP</span>

                  <strong>
                    {formatTimestamp(
                      selected.timestamp
                    )}
                  </strong>
                </div>

                <div>
                  <span>FINDING ID</span>

                  <strong>
                    {selected.finding_id}
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
                  {getExplanationText()}
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

                {getEvidenceBasis().map(
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


            {/* AI METADATA */}

            {aiExplanation && (

              <div className="ai-block">

                <div className="ai-block-heading">

                  <span>
                    04
                  </span>

                  <div>
                    <small>
                      AI CONFIDENCE
                    </small>

                    <h3>
                      Analysis Metadata
                    </h3>
                  </div>

                </div>

                <div className="ai-context">

                  <div>
                    <span>CONFIDENCE</span>

                    <strong>
                      {aiExplanation.confidence || "--"}
                    </strong>
                  </div>

                  <div>
                    <span>STATUS</span>

                    <strong>
                      {aiError
                        ? "ERROR"
                        : "SUCCESS"}
                    </strong>
                  </div>

                </div>

              </div>

            )}


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
                  {aiExplanation?.disclaimer ||
                    "AI output is decision-support information. Validate this explanation against the underlying forensic evidence before drawing conclusions."}
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