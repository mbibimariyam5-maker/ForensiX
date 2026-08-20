const API_BASE_URL = '/api';

const SELECTED_CASE_KEY = 'forensix_selected_case';

export function setSelectedCase(caseId) {
  if (caseId) {
    localStorage.setItem(SELECTED_CASE_KEY, caseId);
  } else {
    localStorage.removeItem(SELECTED_CASE_KEY);
  }
}

export function getSelectedCaseId() {
  return localStorage.getItem(SELECTED_CASE_KEY);
}

// Create a new case
export async function createCase(caseData) {
  const response = await fetch(`${API_BASE_URL}/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      case_id: caseData.case_id,
      case_name: caseData.case_name,
      description: caseData.description || '',
    }),
  });

  if (!response.ok) {
    let message = `Failed to create case: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

// Get cases. By default, return the currently selected case for investigation pages.
// Pass true when the full case list is needed, such as on the Cases page.
export async function getCases(allCases = false) {
  const response = await fetch(`${API_BASE_URL}/cases`);

  if (!response.ok) {
    throw new Error(`Failed to fetch cases: ${response.status}`);
  }

  const data = await response.json();

  if (allCases) {
    return data;
  }

  const cases = data.cases || [];
  const selectedCaseId = getSelectedCaseId();

  if (!selectedCaseId) {
    return data;
  }

  const selectedCase = cases.find(
    (item) => item.case_id === selectedCaseId
  );

  if (!selectedCase) {
    return data;
  }

  return {
    ...data,
    cases: [selectedCase],
    count: 1,
  };
}

// Get one case by case ID
export async function getCase(caseId) {
  const response = await fetch(`${API_BASE_URL}/cases/${caseId}`);

  if (!response.ok) {
    let message = `Failed to fetch case: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

// Get evidence for a specific case
export async function getCaseEvidence(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/evidence`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch evidence: ${response.status}`);
  }

  return response.json();
}

// Upload actual evidence file
export async function uploadEvidence(caseId, file) {
  const formData = new FormData();

  formData.append('case_id', caseId);
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/evidence/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    let message = `Failed to upload evidence: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

// Verify evidence integrity
export async function verifyEvidence(evidenceId) {
  const response = await fetch(
    `${API_BASE_URL}/evidence/${evidenceId}/verify`,
    {
      method: 'POST',
    }
  );

  if (!response.ok) {
    let message = `Failed to verify evidence: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

// Get findings for a specific case
export async function getCaseFindings(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/findings`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch findings: ${response.status}`);
  }

  return response.json();
}

// Get timeline events for a specific case
export async function getCaseTimeline(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/timeline`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch timeline: ${response.status}`);
  }

  return response.json();
}

// Get AI explanation for a complete finding
export async function getAIExplanation(finding) {
  const response = await fetch(`${API_BASE_URL}/ai/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      finding_id: finding.finding_id,
      case_id: finding.case_id,
      artifact: finding.artifact,
      type: finding.type,
      severity: finding.severity,
      score: finding.score,
      timestamp: finding.timestamp,
      reasons: finding.reasons || [],
      source: finding.source,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to get AI explanation: ${response.status}`
    );
  }

  return response.json();
}

export async function exportCaseReportPDF(caseId) {
  const response = await fetch(
    `${API_BASE_URL}/cases/${caseId}/report/pdf`
  );

  if (!response.ok) {
    let message = `Failed to export PDF: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${caseId}-forensic-report.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
