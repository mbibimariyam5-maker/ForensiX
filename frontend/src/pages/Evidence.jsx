import { useEffect, useState } from "react";
import { getCases, getCaseEvidence } from "../services/api";

function Evidence() {
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvidence() {
      try {
        setLoading(true);
        setError("");

        const casesResponse = await getCases();
        const cases = casesResponse.cases || [];

        if (cases.length === 0) {
          setCaseData(null);
          setEvidence([]);
          return;
        }

        const currentCase = cases[0];
        setCaseData(currentCase);

        const evidenceResponse = await getCaseEvidence(
          currentCase.case_id
        );

        setEvidence(evidenceResponse.evidence || []);
      } catch (err) {
        console.error("Evidence API error:", err);
        setError(err.message || "Failed to load evidence.");
      } finally {
        setLoading(false);
      }
    }

    loadEvidence();
  }, []);

  function formatSize(bytes) {
    if (bytes === null || bytes === undefined) {
      return "--";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }

  function formatDate(timestamp) {
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
    });
  }

  function shortenHash(hash) {
    if (!hash) {
      return "--";
    }

    if (hash.length <= 16) {
      return hash;
    }

    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Evidence</h1>
            <p>Loading collected evidence...</p>
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
            <h1>Evidence</h1>
            <p>Unable to load evidence.</p>
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
            <h1>Evidence</h1>
            <p>No investigation case is available.</p>
          </div>
        </div>

        <div className="section-card">
          <p>
            Create a case in the backend before adding or viewing evidence.
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
          <h1>Evidence</h1>
          <p>
            Manage collected evidence and verify forensic integrity.
          </p>
        </div>

        <div className="case-info">
          <span>CASE</span>
          <strong>{caseData.case_id}</strong>
        </div>
      </div>

      {/* TOP SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Evidence</h3>
          <div className="stat-value">{evidence.length}</div>
          <small>Collected items</small>
        </div>

        <div className="stat-card">
          <h3>Verified</h3>
          <div className="stat-value">--</div>
          <small>Verification API pending</small>
        </div>

        <div className="stat-card">
          <h3>Artifacts</h3>
          <div className="stat-value">--</div>
          <small>Artifact count API pending</small>
        </div>

        <div className="stat-card">
          <h3>Integrity</h3>
          <div className="stat-value">--</div>
          <small>Verification API pending</small>
        </div>

      </div>

      {/* EVIDENCE SECTION */}
      <div className="section-card">

        <div className="section-header">
          <h2>Collected Evidence</h2>

          <button className="upload-button">
            + Upload Evidence
          </button>
        </div>

        {/* TABLE */}
        <div className="evidence-table">

          <div className="evidence-row evidence-header">
            <span>Evidence</span>
            <span>Type</span>
            <span>Size</span>
            <span>SHA-256</span>
            <span>Artifacts</span>
            <span>Integrity</span>
          </div>

          {evidence.length === 0 ? (
            <div className="evidence-row">
              <span>
                No evidence has been added to this case yet.
              </span>
            </div>
          ) : (
            evidence.map((item, index) => (
              <div
                className="evidence-row"
                key={`${item.filename}-${index}`}
              >

                <div className="evidence-name">
                  <div className="file-icon">
                    ◈
                  </div>

                  <div>
                    <strong>{item.filename}</strong>
                    <small>
                      {item.case_id || caseData.case_id}
                    </small>
                  </div>
                </div>

                <span className="muted">
                  {item.artifact_type || "--"}
                </span>

                <span className="muted">
                  {formatSize(item.size_bytes)}
                </span>

                <span className="hash">
                  {shortenHash(item.sha256)}
                </span>

                <span className="artifact-count">
                  --
                </span>

                <span className="muted">
                  NOT AVAILABLE
                </span>

              </div>
            ))
          )}

        </div>

      </div>

      {/* INTEGRITY INFORMATION */}
      <div className="investigation-note">
        <strong>Evidence Integrity:</strong>{" "}
        SHA-256 hashes are provided by the backend for collected
        evidence. Integrity verification status will be connected
        when the verification data source is available.
      </div>

    </div>
  );
}

export default Evidence;

