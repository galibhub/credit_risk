from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from database.mongodb import users_collection
from dependencies.auth import get_current_user
from schemas.auth import RegisterRequest, LoginRequest
from services.auth_service import (
    create_user,
    authenticate_user,
)


router = APIRouter()


# ============================================================
# Register
# ============================================================

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED
)
def register(data: RegisterRequest):
    """
    Create a new user account.
    """

    try:
        user = create_user(
            name=data.name,
            email=data.email,
            password=data.password,
        )

        return {
            "message": "Registration successful",
            "user": user,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


# ============================================================
# Login
# ============================================================

@router.post("/login")
def login(data: LoginRequest):
    """
    Authenticate user and return JWT access token.
    """

    result = authenticate_user(
        email=data.email,
        password=data.password,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return result


# ============================================================
# Current User
# ============================================================

@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user)
):
    """
    Return the currently authenticated user's information.
    """

    try:
        user = users_collection.find_one(
            {
                "_id": ObjectId(
                    current_user["user_id"]
                )
            }
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }