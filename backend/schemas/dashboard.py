from pydantic import BaseModel


class LatestAssessment(BaseModel):
    id: str
    created_at: str
    probability: float
    threshold: float
    prediction: int
    risk: str


class DashboardSummaryResponse(BaseModel):
    total_assessments: int
    high_risk: int
    low_risk: int
    latest_assessment: LatestAssessment | None


class GlobalShapItem(BaseModel):
    feature: str
    mean_abs_shap: float
    mean_shap: float


class GlobalShapResponse(BaseModel):
    features: list[GlobalShapItem]