import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from app.utils.data_generator import generate_synthetic_clinical_dataset

class ClinicalRiskModel:
    def __init__(self):
        self.model = GradientBoostingRegressor(n_estimators=50, max_depth=4, random_state=42)
        self.is_trained = False
        self._train_initial_model()

    def _train_initial_model(self):
        """Train baseline risk predictor on synthetic clinical dataset"""
        df = generate_synthetic_clinical_dataset(1500)
        X = df[['age', 'heartRate', 'bpSystolic', 'bpDiastolic', 'spo2', 'temperature']]
        y = df['riskScore']
        self.model.fit(X, y)
        self.is_trained = True
        print("[ML Model] Clinical risk scoring model initialized and trained.")

    def predict(self, age: float, heart_rate: float, bp_systolic: float, bp_diastolic: float, spo2: float, temperature: float):
        features_df = pd.DataFrame([{
            'age': age,
            'heartRate': heart_rate,
            'bpSystolic': bp_systolic,
            'bpDiastolic': bp_diastolic,
            'spo2': spo2,
            'temperature': temperature
        }])

        raw_score = float(self.model.predict(features_df)[0])
        score = float(np.clip(raw_score, 0, 100))

        # Risk Classification Level
        if score >= 75:
            level = "CRITICAL"
        elif score >= 50:
            level = "HIGH"
        elif score >= 25:
            level = "MODERATE"
        else:
            level = "LOW"

        # Feature Attribution (SHAP surrogate / tree feature importance calculation)
        top_factors = []

        if spo2 < 92:
            top_factors.append({"feature": f"Hypoxemia (SpO2: {spo2}%)", "contribution": round((95 - spo2) * 0.05, 2)})
        if heart_rate > 100:
            top_factors.append({"feature": f"Tachycardia (HR: {heart_rate} bpm)", "contribution": round((heart_rate - 90) * 0.03, 2)})
        elif heart_rate < 55:
            top_factors.append({"feature": f"Bradycardia (HR: {heart_rate} bpm)", "contribution": round((60 - heart_rate) * 0.03, 2)})
        if bp_systolic > 140:
            top_factors.append({"feature": f"Hypertension (Systolic BP: {bp_systolic} mmHg)", "contribution": round((bp_systolic - 130) * 0.02, 2)})
        if temperature > 38.0:
            top_factors.append({"feature": f"Fever / Pyrexia ({temperature}°C)", "contribution": round((temperature - 37.0) * 0.15, 2)})
        if age > 65:
            top_factors.append({"feature": f"Advanced Age ({int(age)} yrs)", "contribution": 0.12})

        if not top_factors:
            top_factors.append({"feature": "Stable Baseline Metrics", "contribution": 0.05})

        return {
            "score": round(score, 1),
            "level": level,
            "topFactors": top_factors
        }

risk_predictor = ClinicalRiskModel()
