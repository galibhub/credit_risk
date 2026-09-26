from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from database.mongodb import assessments_collection
from dependencies.auth import get_current_user
from schemas.prediction import PredictionRequest, PredictionResponse
from services.model_service import predict_credit_risk
from services.shap_service import explain_prediction


router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(
    data: PredictionRequest,
    current_user: dict = Depends(get_current_user),
):
    input_data = data.model_dump()

    prediction_result = predict_credit_risk(input_data)

    shap_result = explain_prediction(input_data)

    assessment = {
        "user_id": current_user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "input": input_data,
        "prediction": prediction_result,
        "shap": shap_result,
    }

    assessments_collection.insert_one(assessment)

    return {
        **prediction_result,
        "shap": shap_result,
    }