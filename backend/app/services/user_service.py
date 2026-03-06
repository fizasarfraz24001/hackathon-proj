from typing import Optional
from app.models.user import UserCreate, UserUpdate, UserInDB
from app.config.database import get_firestore_db


class UserService:
    """Service class for user management"""

    def __init__(self):
        self.db = get_firestore_db()

    async def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[UserInDB]:
        """Get user by Firebase UID"""
        try:
            user_doc = self.db.collection('users').document(firebase_uid).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                user_data['firebase_uid'] = firebase_uid
                return UserInDB(**user_data)
            return None
        except Exception as e:
            print(f"Error getting user: {e}")
            return None

    async def create_user(self, user_create: UserCreate) -> Optional[UserInDB]:
        """Create a new user"""
        try:
            user_data = user_create.dict()
            user_ref = self.db.collection('users').document(user_create.firebase_uid)

            # Check if user already exists
            if user_ref.get().exists:
                return None  # User already exists

            user_ref.set(user_data)
            return UserInDB(**user_data)
        except Exception as e:
            print(f"Error creating user: {e}")
            return None

    async def update_user(self, firebase_uid: str, user_update: UserUpdate) -> Optional[UserInDB]:
        """Update user information"""
        try:
            user_ref = self.db.collection('users').document(firebase_uid)
            user_doc = user_ref.get()

            if not user_doc.exists:
                return None

            # Prepare update data
            update_data = {}
            for field, value in user_update.dict(exclude_unset=True).items():
                if value is not None:
                    update_data[field] = value

            if update_data:
                user_ref.update(update_data)

            # Get updated user
            updated_doc = user_ref.get()
            updated_data = updated_doc.to_dict()
            updated_data['firebase_uid'] = firebase_uid

            return UserInDB(**updated_data)
        except Exception as e:
            print(f"Error updating user: {e}")
            return None