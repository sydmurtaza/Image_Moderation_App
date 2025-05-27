from pydantic_settings import BaseSettings
from typing import List
from datetime import timedelta

class Settings(BaseSettings):
    # MongoDB settings
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "image_moderation"
    
    # Authentication settings
    TOKEN_SECRET_KEY: str = "abc1234xyz"  
    TOKEN_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:7000", "http://localhost:3000"]
    
    # API settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    
    # Content moderation confidence thresholds
    MODERATION_THRESHOLD: float = 0.7
    
    class Config:
        env_file = ".env"

settings = Settings()