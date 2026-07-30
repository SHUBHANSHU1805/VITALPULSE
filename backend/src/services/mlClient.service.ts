import { env } from '../config/env';

export interface MLRiskRequest {
  patientId: string;
  age: number;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  spo2: number;
  temperature: number;
}

export interface MLRiskResponse {
  score: number;
  level: string;
  topFactors: { feature: string; contribution: number }[];
}

export const getMLRiskScore = async (vitals: MLRiskRequest): Promise<MLRiskResponse> => {
  try {
    const response = await fetch(`${env.ML_SERVICE_URL}/predict-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitals),
    });

    if (response.ok) {
      return (await response.json()) as MLRiskResponse;
    }
  } catch (err) {
    console.warn('ML Service offline, using fallback clinical heuristic scoring logic');
  }

  // Fallback Rule-Based Clinical Heuristic
  let score = 15;
  const factors: { feature: string; contribution: number }[] = [];

  if (vitals.heartRate > 110) {
    score += 30;
    factors.push({ feature: 'Severe Tachycardia (HR > 110 bpm)', contribution: 0.35 });
  } else if (vitals.heartRate > 90) {
    score += 15;
    factors.push({ feature: 'Mild Tachycardia (HR > 90 bpm)', contribution: 0.18 });
  }

  if (vitals.spo2 < 92) {
    score += 35;
    factors.push({ feature: 'Hypoxemia (SpO2 < 92%)', contribution: 0.40 });
  } else if (vitals.spo2 < 95) {
    score += 15;
    factors.push({ feature: 'Borderline SpO2 Desaturation', contribution: 0.20 });
  }

  if (vitals.bpSystolic > 140 || vitals.bpDiastolic > 90) {
    score += 20;
    factors.push({ feature: 'Hypertension (Systolic > 140)', contribution: 0.25 });
  }

  if (vitals.temperature > 38.5) {
    score += 15;
    factors.push({ feature: 'Pyrexia / Fever (> 38.5°C)', contribution: 0.15 });
  }

  score = Math.min(Math.max(score, 5), 98);
  let level = 'LOW';
  if (score >= 75) level = 'CRITICAL';
  else if (score >= 50) level = 'HIGH';
  else if (score >= 25) level = 'MODERATE';

  return {
    score,
    level,
    topFactors: factors.length > 0 ? factors : [{ feature: 'Baseline Stable Metrics', contribution: 0.05 }],
  };
};

export const summarizeDiagnosticText = async (text: string): Promise<string> => {
  try {
    const response = await fetch(`${env.ML_SERVICE_URL}/analyze-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const data = (await response.json()) as { summary: string };
      return data.summary;
    }
  } catch (err) {
    console.warn('ML NLP summarizer offline, returning basic summary');
  }

  return `Parsed Clinical Report Summary: ${text.slice(0, 180)}...`;
};
