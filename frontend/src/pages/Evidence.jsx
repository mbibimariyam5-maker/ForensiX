import { useEffect, useRef, useState } from "react";
import {
  getCases,
  getCaseEvidence,
  uploadEvidence,
  verifyEvidence,
} from "../services/api";

function Evidence() {
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const fileInputRef = useRef(null);

  async function fetchEvidence() {
    const casesResponse = await getCases();
    const cases = casesResponse.cases || [];

    if (cases.length === 0) {
      return {
        caseData: null,
        evidence: [],
      };
    }

    const currentCase = cases[0];

    const evidenceResponse = await getCaseEvidence(
      currentCase.case_id
    );

    return {
      caseData: currentCase,
      evidence: evidenceResponse.evidence || [],
    };
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const result = await fetchEvidence();

        if (cancelled) {
          return;
        }

        setCaseData(result.caseData);
        setEvidence(result.evidence);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Evidence API error:", err);
        setError(err.message || "Failed to load evidence.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      cancelled = true;
    };
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

  function shortenHash(hash) {
    if (!hash) {
      return "--";
    }

    if (hash.length <= 16) {
      return hash;
    }

    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  }

  function handleUploadButtonClick() {
    if (uploading || verifyingId !== null) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file || !caseData) {
      return;
    }

    try {
      setUploading(true);
      setError("");
      setUploadMessage("");

      const response = await uploadEvidence(
        caseData.case_id,
        file
      );

      setUploadMessage(
        `${response.evidence.filename} uploaded successfully.`
      );

      const refreshed = await fetchEvidence();

      setCaseData(refreshed.caseData);
      setEvidence(refreshed.evidence);
    } catch (err) {
      console.error("Evidence upload error:", err);
      setError(err.message || "Failed to upload evidence.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleVerifyEvidence(evidenceId) {
    try {
      setVerifyingId(evidenceId);
      setError("");

      const response = await verifyEvidence(evidenceId);

      setVerificationResults((previous) => ({
        ...previous,
        [evidenceId]: response.verification,
      }));
    } catch (err) {
      console.error("Evidence verification error:", err);
      setError(
        err.message || "Failed to verify evidence integrity."
      );
    } finally {
      setVerifyingId(null);
    }
  }

  const verifiedCount = evidence.filter(
    (item) => verificationResults[item.id]?.verified === true
  ).length;

  const verificationAttemptCount = evidence.filter(
    (item) => verificationResults[item.id]
  ).length;

  let integrityStatus = "PENDING";

  if (evidence.length === 0) {
    integrityStatus = "NO EVIDENCE";
  } else if (verifiedCount === evidence.length) {
    integrityStatus = "VERIFIED";
  } else if (
    Object.values(verificationResults).some(
      (result) =>
        result.status === "MISMATCH" ||
        result.status === "MISSING"
    )
  ) {
    integrityStatus = "ATTENTION";
  } else if (verificationAttemptCount > 0) {
    integrityStatus = "PARTIAL";
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

  if (error && !caseData) {
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
            Create a case in the backend before adding or viewing
            evidence.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
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

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Evidence</h3>
          <div className="stat-value">{evidence.length}</div>
          <small>Collected items</small>
        </div>

        <div className="stat-card">
          <h3>Verified</h3>
          <div className="stat-value">{verifiedCount}</div>
          <small>
            {evidence.length === 0
              ? "No evidence"
              : `${verifiedCount} of ${evidence.length} verified`}
          </small>
        </div>

        <div className="stat-card">
          <h3>Artifacts</h3>
          <div className="stat-value">{evidence.length}</div>
          <small>Available evidence records</small>
        </div>

        <div className="stat-card">
          <h3>Integrity</h3>
          <div className="stat-value">{integrityStatus}</div>
          <small>SHA-256 verification</small>
        </div>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Collected Evidence</h2>

          <button
            className="upload-button"
            onClick={handleUploadButtonClick}
            disabled={uploading || verifyingId !== null}
          >
            {uploading
              ? "Uploading..."
              : "+ Upload Evidence"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {uploadMessage && (
          <div className="investigation-note">
            <strong>Upload successful:</strong>{" "}
            {uploadMessage}
          </div>
        )}

        {error && (
          <div className="investigation-note">
            <strong>Verification error:</strong>{" "}
            {error}
          </div>
        )}

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
            evidence.map((item, index) => {
              const verification =
                verificationResults[item.id];

              const isVerifying = verifyingId === item.id;

              return (
                <div
                  className="evidence-item-container"
                  key={`${item.filename}-${index}`}
                >
                  <div className="evidence-row">
                    <div className="evidence-name">
                      <div className="file-icon">
                        FILE
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

                    <div className="integrity-action">
                      <button
                        className="upload-button"
                        onClick={() =>
                          handleVerifyEvidence(item.id)
                        }
                        disabled={isVerifying}
                      >
                        {isVerifying
                          ? "Verifying..."
                          : verification
                            ? "Verify Again"
                            : "Verify"}
                      </button>
                    </div>
                  </div>

                  {verification && (
                    <div className="verification-result-box">
                      <div className="verification-result-header">
                        <strong>
                          {verification.status}
                        </strong>
                      </div>

                      <p className="verification-message">
                        {verification.message}
                      </p>

                      <div className="verification-details">
                        <div>
                          <span>Recorded SHA-256</span>
                          <strong>
                            {verification.recorded_sha256}
                          </strong>
                        </div>

                        <div>
                          <span>Calculated SHA-256</span>
                          <strong>
                            {verification.calculated_sha256 ||
                              "Not available"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="investigation-note">
        <strong>Evidence Integrity:</strong>{" "}
        Click Verify to re-calculate the SHA-256 hash of the
        stored evidence file and compare it with the recorded
        forensic hash. A matching hash is reported as VERIFIED.
      </div>
    </div>
  );
}

export default Evidence;