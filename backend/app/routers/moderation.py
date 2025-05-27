from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from typing import List, Dict, Any
import time
import io
import random  # For demo purposes only
from PIL import Image

from app.dependencies import get_token_data, log_request
from app.models import TokenData, ModerationResult, ModerationCategory
from app.config import settings

router = APIRouter()

@router.post("/moderate", response_model=ModerationResult)
async def moderate_image(
    file: UploadFile = File(...),
    token_data: TokenData = Depends(get_token_data)
):
    """
    Analyze an uploaded image and return a content-safety report.
    """
    # Log this request
    await log_request("/moderate", token_data)
    
    # Check file size
    file_size = 0
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > settings.MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_IMAGE_SIZE / (1024 * 1024)} MB",
        )
    
    # Check content type
    content_type = file.content_type
    if content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type. Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}",
        )
    
    # Process the image
    # In a real implementation, this would call an AI moderation service
    # For demo purposes, we'll return mock results
    try:
        start_time = time.time()
        
        # Simulate image processing
        time.sleep(0.5)  # Simulate processing time
        
        # In a real implementation, you would analyze the image here
        # For now, we'll return mock results
        is_safe, categories = mock_moderation_analysis()
        
        end_time = time.time()
        analysis_time = end_time - start_time
        
        # Create the moderation result
        moderation_result = ModerationResult(
            safe=is_safe,
            categories=categories,
            analysis_time=analysis_time,
            message="Image analysis complete" if is_safe else "Potentially harmful content detected",
        )
        
        return moderation_result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}",
        )

def mock_moderation_analysis():
    """
    Generate mock moderation results for demo purposes.
    In a real implementation, this would be replaced by actual image analysis.
    """
    # Simulate various moderation categories
    categories = []
    
    # Generate random confidence scores for demo
    violence_confidence = random.uniform(0, 1)
    if violence_confidence > 0.3:
        severity = "low"
        if violence_confidence > 0.6:
            severity = "medium"
        if violence_confidence > 0.8:
            severity = "high"
        categories.append(
            ModerationCategory(
                name="violence",
                confidence=violence_confidence,
                severity=severity
            )
        )
    
    nudity_confidence = random.uniform(0, 1)
    if nudity_confidence > 0.3:
        severity = "low"
        if nudity_confidence > 0.6:
            severity = "medium"
        if nudity_confidence > 0.8:
            severity = "high"
        categories.append(
            ModerationCategory(
                name="nudity",
                confidence=nudity_confidence,
                severity=severity
            )
        )
    
    hate_confidence = random.uniform(0, 1)
    if hate_confidence > 0.3:
        severity = "low"
        if hate_confidence > 0.6:
            severity = "medium"
        if hate_confidence > 0.8:
            severity = "high"
        categories.append(
            ModerationCategory(
                name="hate_symbols",
                confidence=hate_confidence,
                severity=severity
            )
        )
        
    # Determine if the image is safe based on thresholds
    is_safe = all(cat.confidence < settings.MODERATION_THRESHOLD for cat in categories)
    
    return is_safe, categories