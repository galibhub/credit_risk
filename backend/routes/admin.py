from fastapi import APIRouter, Depends, Query

from database.mongodb import (
    users_collection,
    assessments_collection,
)
from dependencies.auth import require_admin

from schemas.admin import (
    AdminUserItem,
    AdminUsersResponse,
    AdminAssessmentItem,
    AdminAssessmentsResponse,
    AdminStatsResponse,
)


router = APIRouter()


@router.get(
    "/users",
    response_model=AdminUsersResponse,
)
def get_all_users(
    admin: dict = Depends(require_admin),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    total = users_collection.count_documents({})

    cursor = (
        users_collection
        .find(
            {},
            {
                "name": 1,
                "email": 1,
                "role": 1,
                "created_at": 1,
            },
        )
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    users = []

    for user in cursor:
        users.append(
            AdminUserItem(
                id=str(user["_id"]),
                name=user["name"],
                email=user["email"],
                role=user["role"],
                created_at=user["created_at"].isoformat(),
            )
        )

    return {
        "users": users,
        "total": total,
    }


@router.get(
    "/assessments",
    response_model=AdminAssessmentsResponse,
)
def get_all_assessments(
    admin: dict = Depends(require_admin),
    limit: int = Query(default=20, ge=1, le=100),
    skip: int = Query(default=0, ge=0),
):
    total = assessments_collection.count_documents({})

    cursor = (
        assessments_collection
        .find(
            {},
            {
                "user_id": 1,
                "created_at": 1,
                "prediction": 1,
            },
        )
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )

    assessments = []

    for assessment in cursor:
        prediction = assessment.get("prediction", {})

        assessments.append(
            AdminAssessmentItem(
                id=str(assessment["_id"]),
                user_id=assessment["user_id"],
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
    "/stats",
    response_model=AdminStatsResponse,
)
def get_admin_stats(
    admin: dict = Depends(require_admin),
):
    total_users = users_collection.count_documents({})

    total_assessments = assessments_collection.count_documents({})

    high_risk = assessments_collection.count_documents(
        {"prediction.prediction": 1}
    )

    low_risk = assessments_collection.count_documents(
        {"prediction.prediction": 0}
    )

    return {
        "total_users": total_users,
        "total_assessments": total_assessments,
        "high_risk_assessments": high_risk,
        "low_risk_assessments": low_risk,
    }