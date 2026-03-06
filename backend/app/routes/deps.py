import logging

from fastapi import Header, HTTPException, status
from firebase_admin import auth

logger = logging.getLogger(__name__)


async def get_current_user_id(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = authorization.replace("Bearer ", "", 1).strip()
    try:
        # Allow small local clock drift to reduce intermittent auth failures.
        decoded = auth.verify_id_token(token, check_revoked=False, clock_skew_seconds=60)
        return decoded["uid"]
    except Exception as exc:
        logger.warning("Firebase token verification failed: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token",
        ) from exc
