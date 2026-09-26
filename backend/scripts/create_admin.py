from getpass import getpass
from datetime import datetime, timezone

from database.mongodb import users_collection
from services.auth_service import hash_password


def main():
    name = input("Admin name: ").strip()
    email = input("Admin email: ").strip().lower()
    password = getpass("Admin password: ")

    existing_user = users_collection.find_one(
        {"email": email}
    )

    if existing_user:
        users_collection.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "name": name,
                    "password_hash": hash_password(password),
                    "role": "admin",
                }
            },
        )

        print("Existing user promoted to admin.")
        return

    user = {
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "role": "admin",
        "created_at": datetime.now(timezone.utc),
    }

    users_collection.insert_one(user)

    print("Admin user created successfully.")


if __name__ == "__main__":
    main()