from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"


MODEL_PATH = MODEL_DIR / "credit_risk_model.pkl"
THRESHOLD_PATH = MODEL_DIR / "best_threshold.pkl"


model = joblib.load(MODEL_PATH)
best_threshold = float(joblib.load(THRESHOLD_PATH))


def predict_credit_risk(data: dict) -> dict:
    df = pd.DataFrame([data])

    probability = float(model.predict_proba(df)[0][1])

    prediction = int(probability >= best_threshold)

    risk = "High Risk" if prediction == 1 else "Low Risk"

    return {
        "probability": probability,
        "threshold": best_threshold,
        "prediction": prediction,
        "risk": risk,
    }