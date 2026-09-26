from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "best_xgb_pipeline.pkl"
DATA_PATH = BASE_DIR / "data" / "credit_risk_dataset.csv"


pipeline = joblib.load(MODEL_PATH)

preprocessor = pipeline.named_steps["preprocessor"]
xgb_classifier = pipeline.named_steps["classifier"]

explainer = shap.TreeExplainer(xgb_classifier)


@lru_cache(maxsize=1)
def get_global_shap() -> list[dict]:
    df = pd.read_csv(DATA_PATH)

    X = df.drop(columns=["loan_status"])
    y = df["loan_status"]

    _, X_test, _, _ = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    X_test_transformed = preprocessor.transform(X_test)

    # Convert sparse matrix to dense matrix if necessary
    if hasattr(X_test_transformed, "toarray"):
        X_test_transformed = X_test_transformed.toarray()

    feature_names = preprocessor.get_feature_names_out()

    shap_values = explainer.shap_values(X_test_transformed)

    if isinstance(shap_values, list):
        shap_values = shap_values[0]

    mean_abs_shap = np.mean(
        np.abs(shap_values),
        axis=0,
    )

    mean_shap = np.mean(
        shap_values,
        axis=0,
    )

    results = []

    for feature, abs_value, mean_value in zip(
        feature_names,
        mean_abs_shap,
        mean_shap,
    ):
        results.append(
            {
                "feature": str(feature),
                "mean_abs_shap": float(abs_value),
                "mean_shap": float(mean_value),
            }
        )

    results.sort(
        key=lambda item: item["mean_abs_shap"],
        reverse=True,
    )

    return results[:10]