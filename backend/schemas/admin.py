from pydantic import BaseModel


class AdminUserItem(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str


class AdminUsersResponse(BaseModel):
    users: list[AdminUserItem]
    total: int


class AdminAssessmentItem(BaseModel):
    id: str
    user_id: str
    created_at: str
    probability: float
    threshold: float
    prediction: int
    risk: str


class AdminAssessmentsResponse(BaseModel):
    assessments: list[AdminAssessmentItem]
    total: int


class AdminStatsResponse(BaseModel):
    total_users: int
    total_assessments: int
    high_risk_assessments: int
    low_risk_assessments: int