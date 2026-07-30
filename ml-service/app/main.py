from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.risk_model import risk_predictor
from app.services.nlp_service import summarize_clinical_report
from app.utils.data_generator import generate_synthetic_clinical_dataset

app = FastAPI(
    title="Nightingale AI Risk & Diagnostics Microservice",
    version="1.0.0",
    description="Predictive risk scoring, SHAP explainability, and clinical report NLP processing"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VitalsRiskRequest(BaseModel):
    patientId: Optional[str] = "P-101"
    age: float = Field(..., ge=0, le=120)
    heartRate: float = Field(..., ge=20, le=250)
    bpSystolic: float = Field(..., ge=40, le=260)
    bpDiastolic: float = Field(..., ge=20, le=160)
    spo2: float = Field(..., ge=50, le=100)
    temperature: float = Field(..., ge=30, le=45)

class ReportSummaryRequest(BaseModel):
    text: str

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Nightingale ML Risk API",
        "model_trained": risk_predictor.is_trained
    }

@app.post("/predict-risk")
def predict_clinical_risk(payload: VitalsRiskRequest):
    try:
        res = risk_predictor.predict(
            age=payload.age,
            heart_rate=payload.heartRate,
            bp_systolic=payload.bpSystolic,
            bp_diastolic=payload.bpDiastolic,
            spo2=payload.spo2,
            temperature=payload.temperature
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-report")
def analyze_report(payload: ReportSummaryRequest):
    try:
        summary = summarize_clinical_report(payload.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/generate-data")
def get_synthetic_data(count: int = 100):
    df = generate_synthetic_clinical_dataset(count)
    return df.to_dict(orient="records")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
