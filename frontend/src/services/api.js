const API_BASE_URL = '/api';

// Get all cases
export async function getCases() {
  const response = await fetch(`${API_BASE_URL}/cases`);

  if (!response.ok) {
    throw new Error(`Failed to fetch cases: ${response.status}`);
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