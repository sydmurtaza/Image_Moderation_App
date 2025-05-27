from fastapi import Depends, HTTPException, status, Header
from typing import Dict, Optional, Tuple

from app.database import get_token, log_usage
from app.models import TokenData

async def get_token_data(
    authorization: Optional[str] = Header(None)
) -> TokenData:
    """
    Dependency to extract and validate the bearer token
    from the Authorization header.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = await get_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return TokenData(**token_data)

async def get_admin_token_data(
    token_data: TokenData = Depends(get_token_data)
) -> TokenData:
    """
    Dependency to ensure the token has admin privileges.
    """
    if not token_data.isAdmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    return token_data

async def log_request(endpoint: str, token_data: TokenData = Depends(get_token_data)):
    """
    Dependency to log the API request.
    """
    await log_usage(token_data.token, endpoint)
    return token_data