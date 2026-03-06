from datetime import datetime
from typing import Any, Dict, List, Optional

from firebase_admin import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from app.config.database import get_firestore_db


class FirestoreService:
    def __init__(self) -> None:
        self.db = get_firestore_db()

    def _with_timestamps(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        now = datetime.utcnow().isoformat()
        payload["createdAt"] = payload.get("createdAt", now)
        payload["updatedAt"] = now
        return payload

    async def save_assessment(self, user_id: str, payload: Dict[str, Any]) -> str:
        doc_ref = self.db.collection("users").document(user_id).collection("assessments").document()
        doc_ref.set(self._with_timestamps(payload))
        return doc_ref.id

    async def save_recommendation(self, user_id: str, payload: Dict[str, Any]) -> str:
        doc_ref = self.db.collection("users").document(user_id).collection("recommendations").document()
        doc_ref.set(self._with_timestamps(payload))
        return doc_ref.id

    async def save_resume(self, user_id: str, payload: Dict[str, Any]) -> str:
        doc_ref = self.db.collection("users").document(user_id).collection("resumes").document()
        doc_ref.set(self._with_timestamps(payload))
        return doc_ref.id

    async def get_latest_assessment(self, user_id: str) -> Optional[Dict[str, Any]]:
        docs = (
            self.db.collection("users")
            .document(user_id)
            .collection("assessments")
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(1)
            .stream()
        )
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    async def get_latest_recommendation_by_type(self, user_id: str, rec_type: str) -> Optional[Dict[str, Any]]:
        docs = (
            self.db.collection("users")
            .document(user_id)
            .collection("recommendations")
            .where(filter=FieldFilter("type", "==", rec_type))
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(1)
            .stream()
        )
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    async def get_latest_resume(self, user_id: str) -> Optional[Dict[str, Any]]:
        docs = (
            self.db.collection("users")
            .document(user_id)
            .collection("resumes")
            .order_by("createdAt", direction=firestore.Query.DESCENDING)
            .limit(1)
            .stream()
        )
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            return data
        return None

    async def get_user_history(self, user_id: str, limit: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        history: Dict[str, List[Dict[str, Any]]] = {"assessments": [], "recommendations": [], "resumes": []}
        for collection_name in history.keys():
            docs = (
                self.db.collection("users")
                .document(user_id)
                .collection(collection_name)
                .order_by("createdAt", direction=firestore.Query.DESCENDING)
                .limit(limit)
                .stream()
            )
            for doc in docs:
                data = doc.to_dict()
                data["id"] = doc.id
                history[collection_name].append(data)
        return history


firestore_service = FirestoreService()
