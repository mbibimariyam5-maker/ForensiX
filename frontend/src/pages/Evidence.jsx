function Evidence() {
  const evidence = [
    {
      id: "EV-001",
      filename: "system_logs.zip",
      type: "LOG ARCHIVE",
      size: "24.8 MB",
      hash: "a81f...93cd",
      acquired: "18 Aug 2026 • 10:15",
      artifacts: 42,
      status: "VERIFIED",
    },
    {
      id: "EV-002",
      filename: "memory_dump.raw",
      type: "MEMORY IMAGE",
      size: "512 MB",
      hash: "b72c...81ae",
      acquired: "18 Aug 2026 • 10:18",
      artifacts: 86,
      status: "VERIFIED",
    },
    {
      id: "EV-003",
      filename: "browser_history.db",
      type: "DATABASE",
      size: "8.4 MB",
      hash: "f19a...44bc",
      acquired: "18 Aug 2026 • 10:21",
      artifacts: 31,
      status: "VERIFIED",
    },
    {
      id: "EV-004",
      filename: "suspicious_file.exe",
      type: "EXECUTABLE",
      size: "2.1 MB",
      hash: "c82d...71fa",
      acquired: "18 Aug 2026 • 10:24",
      artifacts: 27,
      status: "VERIFIED",
    },
  ];

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
          <strong>CASE-2026-001</strong>
        </div>
      </div>

      {/* TOP SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Evidence</h3>
          <div className="stat-value">24</div>
          <small>Collected items</small>
        </div>

        <div className="stat-card">
          <h3>Verified</h3>
          <div className="stat-value">24</div>
          <small>Integrity confirmed</small>
        </div>

        <div className="stat-card">
          <h3>Artifacts</h3>
          <div className="stat-value">186</div>
          <small>Extracted artifacts</small>
        </div>

        <div className="stat-card">
          <h3>Integrity</h3>
          <div className="stat-value">100%</div>
          <small>Evidence verified</small>
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

          {evidence.map((item) => (
            <div className="evidence-row" key={item.id}>

              <div className="evidence-name">
                <div className="file-icon">
                  ◈
                </div>

                <div>
                  <strong>{item.filename}</strong>
                  <small>{item.id}</small>
                </div>
              </div>

              <span className="muted">
                {item.type}
              </span>

              <span className="muted">
                {item.size}
              </span>

              <span className="hash">
                {item.hash}
              </span>

              <span className="artifact-count">
                {item.artifacts}
              </span>

              <span className="verified">
                ● {item.status}
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* INTEGRITY INFORMATION */}
      <div className="investigation-note">
        <strong>Evidence Integrity:</strong>{" "}
        SHA-256 hashes are used to verify that collected evidence
        has not changed after acquisition. A verified hash confirms
        integrity; it does not indicate whether the evidence is
        malicious.
      </div>

    </div>
  );
}

export default Evidence;