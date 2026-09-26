from fastapi import APIRouter, Depends

from database.mongodb import assessments_collection

from dependencies.auth import get_current_user

from schemas.dashboard import (
    DashboardSummaryResponse,
    LatestAssessment,
    GlobalShapResponse,
)

from services.global_shap_service import get_global_shap


router = APIRouter()


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_dashboard_summary(
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["user_id"]

    total_assessments = assessments_collection.count_documents(
        {"user_id": user_id}
    )

    high_risk = assessments_collection.count_documents(
        {
            "user_id": user_id,
            "prediction.prediction": 1,
        }
    )

    low_risk = assessments_collection.count_documents(
        {
            "user_id": user_id,
            "prediction.prediction": 0,
        }
    )

    latest = assessments_collection.find_one(
        {"user_id": user_id},
        {
            "created_at": 1,
            "prediction": 1,
        },
        sort=[("created_at", -1)],
    )

    latest_assessment = None

    if latest:
        prediction = latest.get("prediction", {})

        latest_assessment = LatestAssessment(
            id=str(latest["_id"]),
            created_at=latest["created_at"].isoformat(),
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

    return {
        "total_assessments": total_assessments,
        "high_risk": high_risk,
        "low_risk": low_risk,
        "latest_assessment": latest_assessment,
    }


@router.get(
    "/model-insights",
    response_model=GlobalShapResponse,
)
def get_model_insights(
    current_user: dict = Depends(get_current_user),
):
    features = get_global_shap()

    return {
        "features": features
    }