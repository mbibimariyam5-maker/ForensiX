import { useState } from "react";

function TimelinePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const timelineEvents = [
    {
      id: "T-001",
      time: "10:24:12",
      date: "18 Aug 2026",
      event: "Multiple failed login attempts",
      type: "AUTHENTICATION",
      user: "unknown",
      ip: "192.168.1.45",
      finding: "F-001",
      severity: "HIGH",
      description:
        "Multiple unsuccessful authentication attempts were detected within a short period.",
    },
    {
      id: "T-002",
      time: "10:18:43",
      date: "18 Aug 2026",
      event: "IOC match detected",
      type: "FILE ANALYSIS",
      user: "system",
      ip: "192.168.1.20",
      finding: "F-002",
      severity: "CRITICAL",
      description:
        "An analyzed executable matched a configured indicator of compromise.",
    },
    {
      id: "T-003",
      time: "09:52:31",
      date: "18 Aug 2026",
      event: "Suspicious system event",
      type: "SYSTEM EVENT",
      user: "administrator",
      ip: "192.168.1.12",
      finding: "F-003",
      severity: "MEDIUM",
      description:
        "An unusual system event was recorded and flagged for investigator review.",
    },
    {
      id: "T-004",
      time: "09:41:18",
      date: "18 Aug 2026",
      event: "Unusual process detected",
      type: "PROCESS",
      user: "user01",
      ip: "192.168.1.30",
      finding: "F-004",
      severity: "HIGH",
      description:
        "A process with unusual execution characteristics was identified.",
    },
    {
      id: "T-005",
      time: "09:30:05",
      date: "18 Aug 2026",
      event: "Browser artifact accessed",
      type: "BROWSER",
      user: "user01",
      ip: "192.168.1.30",
      finding: "F-005",
      severity: "LOW",
      description:
        "An uncommon access pattern was observed in the browser history artifact.",
    },
    {
      id: "T-006",
      time: "09:15:42",
      date: "18 Aug 2026",
      event: "Evidence acquisition completed",
      type: "EVIDENCE",
      user: "forensic-agent",
      ip: "192.168.1.10",
      finding: "NONE",
      severity: "LOW",
      description:
        "Evidence acquisition was completed and the collected data was prepared for analysis.",
    },
    {
      id: "T-007",
      time: "09:05:17",
      date: "18 Aug 2026",
      event: "Memory image acquired",
      type: "EVIDENCE",
      user: "forensic-agent",
      ip: "192.168.1.10",
      finding: "NONE",
      severity: "LOW",
      description:
        "A memory image was successfully acquired as part of the forensic collection process.",
    },
  ];

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header">

        <div>
          <h1>Investigation Timeline</h1>

          <p>
            Review chronological forensic events and their relationships.
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
          <h3>Total Events</h3>
          <div className="stat-value">186</div>
          <small>Recorded events</small>
        </div>

        <div className="stat-card">
          <h3>Findings Linked</h3>
          <div className="stat-value">17</div>
          <small>Events linked to findings</small>
        </div>

        <div className="stat-card">
          <h3>High Priority</h3>
          <div className="stat-value">07</div>
          <small>Events requiring review</small>
        </div>

        <div className="stat-card">
          <h3>Time Range</h3>
          <div className="stat-value">2h</div>
          <small>Investigation window</small>
        </div>

      </div>


      {/* TIMELINE CONTAINER */}
      <div className="section-card">

        <div className="timeline-page-header">

          <div>
            <h2>Forensic Event Timeline</h2>

            <span>
              Chronological investigation activity
            </span>
          </div>

          <div className="timeline-status">
            ● LIVE DATA
          </div>

        </div>


        {/* TIMELINE */}
        <div className="forensic-timeline">

          {timelineEvents.map((event) => (

            <div
              className="timeline-event"
              key={event.id}
              onClick={() => setSelectedEvent(event)}
            >

              {/* TIME */}
              <div className="timeline-time">

                <strong>
                  {event.time}
                </strong>

                <span>
                  {event.date}
                </span>

              </div>


              {/* LINE + DOT */}
              <div className="timeline-marker">

                <div
                  className={`timeline-dot ${event.severity.toLowerCase()}`}
                ></div>

              </div>


              {/* EVENT CARD */}
              <div className="timeline-event-card">

                <div className="timeline-event-top">

                  <div>

                    <span
                      className={`timeline-severity ${event.severity.toLowerCase()}`}
                    >
                      {event.severity}
                    </span>

                    <h3>
                      {event.event}
                    </h3>

                  </div>

                  <span className="timeline-event-id">
                    {event.id}
                  </span>

                </div>


                <div className="timeline-event-details">

                  <div>
                    <span>TYPE</span>
                    <strong>
                      {event.type}
                    </strong>
                  </div>

                  <div>
                    <span>USER</span>
                    <strong>
                      {event.user}
                    </strong>
                  </div>

                  <div>
                    <span>IP ADDRESS</span>
                    <strong>
                      {event.ip}
                    </strong>
                  </div>

                  <div>
                    <span>FINDING</span>
                    <strong>
                      {event.finding}
                    </strong>
                  </div>

                </div>

                <div className="timeline-click-hint">
                  Click event to view details →
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* NOTE */}
      <div className="investigation-note">

        <strong>Timeline Note:</strong>{" "}
        Timeline events represent recorded forensic activity.
        Events linked to findings should be correlated with other
        evidence before drawing conclusions.

      </div>


      {/* EVENT DETAILS PANEL */}
      {selectedEvent && (

        <div className="timeline-overlay">

          <div className="timeline-details-panel">

            {/* HEADER */}
            <div className="timeline-panel-header">

              <div>

                <span className="panel-label">
                  TIMELINE EVENT
                </span>

                <h2>
                  {selectedEvent.event}
                </h2>

                <span className="panel-id">
                  {selectedEvent.id}
                </span>

              </div>

              <button
                className="timeline-close-button"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>

            </div>


            {/* TIME */}
            <div className="timeline-time-box">

              <span>
                EVENT TIMESTAMP
              </span>

              <strong>
                {selectedEvent.date} • {selectedEvent.time}
              </strong>

            </div>


            {/* EVENT INFORMATION */}
            <div className="timeline-panel-section">

              <h3>
                Event Information
              </h3>

              <div className="timeline-info-grid">

                <div>
                  <span>EVENT TYPE</span>

                  <strong>
                    {selectedEvent.type}
                  </strong>
                </div>

                <div>
                  <span>SEVERITY</span>

                  <strong
                    className={`timeline-panel-severity ${selectedEvent.severity.toLowerCase()}`}
                  >
                    {selectedEvent.severity}
                  </strong>
                </div>

                <div>
                  <span>USER / ACCOUNT</span>

                  <strong>
                    {selectedEvent.user}
                  </strong>
                </div>

                <div>
                  <span>IP ADDRESS</span>

                  <strong>
                    {selectedEvent.ip}
                  </strong>
                </div>

                <div>
                  <span>RELATED FINDING</span>

                  <strong>
                    {selectedEvent.finding}
                  </strong>
                </div>

                <div>
                  <span>EVENT ID</span>

                  <strong>
                    {selectedEvent.id}
                  </strong>
                </div>

              </div>

            </div>


            {/* DESCRIPTION */}
            <div className="timeline-panel-section">

              <h3>
                Event Description
              </h3>

              <div className="timeline-description">

                {selectedEvent.description}

              </div>

            </div>


            {/* CORRELATION */}
            <div className="timeline-panel-section">

              <h3>
                Investigation Correlation
              </h3>

              <div className="timeline-correlation">

                {selectedEvent.finding !== "NONE" ? (
                  <>
                    <span>●</span>

                    <p>
                      This event is linked to finding{" "}
                      <strong>
                        {selectedEvent.finding}
                      </strong>
                      . Review the associated evidence and
                      other related events before reaching a conclusion.
                    </p>
                  </>
                ) : (
                  <>
                    <span>●</span>

                    <p>
                      This event is currently not linked to a
                      specific finding.
                    </p>
                  </>
                )}

              </div>

            </div>


            {/* CLOSE */}
            <button
              className="timeline-panel-close"
              onClick={() => setSelectedEvent(null)}
            >
              Close Details
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default TimelinePage;