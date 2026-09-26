import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

from database.mongodb import users_collection


# Load environment variables from .env
load_dotenv()


# Password hashing
password_hash = PasswordHash.recommended()


# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

JWT_ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

JWT_EXPIRE_MINUTES = int(
    os.getenv(
        "JWT_EXPIRE_MINUTES",
        "60"
    )
)


# Make sure JWT secret exists
if not JWT_SECRET_KEY:
    raise ValueError(
        "JWT_SECRET_KEY is missing from the .env file"
    )


# ============================================================
# Password Hashing
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash a plain-text password.
    """

    return password_hash.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    """
    Verify a plain-text password against
    the stored password hash.
    """

    return password_hash.verify(
        password,
        hashed_password
    )


# ============================================================
# JWT
# ============================================================

def create_access_token(
    user_id: str,
    role: str
) -> str:
    """
    Create a JWT access token.
    """

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=JWT_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )

    return token


# ============================================================
# Register User
# ============================================================

def create_user(
    name: str,
    email: str,
    password: str
):
    """
    Create a new user account.
    Publicly registered users always get the 'user' role.
    """

    email = email.strip().lower()

    # Check whether the email already exists
    existing_user = users_collection.find_one(
        {
            "email": email
        }
    )

    if existing_user:
        raise ValueError(
            "User with this email already exists"
        )

    # Create user document
    user = {
        "name": name.strip(),
        "email": email,
        "password_hash": hash_password(password),
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }

    # Save user to MongoDB
    result = users_collection.insert_one(user)

    return {
        "id": str(result.inserted_id),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }


# ============================================================
# Login User
# ============================================================

def authenticate_user(
    email: str,
    password: str
):
    """
    Verify user credentials and return
    a JWT access token.
    """

    email = email.strip().lower()

    # Find user
    user = users_collection.find_one(
        {
            "email": email
        }
    )

    if not user:
        return None

    # Verify password
    password_is_valid = verify_password(
        password,
        user["password_hash"]
    )

    if not password_is_valid:
        return None

    # Create JWT
    access_token = create_access_token(
        user_id=str(user["_id"]),
        role=user["role"]
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }