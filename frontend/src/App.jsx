import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Evidence from "./pages/Evidence";
import Findings from "./pages/Findings";
import TimelinePage from "./pages/TimelinePage";
import AIExplanation from "./pages/AIExplanation";
import Reports from "./pages/Reports";

import Sidebar from "./components/Sidebar";

import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {

      case "evidence":
        return <Evidence />;

      case "findings":
        return <Findings />;

      case "timeline":
        return <TimelinePage />;

      case "ai":
        return <AIExplanation />;

      case "reports":
        return <Reports />;

      case "dashboard":
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        {renderPage()}
      </main>

    </div>
  );
}

export default App;