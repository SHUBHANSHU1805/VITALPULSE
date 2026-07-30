import numpy as np
import pandas as pd

def generate_synthetic_clinical_dataset(num_samples: int = 1000) -> pd.DataFrame:
    """
    Generates a realistic synthetic clinical patient dataset for training the ML risk scoring model.
    """
    np.random.seed(42)

    ages = np.random.randint(18, 90, size=num_samples)
    heart_rates = np.random.normal(loc=78, scale=18, size=num_samples).clip(45, 175)
    bp_systolics = np.random.normal(loc=125, scale=20, size=num_samples).clip(85, 210)
    bp_diastolics = np.random.normal(loc=80, scale=12, size=num_samples).clip(50, 130)
    spo2_levels = np.random.normal(loc=97, scale=3, size=num_samples).clip(80, 100)
    temperatures = np.random.normal(loc=36.8, scale=0.8, size=num_samples).clip(35.0, 41.0)

    # Compute continuous risk score based on physiological severity
    risk_score = (
        (ages > 65) * 15 +
        (heart_rates > 100) * 25 +
        (heart_rates < 55) * 20 +
        (bp_systolics > 140) * 20 +
        (bp_systolics < 90) * 30 +
        (spo2_levels < 92) * 35 +
        (temperatures > 38.5) * 20
    )

    # Add random clinical noise
    risk_score = (risk_score + np.random.normal(0, 5, num_samples)).clip(0, 100)

    df = pd.DataFrame({
        'age': ages,
        'heartRate': np.round(heart_rates, 1),
        'bpSystolic': np.round(bp_systolics, 1),
        'bpDiastolic': np.round(bp_diastolics, 1),
        'spo2': np.round(spo2_levels, 1),
        'temperature': np.round(temperatures, 1),
        'riskScore': np.round(risk_score, 1)
    })

    return df

if __name__ == "__main__":
    df = generate_synthetic_clinical_dataset(500)
    df.to_csv("synthetic_patient_data.csv", index=False)
    print(f"Generated {len(df)} synthetic clinical records.")
