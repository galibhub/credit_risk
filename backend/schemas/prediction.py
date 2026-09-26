from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    person_age: int = Field(..., ge=18)
    person_income: float = Field(..., gt=0)
    person_emp_length: float | None = Field(default=None, ge=0)

    loan_amnt: float = Field(..., gt=0)
    loan_int_rate: float | None = Field(default=None, ge=0)
    loan_percent_income: float = Field(..., ge=0)

    cb_person_cred_hist_length: float = Field(..., ge=0)

    person_home_ownership: str
    loan_intent: str
    loan_grade: str
    cb_person_default_on_file: str


class PredictionResponse(BaseModel):
    probability: float
    threshold: float
    prediction: int
    risk: str
    shap: list[dict]


class AssessmentHistoryItem(BaseModel):
    id: str
    created_at: str
    probability: float
    threshold: float
    prediction: int
    risk: str


class AssessmentHistoryResponse(BaseModel):
    assessments: list[AssessmentHistoryItem]
    total: int


class AssessmentDetailResponse(BaseModel):
    id: str
    user_id: str
    created_at: str
    input: dict
    prediction: dict
    shap: list[dict]