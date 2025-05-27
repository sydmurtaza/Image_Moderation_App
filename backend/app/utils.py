import secrets
import time
import hashlib
from typing import Dict, Any, List


def generate_secure_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)

def calculate_token_hash(token: str) -> str:
    """Calculate a hash of the token for storage"""
    hash_object = hashlib.sha256(token.encode())
    return hash_object.hexdigest()

def format_moderation_result(result: Dict[str, Any]) -> Dict[str, Any]:
    """Format the moderation result for the frontend"""
    categories = result.get("categories", [])
    formatted_categories = []
    
    for category in categories:
        severity_color = "green"
        if category["severity"] == "medium":
            severity_color = "yellow"
        elif category["severity"] == "high":
            severity_color = "red"
            
        formatted_categories.append({
            **category,
            "color": severity_color,
            "percentage": int(category["confidence"] * 100)
        })
    
    return {
        **result,
        "categories": formatted_categories,
        "analysis_time_formatted": f"{result['analysis_time']:.2f}s"
    }