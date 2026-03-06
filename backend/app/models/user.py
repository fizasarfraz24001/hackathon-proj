from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from .base import TimestampMixin, UUIDMixin


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    education_level: str = "University Student"
    current_skills: List[str] = []
    career_interests: List[str] = []
    career_goals: Optional[str] = None


class UserCreate(UserBase):
    firebase_uid: str
    password_hash: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    education_level: Optional[str] = None
    current_skills: Optional[List[str]] = None
    career_interests: Optional[List[str]] = None
    career_goals: Optional[str] = None


class UserInDB(UserBase, UUIDMixin, TimestampMixin):
    firebase_uid: str
    is_active: bool = True
    last_login: Optional[datetime] = None