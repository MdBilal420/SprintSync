#!/bin/bash

# SprintSync GCP Deployment Script
# This script builds and deploys the SprintSync application to Google Cloud Run

set -e  # Exit on any error

echo "🚀 SprintSync GCP Deployment"
echo "==========================="

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

# Database configuration
echo "Configure database:"
echo "1. SQLite (development)"
echo "2. Cloud SQL (production - default)"
read -p "Enter choice (1 or 2): " DB_CHOICE

if [ "$DB_CHOICE" != "1" ]; then
    # Default to Cloud SQL (production)
    DB_CHOICE="2"
fi

# Check if we're using service account key authentication
if gcloud auth list --format="value(type)" | grep -q "service_account"; then
    echo "🔑 Using service account authentication"
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

# Deploy to Cloud Run
if [ "$DB_CHOICE" = "2" ]; then
    echo "🚀 Deploying to Cloud Run (using Cloud SQL)..."
    
    # Deploy with Cloud SQL configuration
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars ENVIRONMENT=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,CLOUD_SQL_INSTANCE=sprintsync-instance,CLOUD_SQL_DATABASE=sprintsyncdb,CLOUD_SQL_USERNAME=sprintsync_user,CLOUD_SQL_REGION=us-central1 \
        --set-secrets JWT_SECRET_KEY=sprintsync-jwt-secret:latest,OPENAI_API_KEY=sprintsync-openai-key:latest,CLOUD_SQL_PASSWORD=sprintsync-db-password:latest
else
    echo "🚀 Deploying to Cloud Run (using SQLite)..."
    
    # Deploy with SQLite configuration
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars ENVIRONMENT=development \
        --set-secrets JWT_SECRET_KEY=sprintsync-jwt-secret:latest,OPENAI_API_KEY=sprintsync-openai-key:latest
fi

echo "✅ Deployment completed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "🌐 Your application is available at: $SERVICE_URL"