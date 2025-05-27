from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import auth, moderation
from app.dependencies import get_token_data
from app.config import settings

app = FastAPI(
    title="Image Moderation API",
    description="API for moderating images to detect harmful content",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(moderation.router, tags=["moderation"])

# Mount static files for frontend
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all requests to the API"""
    # Skip logging for static files
    if request.url.path.startswith(("/static/", "/favicon.ico")):
        return await call_next(request)
    
    response = await call_next(request)
    return response

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}