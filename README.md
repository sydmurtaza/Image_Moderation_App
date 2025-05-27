
# Image Moderation API

A secure FastAPI-based service for detecting and blocking harmful imagery.

## Features

- **Automatic Content Detection**: Analyze images for harmful content
- **Secure Authentication**: Bearer token authentication system
- **Role-Based Authorization**: Admin-only endpoints for token management
- **Usage Tracking**: Monitor API usage per token
- **Clean UI**: Modern interface for easy interaction with the API
- **Docker Support**: Containerized for easy deployment

## Architecture

- **Backend**: Python + FastAPI
- **Database**: MongoDB
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd image-moderation-api
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the frontend at http://localhost:3000 or the API directly at http://localhost:7000

## API Endpoints

### Authentication (Admin-Only)

- `POST /auth/tokens` - Create a new token
- `GET /auth/tokens` - List all tokens
- `DELETE /auth/tokens/{token}` - Delete a token

### Moderation

- `POST /moderate` - Analyze an uploaded image

## Authentication

All API endpoints require a valid bearer token in the `Authorization: Bearer <token>` header.

## Docker Services

- `mongodb`: MongoDB database.
- `backend`: FastAPI backend service.
- `frontend`: Frontend web interface.

## Development

This project follows a Git workflow with feature branches and code reviews:

1. Create a feature branch from `main`
2. Make changes and commit to your branch
3. Open a Pull Request for review
4. Merge into `main` after approval


