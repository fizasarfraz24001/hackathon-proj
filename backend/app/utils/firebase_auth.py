import firebase_admin
from firebase_admin import auth
from typing import Optional
from app.models.user import UserInDB
from app.config.database import get_firestore_db


async def verify_firebase_token(token: str) -> Optional[str]:
    """Verify Firebase ID token and return user ID"""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        print(f"Error verifying Firebase token: {e}")
        return None


async def get_user_from_firebase(firebase_uid: str) -> Optional[UserInDB]:
    """Get user details from Firestore using Firebase UID"""
    try:
        db = get_firestore_db()
        user_doc = db.collection('users').document(firebase_uid).get()

        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_data['firebase_uid'] = firebase_uid
            return UserInDB(**user_data)
        return None
    except Exception as e:
        print(f"Error getting user from Firebase: {e}")
        return None


async def create_user_in_firebase(user_data: dict) -> bool:
    """Create user in Firestore"""
    try:
        db = get_firestore_db()
        user_ref = db.collection('users').document(user_data['firebase_uid'])
        user_ref.set(user_data)
        return True
    except Exception as e:
        print(f"Error creating user in Firebase: {e}")
        return False