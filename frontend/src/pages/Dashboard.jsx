function Dashboard() {
  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Investigation Overview</h1>
          <p>Monitor evidence, findings and investigation activity.</p>
        </div>

        <div className="case-info">
          <span>CASE</span>
          <strong>CASE-2026-001</strong>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Evidence</h3>
          <div className="stat-value">24</div>
          <small>Collected items</small>
        </div>

        <div className="stat-card">
          <h3>Artifacts</h3>
          <div className="stat-value">186</div>
          <small>Extracted artifacts</small>
        </div>

        <div className="stat-card">
          <h3>Findings</h3>
          <div className="stat-value">17</div>
          <small>Detected findings</small>
        </div>

        <div className="stat-card">
          <h3>High Risk</h3>
          <div className="stat-value">05</div>
          <small>Requires attention</small>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className="dashboard-grid">

        {/* LEFT COLUMN */}
        <div>

          {/* RISK CARD */}
          <div className="section-card">

            <div className="section-header">
              <h2>Investigation Priority</h2>
              <span>CASE RISK</span>
            </div>

            <div className="risk-card">

              <div className="risk-circle">
                <strong>78</strong>
                <span>PRIORITY</span>
              </div>

              <div className="risk-info">
                <h3>HIGH PRIORITY</h3>

                <p>
                  Multiple findings require investigator attention.
                  Review high-severity findings and related evidence.
                </p>
              </div>

            </div>

            {/* INTEGRITY */}
            <div className="integrity-box">

              <div className="integrity-top">
                <span>Evidence Integrity</span>
                <strong>100% VERIFIED</strong>
              </div>

              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>

            </div>

          </div>


          {/* RECENT FINDINGS */}
          <div className="section-card" style={{ marginTop: "18px" }}>

            <div className="section-header">
              <h2>Recent Findings</h2>
              <span>3 RECENT</span>
            </div>

            <div className="findings-list">

              <div className="finding-card">

                <span className="severity high">
                  HIGH
                </span>

                <div className="finding-content">
                  <h3>Multiple Failed Logins</h3>
                  <p>
                    Authentication logs • 10:24:12
                  </p>
                </div>

                <span className="finding-score">
                  85
                </span>

              </div>


              <div className="finding-card">

                <span className="severity medium">
                  MEDIUM
                </span>

                <div className="finding-content">
                  <h3>IOC Match</h3>
                  <p>
                    example.exe • 10:18:43
                  </p>
                </div>

                <span className="finding-score">
                  64
                </span>

              </div>


              <div className="finding-card">

                <span className="severity medium">
                  MEDIUM
                </span>

                <div className="finding-content">
                  <h3>Suspicious Event</h3>
                  <p>
                    system.log • 09:52:31
                  </p>
                </div>

                <span className="finding-score">
                  59
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* RIGHT COLUMN */}
        <div>

          {/* TIMELINE */}
          <div className="section-card">

            <div className="section-header">
              <h2>Investigation Timeline</h2>
              <span>RECENT ACTIVITY</span>
            </div>

            <div className="timeline">

              <div className="timeline-item">
                <span className="timeline-time">
                  10:24:12
                </span>

                <h4>Multiple failed login attempts</h4>

                <p>
                  Authentication event detected
                </p>
              </div>


              <div className="timeline-item">
                <span className="timeline-time">
                  10:18:43
                </span>

                <h4>IOC match detected</h4>

                <p>
                  Suspicious artifact identified
                </p>
              </div>


              <div className="timeline-item">
                <span className="timeline-time">
                  09:52:31
                </span>

                <h4>System event recorded</h4>

                <p>
                  Event added to investigation timeline
                </p>
              </div>


              <div className="timeline-item">
                <span className="timeline-time">
                  09:30:05
                </span>

                <h4>Evidence acquisition completed</h4>

                <p>
                  Evidence integrity verified
                </p>
              </div>

            </div>

          </div>


          {/* INVESTIGATION NOTE */}
          <div className="investigation-note">
            Priority score is an investigation aid, not proof
            of malicious activity.
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;