from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4


class BaseResponse(BaseModel):
    """Base response model with standard fields"""
    success: bool = True
    message: str = "Request processed successfully"
    timestamp: datetime = datetime.now()


class TimestampMixin(BaseModel):
    """Mixin for timestamp fields"""
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()


class UUIDMixin(BaseModel):
    """Mixin for UUID fields"""
    id: UUID = uuid4()


class PaginatedResponse(BaseResponse):
    """Response model with pagination support"""
    data: list
    total: int
    page: int = 1
    limit: int = 10
    has_more: bool = False