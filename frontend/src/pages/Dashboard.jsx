import { useEffect, useState } from "react";
import {
  getCases,
  getCaseEvidence,
  getCaseFindings,
  getCaseTimeline,
  verifyEvidence,
} from "../services/api";

function Dashboard() {
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [findings, setFindings] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [verificationResults, setVerificationResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const casesResponse = await getCases();
        const cases = casesResponse.cases || [];

        if (cases.length === 0) {
          setCaseData(null);
          setEvidence([]);
          setFindings([]);
          setTimeline([]);
          setVerificationResults([]);
          return;
        }

        const currentCase = cases[0];
        setCaseData(currentCase);

        const [evidenceResponse, findingsResponse, timelineResponse] =
          await Promise.all([
            getCaseEvidence(currentCase.case_id),
            getCaseFindings(currentCase.case_id),
            getCaseTimeline(currentCase.case_id),
          ]);

        const evidenceItems = evidenceResponse.evidence || [];
        setEvidence(evidenceItems);
        setFindings(findingsResponse.findings || []);
        setTimeline(timelineResponse.events || []);

        if (evidenceItems.length > 0) {
          const results = await Promise.all(
            evidenceItems.map(async (item) => {
              try {
                const response = await verifyEvidence(item.id);
                return response.verification || null;
              } catch (verificationError) {
                console.error(
                  "Dashboard evidence verification error:",
                  verificationError
                );
                return null;
              }
            })
          );

          setVerificationResults(results.filter(Boolean));
        } else {
          setVerificationResults([]);
        }
      } catch (err) {
        console.error("Dashboard API error:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const highRiskCount = findings.filter(
    (finding) =>
      String(finding.severity).toUpperCase() === "HIGH" ||
      String(finding.severity).toUpperCase() === "CRITICAL"
  ).length;

  const recentFindings = [...findings]
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    )
    .slice(0, 3);

  const recentTimeline = [...timeline]
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime()
    )
    .slice(0, 4);

  const verifiedCount = verificationResults.filter(
    (result) => result.verified === true
  ).length;

  const integrityStatus =
    evidence.length === 0
      ? "NO EVIDENCE"
      : verificationResults.length < evidence.length
        ? "VERIFICATION PENDING"
        : verifiedCount === evidence.length
          ? "VERIFIED"
          : verifiedCount > 0
            ? "PARTIAL"
            : "FAILED";

  const integrityProgress =
    evidence.length === 0
      ? 0
      : Math.round((verifiedCount / evidence.length) * 100);

  function formatTime(timestamp) {
    if (!timestamp) return "--:--:--";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return timestamp;

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  function getFindingTitle(finding) {
    if (finding.type) {
      return String(finding.type).replaceAll("_", " ");
    }

    return "Finding";
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Investigation Overview</h1>
            <p>Loading investigation data...</p>
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
            <h1>Investigation Overview</h1>
            <p>Unable to load investigation data.</p>
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
            <h1>Investigation Overview</h1>
            <p>No cases are available yet.</p>
          </div>
        </div>
        <div className="section-card">
          <p>Create a case in the backend to display investigation data here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Investigation Overview</h1>
          <p>Monitor evidence, findings and investigation activity.</p>
        </div>
        <div className="case-info">
          <span>CASE</span>
          <strong>{caseData.case_id}</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Evidence</h3>
          <div className="stat-value">{evidence.length}</div>
          <small>Collected items</small>
        </div>
        <div className="stat-card">
          <h3>Artifacts</h3>
          <div className="stat-value">--</div>
          <small>Awaiting artifact count API</small>
        </div>
        <div className="stat-card">
          <h3>Findings</h3>
          <div className="stat-value">{findings.length}</div>
          <small>Detected findings</small>
        </div>
        <div className="stat-card">
          <h3>High Risk</h3>
          <div className="stat-value">
            {String(highRiskCount).padStart(2, "0")}
          </div>
          <small>Requires attention</small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="section-card">
            <div className="section-header">
              <h2>Investigation Priority</h2>
              <span>CASE RISK</span>
            </div>

            <div className="risk-card">
              <div className="risk-circle">
                <strong>--</strong>
                <span>PRIORITY</span>
              </div>
              <div className="risk-info">
                <h3>AWAITING RISK DATA</h3>
                <p>
                  Case-level priority will be connected when the backend
                  provides the risk or priority result.
                </p>
              </div>
            </div>

            <div className="integrity-box">
              <div className="integrity-top">
                <span>Evidence Integrity</span>
                <strong>{integrityStatus}</strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${integrityProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="section-card" style={{ marginTop: "18px" }}>
            <div className="section-header">
              <h2>Recent Findings</h2>
              <span>{recentFindings.length} RECENT</span>
            </div>
            <div className="findings-list">
              {recentFindings.length === 0 ? (
                <div className="finding-card">
                  <div className="finding-content">
                    <h3>No findings available</h3>
                    <p>No findings have been returned for this case.</p>
                  </div>
                </div>
              ) : (
                recentFindings.map((finding) => (
                  <div className="finding-card" key={finding.finding_id}>
                    <span
                      className={`severity ${String(
                        finding.severity || "medium"
                      ).toLowerCase()}`}
                    >
                      {finding.severity || "UNKNOWN"}
                    </span>
                    <div className="finding-content">
                      <h3>{getFindingTitle(finding)}</h3>
                      <p>
                        {finding.artifact || "Unknown artifact"} • {" "}
                        {formatTime(finding.timestamp)}
                      </p>
                    </div>
                    <span className="finding-score">
                      {finding.score ?? "--"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="section-card">
            <div className="section-header">
              <h2>Investigation Timeline</h2>
              <span>RECENT ACTIVITY</span>
            </div>
            <div className="timeline">
              {recentTimeline.length === 0 ? (
                <div className="timeline-item">
                  <span className="timeline-time">--</span>
                  <h4>No timeline events</h4>
                  <p>No timeline events have been returned for this case.</p>
                </div>
              ) : (
                recentTimeline.map((event) => (
                  <div className="timeline-item" key={event.id}>
                    <span className="timeline-time">
                      {formatTime(event.timestamp)}
                    </span>
                    <h4>
                      {String(event.event_type || "event").replaceAll(
                        "_",
                        " "
                      )}
                    </h4>
                    <p>{event.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="investigation-note">
            Priority score will be connected when a backend risk or priority
            result is available.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
