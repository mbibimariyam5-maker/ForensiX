from fastapi import FastAPI
from schemas import Finding, Explanation
from explanation import generate_explanation


app = FastAPI(
    title="ForensiX AI Engine",
    description="AI-assisted explanation engine for forensic findings",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "service": "ForensiX AI Engine",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/ai/explain", response_model=Explanation)
def explain_finding(finding: Finding):
    return generate_explanation(finding)