from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import secrets

from app.dependencies import get_admin_token_data, log_request
from app.models import TokenCreate, TokenResponse, TokenData
from app.database import create_token, get_all_tokens, delete_token

router = APIRouter()

@router.post("/tokens", response_model=TokenResponse)
async def create_new_token(
    token_create: TokenCreate = TokenCreate.generate(),
    admin_token: TokenData = Depends(get_admin_token_data)
):
    """
    Create a new token. Only accessible to admin tokens.
    If no token is provided, a random one will be generated.
    """
    # Generate a random token if not provided
    token_value = secrets.token_urlsafe(32)
    
    # Create the token in the database
    token_data = await create_token(token_value, token_create.isAdmin)
    
    # Return the created token
    return TokenResponse(**token_data)

@router.get("/tokens", response_model=List[TokenResponse])
async def get_tokens(
    admin_token: TokenData = Depends(get_admin_token_data),
):
    """
    Get all tokens. Only accessible to admin tokens.
    """
    tokens = await get_all_tokens()
    return [TokenResponse(**token) for token in tokens]

@router.delete("/tokens/{token}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_token_endpoint(
    token: str,
    admin_token: TokenData = Depends(get_admin_token_data),
):
    """
    Delete a token. Only accessible to admin tokens.
    """
    deleted = await delete_token(token)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found",
        )
    return None