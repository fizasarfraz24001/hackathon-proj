import firebase_admin
from firebase_admin import credentials, firestore
import os
from app.config.settings import settings


class FirebaseManager:
    def __init__(self):
        self.app = None
        self.db = None
        self._initialize_firebase()

    def _initialize_firebase(self):
        """Initialize Firebase connection"""
        if not firebase_admin._apps:
            # Prefer credentials JSON file when provided.
            if settings.firebase_credentials_path and os.path.exists(settings.firebase_credentials_path):
                cred = credentials.Certificate(settings.firebase_credentials_path)
                self.app = firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                return

            if not settings.firebase_private_key.strip():
                raise ValueError(
                    "Firebase credentials missing. Set FIREBASE_CREDENTIALS_PATH or FIREBASE_PRIVATE_KEY in backend/.env"
                )

            private_key = settings.firebase_private_key.strip()
            if private_key.startswith('"') and private_key.endswith('"'):
                private_key = private_key[1:-1]
            private_key = private_key.replace("\\n", "\n")

            # Create credentials from environment variables
            cred_dict = {
                "type": "service_account",
                "project_id": settings.firebase_project_id.strip().strip('"'),
                "private_key_id": settings.firebase_private_key_id.strip().strip('"'),
                "private_key": private_key,
                "client_email": settings.firebase_client_email.strip().strip('"'),
                "client_id": settings.firebase_client_id.strip().strip('"'),
                "auth_uri": settings.firebase_auth_uri,
                "token_uri": settings.firebase_token_uri,
                "auth_provider_x509_cert_url": settings.firebase_auth_provider_x509_cert_url,
                "client_x509_cert_url": settings.firebase_client_x509_cert_url.strip().strip('"')
            }

            cred = credentials.Certificate(cred_dict)
            self.app = firebase_admin.initialize_app(cred)
            self.db = firestore.client()

    def get_firestore_client(self):
        """Get Firestore client instance"""
        if self.db is None:
            self._initialize_firebase()
        return self.db


# Global instance
firebase_manager = FirebaseManager()


def get_firestore_db():
    """Dependency to get Firestore client"""
    return firebase_manager.get_firestore_client()