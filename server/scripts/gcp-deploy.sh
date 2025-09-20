#!/bin/bash

# SprintSync GCP Deployment Script (SQLite version)
# This script builds and deploys the SprintSync application to Google Cloud Run using SQLite

set -e  # Exit on any error

echo "🚀 SprintSync GCP Deployment (SQLite version)"
echo "=========================================="

# Check if required tools are installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found. Please install it first."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install it first."
    exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID found. Please set up gcloud first."
    exit 1
fi

echo "Using project: $PROJECT_ID"

# Configuration
IMAGE_NAME="sprintsync-backend"
REGION="us-central1"
SERVICE_NAME="sprintsync-backend"

# Check if we're using service account key authentication
if gcloud auth list --format="value(type)" | grep -q "service_account"; then
    echo "🔑 Using service account authentication"
    # For service account authentication, we might need to handle secrets differently
    # Check if secrets exist, if not, we'll need to create them
else
    echo "👤 Using user account authentication"
fi

# Build the Docker image for amd64/linux platform (required by Cloud Run)
echo "🔧 Building Docker image for amd64/linux platform..."
cd $(dirname "$0")/..
docker build --platform linux/amd64 -t gcr.io/$PROJECT_ID/$IMAGE_NAME .

# Push to Google Container Registry
echo "📤 Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

# Deploy to Cloud Run (without Cloud SQL)
echo "🚀 Deploying to Cloud Run (using SQLite)..."

# Deploy the service with secret references but without Cloud SQL connection
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars ENVIRONMENT=development \
    --set-secrets JWT_SECRET_KEY=sprintsync-jwt-secret:latest,OPENAI_API_KEY=sprintsync-openai-key:latest

echo "✅ Deployment completed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "🌐 Your application is available at: $SERVICE_URL"