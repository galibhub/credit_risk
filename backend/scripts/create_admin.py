from getpass import getpass
from datetime import datetime, timezone

from database.mongodb import users_collection
from services.auth_service import hash_password


def main():
    email = input("Admin email: ").strip().lower()

    existing = users_collection.find_one(
        {"email": email}
    )

    if existing:
        if existing.get("role") == "admin":
            print("This account is already an admin.")
            return

        confirmation = input(
            "Existing account found. "
            "Type PROMOTE to make it admin: "
        )

        if confirmation != "PROMOTE":
            print("Cancelled.")
            return

        users_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"role": "admin"}},
        )

        print("Existing account promoted to admin.")
        print("Login again to get an admin token.")
        return

    name = input("Admin name: ").strip()
    password = getpass("Admin password: ")

    if not name or not email or len(password) < 8:
        print("Name and email are required; password must be at least 8 characters.")
        return

    user = {
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
    }

    users_collection.insert_one(user)

    print("Admin account created successfully.")


if __name__ == "__main__":
    main()