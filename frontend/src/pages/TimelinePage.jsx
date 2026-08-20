import { useEffect, useState } from "react";
import { getCases, getCaseTimeline } from "../services/api";

function TimelinePage() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [caseId, setCaseId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTimeline() {
      try {
        setLoading(true);
        setError("");

        const casesResponse = await getCases();

        if (
          !casesResponse.cases ||
          casesResponse.cases.length === 0
        ) {
          setCaseId("");
          setTimelineEvents([]);
          return;
        }

        const currentCase = casesResponse.cases[0];
        const currentCaseId = currentCase.case_id;

        setCaseId(currentCaseId);

        const timelineResponse = await getCaseTimeline(currentCaseId);

        setTimelineEvents(timelineResponse.events || []);
      } catch (err) {
        console.error("Failed to load timeline:", err);
        setError("Unable to load investigation timeline.");
      } finally {
        setLoading(false);
      }
    }

    loadTimeline();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Unknown date";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "--:--:--";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getEventSeverity = (event) => {
    const metadata = event.metadata || {};

    if (metadata.severity) {
      return String(metadata.severity).toUpperCase();
    }

    return "LOW";
  };

  const getEventUser = (event) => {
    const metadata = event.metadata || {};

    return (
      metadata.user ||
      metadata.username ||
      metadata.account ||
      "unknown"
    );
  };

  const getEventIp = (event) => {
    const metadata = event.metadata || {};

    return (
      metadata.ip ||
      metadata.ip_address ||
      "N/A"
    );
  };

  const getFinding = (event) => {
    const metadata = event.metadata || {};

    return metadata.finding_id || "NONE";
  };

  const getDisplayType = (event) => {
    if (!event.event_type) {
      return "OTHER";
    }

    return event.event_type
      .replace(/_/g, " ")
      .toUpperCase();
  };

  const totalEvents = timelineEvents.length;

  const findingsLinked = timelineEvents.filter(
    (event) => getFinding(event) !== "NONE"
  ).length;

  const highPriorityEvents = timelineEvents.filter((event) => {
    const severity = getEventSeverity(event);

    return (
      severity === "HIGH" ||
      severity === "CRITICAL"
    );
  }).length;

  const getTimeRange = () => {
    if (timelineEvents.length < 2) {
      return "0h";
    }

    const timestamps = timelineEvents
      .map((event) => new Date(event.timestamp).getTime())
      .filter((time) => !Number.isNaN(time));

    if (timestamps.length < 2) {
      return "0h";
    }

    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);

    const differenceInHours =
      (latest - earliest) / (1000 * 60 * 60);

    if (differenceInHours < 1) {
      const minutes = Math.max(
        1,
        Math.round(differenceInHours * 60)
      );

      return `${minutes}m`;
    }

    return `${Math.round(differenceInHours * 10) / 10}h`;
  };

  const mappedEvents = timelineEvents.map((event) => ({
    ...event,
    displayId: `T-${String(event.id).padStart(3, "0")}`,
    time: formatTime(event.timestamp),
    date: formatDate(event.timestamp),
    event: event.description,
    type: getDisplayType(event),
    user: getEventUser(event),
    ip: getEventIp(event),
    finding: getFinding(event),
    severity: getEventSeverity(event),
  }));

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
          <strong>
            {caseId || "NO CASE"}
          </strong>
        </div>

      </div>


      {/* SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Events</h3>
          <div className="stat-value">
            {loading ? "--" : totalEvents}
          </div>
          <small>Recorded events</small>
        </div>

        <div className="stat-card">
          <h3>Findings Linked</h3>
          <div className="stat-value">
            {loading ? "--" : findingsLinked}
          </div>
          <small>Events linked to findings</small>
        </div>

        <div className="stat-card">
          <h3>High Priority</h3>
          <div className="stat-value">
            {loading
              ? "--"
              : String(highPriorityEvents).padStart(2, "0")}
          </div>
          <small>Events requiring review</small>
        </div>

        <div className="stat-card">
          <h3>Time Range</h3>
          <div className="stat-value">
            {loading ? "--" : getTimeRange()}
          </div>
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


        {/* ERROR */}
        {error && (
          <div className="investigation-note">
            <strong>Timeline Error:</strong>{" "}
            {error}
          </div>
        )}


        {/* LOADING */}
        {loading && !error && (
          <div className="investigation-note">
            Loading investigation timeline...
          </div>
        )}


        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          mappedEvents.length === 0 && (
            <div className="investigation-note">
              <strong>No timeline events found.</strong>{" "}
              Timeline events will appear here when forensic
              activity is recorded for this case.
            </div>
          )}


        {/* TIMELINE */}
        {!loading &&
          mappedEvents.length > 0 && (
            <div className="forensic-timeline">

              {mappedEvents.map((event) => (

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
                        {event.displayId}
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
          )}

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
                  {selectedEvent.displayId}
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
                    {selectedEvent.displayId}
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