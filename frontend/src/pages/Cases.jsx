import { useEffect, useState } from "react";
import { createCase, getCases, getSelectedCaseId, setSelectedCase } from "../services/api";

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState(getSelectedCaseId());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    case_id: "",
    case_name: "",
    description: "",
  });

  async function loadCases() {
    try {
      setLoading(true);
      setError("");

      const response = await getCases(true);
      setCases(response.cases || []);
    } catch (err) {
      console.error("Cases API error:", err);
      setError(err.message || "Failed to load cases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setFormData({
      case_id: "",
      case_name: "",
      description: "",
    });
  }

  function handleSelectCase(caseId) {
    setSelectedCase(caseId);
    setSelectedCaseId(caseId);
    setMessage(`Selected ${caseId} for investigation.`);
    setError("");

    window.location.reload();
  }

  async function handleCreate(event) {
    event.preventDefault();

    if (!formData.case_id.trim() || !formData.case_name.trim()) {
      setError("Case ID and Case Name are required.");
      return;
    }

    try {
      setCreating(true);
      setError("");
      setMessage("");

      const response = await createCase(formData);
      const newCase = response.case;

      setCases((current) => [newCase, ...current]);
      setSelectedCase(newCase.case_id);
      setSelectedCaseId(newCase.case_id);
      setMessage("Case created and selected for investigation.");
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Create case error:", err);
      setError(err.message || "Failed to create case.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Case Management</h1>
          <p>Manage investigations and select the case you want to work on.</p>
        </div>

        <button
          type="button"
          className="nav-item active"
          style={{ width: "auto", margin: 0, padding: "10px 14px" }}
          onClick={() => {
            setShowForm(true);
            setError("");
            setMessage("");
          }}
        >
          <span>+</span>
          New Case
        </button>
      </div>

      {message && (
        <div className="integrity-box" style={{ marginTop: 0, marginBottom: "18px" }}>
          <div className="integrity-top">
            <span>Case Management</span>
            <strong>{message}</strong>
          </div>
        </div>
      )}

      {error && (
        <div className="section-card" style={{ marginBottom: "18px" }}>
          <p style={{ margin: 0, color: "#f87171", fontSize: "11px" }}>{error}</p>
        </div>
      )}

      {showForm && (
        <div className="section-card" style={{ marginBottom: "18px" }}>
          <div className="section-header">
            <h2>Create New Investigation</h2>
            <span>NEW CASE</span>
          </div>

          <form onSubmit={handleCreate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "7px", color: "#8290a0", fontSize: "10px" }}>
                Case ID
                <input
                  name="case_id"
                  value={formData.case_id}
                  onChange={handleChange}
                  placeholder="CASE-2026-002"
                  disabled={creating}
                  style={{ padding: "10px 12px", background: "#141e29", border: "1px solid #303d4d", borderRadius: "7px", color: "#e5e7eb", outline: "none" }}
                />
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: "7px", color: "#8290a0", fontSize: "10px" }}>
                Case Name
                <input
                  name="case_name"
                  value={formData.case_name}
                  onChange={handleChange}
                  placeholder="Example Investigation"
                  disabled={creating}
                  style={{ padding: "10px 12px", background: "#141e29", border: "1px solid #303d4d", borderRadius: "7px", color: "#e5e7eb", outline: "none" }}
                />
              </label>
            </div>

            <label style={{ display: "flex", flexDirection: "column", gap: "7px", marginTop: "14px", color: "#8290a0", fontSize: "10px" }}>
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the investigation"
                rows="4"
                disabled={creating}
                style={{ resize: "vertical", padding: "10px 12px", background: "#141e29", border: "1px solid #303d4d", borderRadius: "7px", color: "#e5e7eb", outline: "none", fontFamily: "inherit" }}
              />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "9px", marginTop: "16px" }}>
              <button
                type="button"
                className="nav-item"
                style={{ width: "auto", margin: 0, padding: "9px 13px" }}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                  setError("");
                }}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="nav-item active"
                style={{ width: "auto", margin: 0, padding: "9px 13px" }}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Case"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="section-card">
        <div className="section-header">
          <h2>Investigations</h2>
          <span>{cases.length} CASES</span>
        </div>

        {loading ? (
          <p style={{ margin: 0, color: "#8491a0", fontSize: "10px" }}>Loading cases...</p>
        ) : cases.length === 0 ? (
          <div className="finding-card">
            <div className="finding-content">
              <h3>No cases available</h3>
              <p>Create your first investigation using New Case.</p>
            </div>
          </div>
        ) : (
          <div className="findings-list">
            {cases.map((item) => {
              const isSelected = selectedCaseId === item.case_id;

              return (
                <div
                  className="finding-card"
                  key={item.case_id}
                  onClick={() => handleSelectCase(item.case_id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="severity medium">{item.status || "OPEN"}</span>

                  <div className="finding-content">
                    <h3>{item.case_name}</h3>
                    <p>{item.case_id} • Created {item.created_at ? new Date(item.created_at).toLocaleString() : "--"}</p>
                  </div>

                  <button
                    type="button"
                    className={`nav-item ${isSelected ? "active" : ""}`}
                    style={{ width: "auto", margin: 0, padding: "8px 12px" }}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleSelectCase(item.case_id);
                    }}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Cases;
