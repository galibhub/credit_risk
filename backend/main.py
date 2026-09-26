from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import (
    connect_to_mongodb,
    close_mongodb_connection,
)

from routes.auth import router as auth_router
from routes.assessment import router as assessment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Application startup
    connect_to_mongodb()

    yield

    # Application shutdown
    close_mongodb_connection()


app = FastAPI(
    title="Explainable Credit Risk Assessment API",
    description=(
        "Backend API for credit risk prediction, "
        "SHAP explanations, dashboards, and assessments."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Authentication routes
app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


# Assessment routes
app.include_router(
    assessment_router,
    prefix="/api/v1/assessment",
    tags=["Assessment"],
)


@app.get("/")
def root():
    return {
        "message": "Explainable Credit Risk Assessment API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "credit-risk-api"
    }