from pathlib import Path

import joblib
import pandas as pd
import shap


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

PIPELINE_PATH = MODEL_DIR / "best_xgb_pipeline.pkl"


# Load the trained XGBoost pipeline
best_xgb_pipeline = joblib.load(PIPELINE_PATH)

# Extract preprocessing and classifier
preprocessor = best_xgb_pipeline.named_steps["preprocessor"]
xgb_classifier = best_xgb_pipeline.named_steps["classifier"]

# Create SHAP TreeExplainer
explainer = shap.TreeExplainer(xgb_classifier)


def explain_prediction(data: dict) -> list[dict]:
    """
    Generate SHAP explanations for a single applicant.
    """

    # Convert input dictionary to DataFrame
    df = pd.DataFrame([data])

    # Apply the same preprocessing used during training
    transformed_data = preprocessor.transform(df)

    # Calculate SHAP values
    shap_values = explainer.shap_values(transformed_data)

    # Handle possible list output
    if isinstance(shap_values, list):
        shap_values = shap_values[0]

    # Extract SHAP values for the single applicant
    shap_values = shap_values[0]

    # Get transformed feature names
    feature_names = preprocessor.get_feature_names_out()

    explanations = []

    for feature_name, shap_value in zip(
        feature_names,
        shap_values
    ):
        explanations.append(
            {
                "feature": str(feature_name),
                "shap_value": float(shap_value),
            }
        )

    # Sort by absolute SHAP impact
    explanations.sort(
        key=lambda item: abs(item["shap_value"]),
        reverse=True,
    )

    # Return top 10 influential features
    return explanations[:10]