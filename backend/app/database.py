from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import List, Dict, Optional, Any
from bson import ObjectId

from app.config import settings

# MongoDB client
client = AsyncIOMotorClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

# Collections
tokens_collection = db["tokens"]
usages_collection = db["usages"]

# Token operations
async def create_token(token: str, is_admin: bool = False) -> Dict[str, Any]:
    """Create a new token in the database"""
    token_data = {
        "token": token,
        "isAdmin": is_admin,
        "createdAt": datetime.utcnow(),
    }
    await tokens_collection.insert_one(token_data)
    return token_data

async def get_token(token: str) -> Optional[Dict[str, Any]]:
    """Get a token from the database"""
    return await tokens_collection.find_one({"token": token})

async def get_all_tokens() -> List[Dict[str, Any]]:
    """Get all tokens from the database"""
    cursor = tokens_collection.find()
    return [token async for token in cursor]

async def delete_token(token: str) -> bool:
    """Delete a token from the database"""
    result = await tokens_collection.delete_one({"token": token})
    return result.deleted_count > 0

# Usage operations
async def log_usage(token: str, endpoint: str) -> Dict[str, Any]:
    """Log a new API usage"""
    usage_data = {
        "token": token,
        "endpoint": endpoint,
        "timestamp": datetime.utcnow(),
    }
    await usages_collection.insert_one(usage_data)
    return usage_data

async def get_token_usage(token: str) -> List[Dict[str, Any]]:
    """Get all usages for a specific token"""
    cursor = usages_collection.find({"token": token})
    return [usage async for usage in cursor]

# Initialize the database with indexes
async def init_db():
    """Initialize database with required indexes"""
    # Create index on token for faster lookups
    await tokens_collection.create_index("token", unique=True)
    # Create index on timestamp for efficient queries
    await usages_collection.create_index("timestamp")
    # Create compound index on token and endpoint
    await usages_collection.create_index([("token", 1), ("endpoint", 1)])