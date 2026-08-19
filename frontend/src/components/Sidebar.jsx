function Sidebar({ activePage, setActivePage }) {
  const handleNavigation = (page) => {
    setActivePage(page);
  };

  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="logo">

        <div className="logo-mark">
          F
        </div>

        <div>
          <h2>FORENSIX</h2>
          <span>AI INVESTIGATION</span>
        </div>

      </div>


      {/* NAVIGATION */}
      <nav className="navigation">

        <p className="nav-title">
          INVESTIGATION
        </p>


        {/* DASHBOARD */}
        <button
          className={`nav-item ${
            activePage === "dashboard" ? "active" : ""
          }`}
          onClick={() => handleNavigation("dashboard")}
        >
          <span>▣</span>
          Dashboard
        </button>


        {/* EVIDENCE */}
        <button
          className={`nav-item ${
            activePage === "evidence" ? "active" : ""
          }`}
          onClick={() => handleNavigation("evidence")}
        >
          <span>◈</span>
          Evidence
        </button>


        {/* FINDINGS */}
        <button
          className={`nav-item ${
            activePage === "findings" ? "active" : ""
          }`}
          onClick={() => handleNavigation("findings")}
        >
          <span>⚠</span>
          Findings
        </button>


        {/* AI EXPLANATION */}
        <button
          className={`nav-item ${
            activePage === "ai" ? "active" : ""
          }`}
          onClick={() => handleNavigation("ai")}
        >
          <span>✦</span>
          AI Explanation
        </button>


        {/* TIMELINE */}
        <button
          className={`nav-item ${
            activePage === "timeline" ? "active" : ""
          }`}
          onClick={() => handleNavigation("timeline")}
        >
          <span>◷</span>
          Timeline
        </button>


        {/* REPORTS */}
        <button
          className={`nav-item ${
            activePage === "reports" ? "active" : ""
          }`}
          onClick={() => handleNavigation("reports")}
        >
          <span>▤</span>
          Reports
        </button>

      </nav>


      {/* SYSTEM STATUS */}
      <div className="sidebar-bottom">

        <p className="nav-title">
          SYSTEM
        </p>

        <div className="system-status">

          <span className="status-dot"></span>

          <div>
            <strong>
              System Online
            </strong>

            <small>
              All services operational
            </small>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;