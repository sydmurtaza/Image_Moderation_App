from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
import uuid
import secrets

class TokenBase(BaseModel):
    token: str
    isAdmin: bool = False

class TokenCreate(BaseModel):
    isAdmin: bool = False
    
    @classmethod
    def generate(cls, is_admin: bool = False) -> "TokenCreate":
        return cls(isAdmin=is_admin)

class TokenData(TokenBase):
    createdAt: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(TokenBase):
    createdAt: datetime
    
    class Config:
        from_attributes = True

class UsageLog(BaseModel):
    token: str
    endpoint: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ImageUpload(BaseModel):
    file_content: bytes
    content_type: str
    
    class Config:
        arbitrary_types_allowed = True

class ModerationCategory(BaseModel):
    name: str
    confidence: float
    severity: str  # "low", "medium", "high"

class ModerationResult(BaseModel):
    safe: bool
    categories: List[ModerationCategory]
    analysis_time: float  # in seconds
    message: str