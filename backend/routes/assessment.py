from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status

from database.mongodb import assessments_collection
from dependencies.auth import get_current_user
from schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    AssessmentHistoryItem,
    AssessmentHistoryResponse,
    AssessmentDetailResponse,
)
from services.model_service import predict_credit_risk
from services.shap_service import explain_prediction


router = APIRouter()


@router.post(
    "/predict",
    response_model=PredictionResponse,
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


@router.get(
    "/history",
    response_model=AssessmentHistoryResponse,
)
def get_assessment_history(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    user_id = current_user["user_id"]

    total = assessments_collection.count_documents(
        {"user_id": user_id}
    )

    assessments_cursor = (
        assessments_collection
        .find(
            {"user_id": user_id},
            {
                "created_at": 1,
                "prediction": 1,
            },
        )
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    assessments = []

    for assessment in assessments_cursor:
        prediction = assessment.get("prediction", {})

        assessments.append(
            AssessmentHistoryItem(
                id=str(assessment["_id"]),
                created_at=assessment["created_at"].isoformat(),
                probability=float(
                    prediction.get("probability", 0)
                ),
                threshold=float(
                    prediction.get("threshold", 0)
                ),
                prediction=int(
                    prediction.get("prediction", 0)
                ),
                risk=str(
                    prediction.get("risk", "")
                ),
            )
        )

    return {
        "assessments": assessments,
        "total": total,
    }


@router.get(
    "/{assessment_id}",
    response_model=AssessmentDetailResponse,
)
def get_assessment_detail(
    assessment_id: str,
    current_user: dict = Depends(get_current_user),
):
    if not ObjectId.is_valid(assessment_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assessment ID",
        )

    assessment = assessments_collection.find_one(
        {
            "_id": ObjectId(assessment_id),
            "user_id": current_user["user_id"],
        }
    )

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found",
        )

    return {
        "id": str(assessment["_id"]),
        "user_id": assessment["user_id"],
        "created_at": assessment["created_at"].isoformat(),
        "input": assessment.get("input", {}),
        "prediction": assessment.get("prediction", {}),
        "shap": assessment.get("shap", []),
    }