#!/bin/bash

# SprintSync GCP Deployment Script for Demo (SQLite)
# This script builds and deploys the SprintSync application to Google Cloud Run using SQLite

set -e  # Exit on any error

echo "🚀 SprintSync GCP Deployment (Demo with SQLite)"
echo "============================================="

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

# Build the Docker image for amd64/linux platform (required by Cloud Run)
echo "🔧 Building Docker image for amd64/linux platform..."
cd $(dirname "$0")/..
docker build --platform linux/amd64 -t gcr.io/$PROJECT_ID/$IMAGE_NAME .

# Push to Google Container Registry
echo "📤 Pushing image to Google Container Registry..."
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

# Deploy to Cloud Run with SQLite configuration and demo seeding enabled
echo "🚀 Deploying to Cloud Run (using SQLite for demo with auto-seeding)..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --set-env-vars ENVIRONMENT=development,SEED_DEMO_DATA=true \
    --set-secrets JWT_SECRET_KEY=sprintsync-jwt-secret:latest,OPENAI_API_KEY=sprintsync-openai-key:latest

echo "✅ Demo deployment completed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo "🌐 Your demo application is available at: $SERVICE_URL"
echo ""
echo "Demo Instructions:"
echo "1. Visit the URL above to access the API"
echo "2. The database will be automatically seeded with demo data on first access"
echo "3. Use the following credentials to log in:"
echo "   Admin User - Email: admin@example.com, Password: admin123"
echo "   Regular User - Email: john@example.com, Password: demo123"
echo ""
echo "💡 Note: It may take a minute for the database to be seeded on first access."