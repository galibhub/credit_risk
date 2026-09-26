import os

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi


# Load environment variables from .env
load_dotenv()


# Read MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv(
    "MONGODB_DATABASE",
    "credit_risk_db"
)


# Check MongoDB URI
if not MONGODB_URI:
    raise ValueError(
        "MONGODB_URI is missing from the .env file"
    )


# Create MongoDB client
client = MongoClient(
    MONGODB_URI,
    server_api=ServerApi("1")
)


# Select database
db = client[MONGODB_DATABASE]


# Select collections
users_collection = db["users"]
assessments_collection = db["assessments"]


def connect_to_mongodb():
    """Check MongoDB connection."""

    client.admin.command("ping")

    print("MongoDB connected successfully!")


def close_mongodb_connection():
    """Close MongoDB connection."""

    client.close()

    print("MongoDB connection closed.")